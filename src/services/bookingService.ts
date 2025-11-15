import { PrismaClient } from '../generated/prisma';
import { SystemLogService } from './systemLogService';
import { EmailService } from './emailService';

export interface Booking {
  id: string;
  slotId: string;
  visitorId: string;
  status: string;
  groupSize: number;
  notes?: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  // Visitor summary for visibility
  visitor?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    visitorType?: string;
    specialRequirements?: string;
  };
  // Slot summary for visibility
  slot?: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    capacity: number;
    bookedCount: number;
    description?: string;
  };
}

export class BookingService {
  private prisma: PrismaClient;
  private systemLogService: SystemLogService;
  private emailService: EmailService;

  constructor() {
    this.prisma = new PrismaClient();
    this.systemLogService = new SystemLogService();
    this.emailService = new EmailService();
  }

  // Generate unique tracking token
  private generateTrackingToken(): string {
    // Generate a 12-character alphanumeric token (uppercase for readability)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0, O, I, 1
    let token = '';
    for (let i = 0; i < 12; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Ensure unique tracking token
  private async ensureUniqueTrackingToken(): Promise<string> {
    let token: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      token = this.generateTrackingToken();
      const existing = await this.prisma.booking.findUnique({
        where: { trackingToken: token }
      });
      if (!existing) {
        isUnique = true;
        return token;
      }
      attempts++;
    }

    // Fallback: use UUID-based token if we can't generate a unique short token
    return `TRK-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }

  async createBooking(bookingData: {
    slotId: string;
    visitorId: string;
    groupSize: number;
    specialRequests?: string;
  }, userId: string): Promise<Booking> {
    
    // Validate slot availability
    await this.validateSlotAvailability(bookingData.slotId, bookingData.groupSize);

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        slotId: bookingData.slotId,
        visitorId: bookingData.visitorId,
        status: 'tentative',
        groupSize: bookingData.groupSize,
        specialRequests: bookingData.specialRequests || null,
        createdBy: userId
      }
    });

    // Update slot booked count and status
    await this.updateSlotBookedCount(bookingData.slotId);
    await this.updateSlotStatus(bookingData.slotId);

    // Get visitor and slot information for logging
    const [visitor, slot] = await Promise.all([
      this.prisma.visitor.findUnique({ where: { id: bookingData.visitorId } }),
      this.prisma.visitSlot.findUnique({ where: { id: bookingData.slotId } })
    ]);

    // Log the booking creation
    try {
      await this.systemLogService.logBookingCreated({
        bookingId: booking.id,
        visitorName: visitor?.name || 'Unknown Visitor',
        slotDate: slot?.date.toISOString().split('T')[0] || 'Unknown Date',
        slotTime: slot?.startTime || 'Unknown Time',
        groupSize: bookingData.groupSize,
        userId: userId
      });
    } catch (logError) {
      // Don't fail the main operation if logging fails
      console.error('Failed to log booking creation:', logError);
    }
    
    return this.transformBooking(booking);
  }

  async confirmBooking(bookingId: string, userId: string): Promise<Booking> {
    // Get booking with full relations before updating
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        visitor: true,
        slot: true
      }
    });

    if (!existingBooking) {
      throw new Error('Booking not found');
    }

    const booking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'confirmed',
        confirmedAt: new Date()
      },
      include: {
        visitor: true,
        slot: true
      }
    });

    // Update slot booked count and status
    await this.updateSlotBookedCount(booking.slotId);
    await this.updateSlotStatus(booking.slotId);
    
    // Send confirmation email if visitor has email
    if (booking.visitor?.email && booking.trackingToken) {
      try {
        const slotDate = new Date(booking.slot.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        await this.emailService.sendBookingConfirmationEmail({
          visitorName: booking.visitor.name,
          visitorEmail: booking.visitor.email,
          slotDate: slotDate,
          slotTime: booking.slot.startTime?.substring(0, 5) || 'Unknown',
          slotEndTime: booking.slot.endTime?.substring(0, 5) || 'Unknown',
          groupSize: booking.groupSize,
          trackingToken: booking.trackingToken,
          specialRequests: booking.specialRequests || undefined
        });
      } catch (emailError) {
        // Don't fail the booking confirmation if email fails
        console.error('Failed to send confirmation email:', emailError);
      }
    }
    
    return this.transformBooking(booking);
  }

  async cancelBooking(bookingId: string, reason: string, userId: string): Promise<Booking> {
    // Prevent cancelling completed bookings
    const current = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (current && current.status === 'completed') {
      throw new Error('Completed bookings cannot be modified');
    }

    const booking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason
      }
    });

    // Update slot booked count and status
    await this.updateSlotBookedCount(booking.slotId);
    await this.updateSlotStatus(booking.slotId);

    // Get visitor and slot information for logging
    const [visitor, slot] = await Promise.all([
      this.prisma.visitor.findUnique({ where: { id: booking.visitorId } }),
      this.prisma.visitSlot.findUnique({ where: { id: booking.slotId } })
    ]);

    // Log the booking cancellation
    try {
      await this.systemLogService.logBookingCancelled({
        bookingId: booking.id,
        visitorName: visitor?.name || 'Unknown Visitor',
        slotDate: slot?.date.toISOString().split('T')[0] || 'Unknown Date',
        slotTime: slot?.startTime || 'Unknown Time',
        reason: reason,
        userId: userId
      });
    } catch (logError) {
      // Don't fail the main operation if logging fails
      console.error('Failed to log booking cancellation:', logError);
    }
    
    return this.transformBooking(booking);
  }

  async getBookings(filters: {
    slotId?: string;
    visitorId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{bookings: Booking[], total: number}> {
    
    const where: any = {};

    if (filters.slotId) where.slotId = filters.slotId;
    if (filters.visitorId) where.visitorId = filters.visitorId;
    if (filters.status) where.status = filters.status;

    const limit = filters.limit || 20;
    const skip = ((filters.page || 1) - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          slot: true,
          visitor: true,
          creator: true,
          smsStatus: true,
          emailStatus: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.booking.count({ where })
    ]);

    return {
      bookings: bookings.map(booking => this.transformBooking(booking)),
      total
    };
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        slot: true,
        visitor: true,
        creator: true,
        smsStatus: true,
        emailStatus: true
      }
    });

    return booking ? this.transformBooking(booking) : null;
  }

  async updateBooking(id: string, updates: Partial<Booking>, userId: string): Promise<Booking> {
    // Prevent updates to completed bookings (except no changes allowed)
    const current = await this.prisma.booking.findUnique({ 
      where: { id },
      include: {
        visitor: true,
        slot: true
      }
    });
    
    if (current && current.status === 'completed') {
      throw new Error('Completed bookings cannot be modified');
    }

    // Check if status is being changed to confirmed
    const isBeingConfirmed = updates.status === 'confirmed' && current?.status !== 'confirmed';

    // Prepare update data
    const updateData: any = {};
    
    if (updates.status) {
      updateData.status = updates.status;
      if (updates.status === 'confirmed' && !current?.confirmedAt) {
        updateData.confirmedAt = new Date();
      }
    }
    if (updates.groupSize) updateData.groupSize = updates.groupSize;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.specialRequests !== undefined) updateData.specialRequests = updates.specialRequests;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const booking = await this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        visitor: true,
        slot: true
      }
    });

    // Update slot booked count and status if group size changed
    if (updates.groupSize) {
      await this.updateSlotBookedCount(booking.slotId);
      await this.updateSlotStatus(booking.slotId);
    }

    // Send confirmation email if booking is being confirmed
    if (isBeingConfirmed && booking.visitor?.email && booking.trackingToken) {
      try {
        const slotDate = new Date(booking.slot.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        await this.emailService.sendBookingConfirmationEmail({
          visitorName: booking.visitor.name,
          visitorEmail: booking.visitor.email,
          slotDate: slotDate,
          slotTime: booking.slot.startTime?.substring(0, 5) || 'Unknown',
          slotEndTime: booking.slot.endTime?.substring(0, 5) || 'Unknown',
          groupSize: booking.groupSize,
          trackingToken: booking.trackingToken,
          specialRequests: booking.specialRequests || undefined
        });
      } catch (emailError) {
        // Don't fail the booking update if email fails
        console.error('Failed to send confirmation email:', emailError);
      }
    }

    return this.transformBooking(booking);
  }

  private async validateSlotAvailability(slotId: string, groupSize: number): Promise<void> {
    const slot = await this.prisma.visitSlot.findUnique({
      where: { id: slotId }
    });
    
    if (!slot) {
      throw new Error('Slot not found');
    }
    
    if (slot.status !== 'available') {
      throw new Error('Slot is not available for booking');
    }

    // Calculate actual booked capacity from bookings (not cached bookedCount)
    const bookings = await this.prisma.booking.aggregate({
      where: {
        slotId,
        status: {
          in: ['confirmed', 'tentative']
        }
      },
      _sum: { groupSize: true }
    });

    const totalBookedCapacity = bookings._sum.groupSize || 0;
    const availableCapacity = slot.capacity - totalBookedCapacity;

    if (groupSize > availableCapacity) {
      throw new Error(`Not enough capacity. Available: ${availableCapacity}, Requested: ${groupSize}`);
    }
  }

  private async updateSlotBookedCount(slotId: string): Promise<void> {
    const bookedCount = await this.prisma.booking.aggregate({
      where: {
        slotId,
        status: {
          in: ['confirmed', 'tentative']
        }
      },
      _sum: { groupSize: true }
    });

    await this.prisma.visitSlot.update({
      where: { id: slotId },
      data: { bookedCount: bookedCount._sum.groupSize || 0 }
    });
  }

  private async updateSlotStatus(slotId: string): Promise<void> {
    // Get current slot info
    const slot = await this.prisma.visitSlot.findUnique({
      where: { id: slotId },
      select: { capacity: true, bookedCount: true, date: true, startTime: true, status: true }
    });

    if (!slot) return;

    // Determine new status including expiry
    // Valid SlotStatus values: available, booked, cancelled, maintenance, expired
    let newStatus: 'available' | 'booked' | 'cancelled' | 'maintenance' | 'expired';
    const now = new Date();
    const slotDate = new Date(slot.date as any);
    const [hStr, mStr, sStr] = String(slot.startTime || '00:00:00').split(':');
    const h = parseInt(hStr || '0', 10);
    const m = parseInt(mStr || '0', 10);
    const s = parseInt(sStr || '0', 10);
    const slotStart = new Date(slotDate);
    slotStart.setHours(h, m, s || 0, 0);
    
    // Don't change status if it's cancelled or maintenance
    if (slot.status === 'cancelled' || slot.status === 'maintenance') {
      return;
    }
    
    if (now > slotStart) {
      newStatus = 'expired';
    } else if (slot.bookedCount >= slot.capacity) {
      newStatus = 'booked';
    } else {
      // If there are bookings but not fully booked, keep as 'available'
      // (there's no 'partially_booked' status in the enum)
      newStatus = 'available';
    }

    // Update slot status
    await this.prisma.visitSlot.update({
      where: { id: slotId },
      data: { status: newStatus as any }
    });
  }

  // Public method to get slot for availability check
  async getSlotForAvailability(slotId: string): Promise<{ id: string; capacity: number; status: string } | null> {
    const slot = await this.prisma.visitSlot.findUnique({
      where: { id: slotId },
      select: {
        id: true,
        capacity: true,
        status: true,
      }
    });

    return slot ? {
      id: slot.id,
      capacity: slot.capacity,
      status: slot.status
    } : null;
  }

  // Public method to get bookings for a slot
  async getBookingsForSlot(slotId: string): Promise<Array<{ status: string; groupSize: number }>> {
    const bookings = await this.prisma.booking.findMany({
      where: { slotId },
      select: {
        status: true,
        groupSize: true,
      }
    });

    return bookings;
  }

  // Public method to create booking with visitor data (no auth required)
  async createPublicBooking(bookingData: {
    slotId: string;
    visitor: {
      name: string;
      email: string;
      phone?: string;
      organization?: string;
      visitorType?: string;
      specialRequirements?: string;
      country?: string;
    };
    groupSize: number;
    specialRequests?: string;
    gcashNumber?: string;
    referenceNumber?: string;
  }): Promise<Booking & { trackingToken: string }> {
    // Validate slot availability
    await this.validateSlotAvailability(bookingData.slotId, bookingData.groupSize);

    // Check if visitor exists by email, or create new one
    let visitor = await this.prisma.visitor.findFirst({
      where: { email: bookingData.visitor.email }
    });

    if (!visitor) {
      visitor = await this.prisma.visitor.create({
        data: {
          name: bookingData.visitor.name,
          email: bookingData.visitor.email,
          phone: bookingData.visitor.phone || null,
          organization: bookingData.visitor.organization || null,
          visitorType: (bookingData.visitor.visitorType as any) || 'individual',
          specialRequirements: bookingData.visitor.specialRequirements || null,
          country: bookingData.visitor.country || 'US'
        }
      });
    }

    // Generate unique tracking token
    const trackingToken = await this.ensureUniqueTrackingToken();

    // Create booking with tracking token
    const booking = await this.prisma.booking.create({
      data: {
        slotId: bookingData.slotId,
        visitorId: visitor.id,
        status: 'tentative',
        groupSize: bookingData.groupSize,
        specialRequests: bookingData.specialRequests || null,
        trackingToken: trackingToken,
        createdBy: null, // Public booking, no user
        gcashNumber: bookingData.gcashNumber || null,
        referenceNumber: bookingData.referenceNumber || null
      }
    });

    // Update slot booked count and status
    await this.updateSlotBookedCount(bookingData.slotId);
    await this.updateSlotStatus(bookingData.slotId);

    // Log the booking creation (skip if no system user)
    try {
      const slot = await this.prisma.visitSlot.findUnique({ where: { id: bookingData.slotId } });
      await this.systemLogService.logBookingCreated({
        bookingId: booking.id,
        visitorName: visitor.name,
        slotDate: slot?.date.toISOString().split('T')[0] || 'Unknown Date',
        slotTime: slot?.startTime || 'Unknown Time',
        groupSize: bookingData.groupSize,
        userId: null // Public booking
      });
    } catch (logError) {
      console.error('Failed to log booking creation:', logError);
    }

    const transformedBooking = this.transformBooking(booking);
    return {
      ...transformedBooking,
      trackingToken: trackingToken
    } as Booking & { trackingToken: string };
  }

  // Track booking by email and token
  async trackBooking(email: string, trackingToken: string): Promise<Booking | null> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        trackingToken: trackingToken,
        visitor: {
          email: email
        }
      },
      include: {
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            capacity: true,
            description: true,
            status: true
          }
        },
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            organization: true,
            visitorType: true
          }
        }
      }
    });

    if (!booking) {
      return null;
    }

    return this.transformBooking(booking);
  }

  // Cancel booking by email and token (public, no auth required)
  async cancelPublicBooking(email: string, trackingToken: string, reason: string): Promise<Booking> {
    // First verify ownership and check status by finding the booking
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        trackingToken: trackingToken,
        visitor: {
          email: email
        }
      },
      include: {
        visitor: true,
        slot: true
      }
    });

    if (!existingBooking) {
      throw new Error('Booking not found. Please check your email and tracking token.');
    }

    // Prevent cancelling completed or already cancelled bookings
    if (existingBooking.status === 'completed') {
      throw new Error('Completed bookings cannot be cancelled');
    }

    if (existingBooking.status === 'cancelled') {
      throw new Error('This booking has already been cancelled');
    }

    // Update the booking status using email and trackingToken in where clause
    const updateResult = await this.prisma.booking.updateMany({
      where: { 
        trackingToken: trackingToken,
        visitor: {
          email: email
        },
        status: {
          not: 'completed' // Also prevent updating completed bookings at the database level
        }
      },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason
      }
    });

    if (updateResult.count === 0) {
      throw new Error('Booking not found or cannot be cancelled. Please check your email and tracking token.');
    }

    // Fetch the updated booking with all relations
    const cancelledBooking = await this.prisma.booking.findFirst({
      where: {
        trackingToken: trackingToken,
        visitor: {
          email: email
        }
      },
      include: {
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            capacity: true,
            description: true,
            status: true
          }
        },
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            organization: true,
            visitorType: true
          }
        }
      }
    });

    if (!cancelledBooking) {
      throw new Error('Failed to retrieve updated booking');
    }

    // Update slot booked count and status
    await this.updateSlotBookedCount(cancelledBooking.slotId);
    await this.updateSlotStatus(cancelledBooking.slotId);

    // Log the booking cancellation (without userId since it's public)
    try {
      await this.systemLogService.logBookingCancelled({
        bookingId: cancelledBooking.id,
        visitorName: cancelledBooking.visitor.name || 'Unknown Visitor',
        slotDate: cancelledBooking.slot.date.toISOString().split('T')[0],
        slotTime: cancelledBooking.slot.startTime || 'Unknown Time',
        reason: reason,
        userId: null
      });
    } catch (logError) {
      // Don't fail the main operation if logging fails
      console.error('Failed to log booking cancellation:', logError);
    }
    
    return this.transformBooking(cancelledBooking);
  }

  // Update booking by email and token (public, no auth required)
  async updatePublicBooking(
    email: string,
    trackingToken: string,
    updates: { groupSize?: number; specialRequests?: string; notes?: string; gcashNumber?: string; referenceNumber?: string }
  ): Promise<Booking> {
    // First verify ownership and check status by finding the booking
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        trackingToken: trackingToken,
        visitor: {
          email: email
        }
      },
      include: {
        visitor: true,
        slot: true
      }
    });

    if (!existingBooking) {
      throw new Error('Booking not found. Please check your email and tracking token.');
    }

    // Prevent updating completed or cancelled bookings
    if (existingBooking.status === 'completed') {
      throw new Error('Completed bookings cannot be modified');
    }

    if (existingBooking.status === 'cancelled') {
      throw new Error('Cancelled bookings cannot be modified');
    }

    // Validate group size if being updated
    if (updates.groupSize !== undefined && updates.groupSize !== existingBooking.groupSize) {
      if (updates.groupSize <= 0) {
        throw new Error('Group size must be greater than 0');
      }

      // Check if new group size fits in available capacity
      const currentBookings = await this.prisma.booking.aggregate({
        where: {
          slotId: existingBooking.slotId,
          status: { in: ['tentative', 'confirmed'] },
          id: { not: existingBooking.id } // Exclude current booking
        },
        _sum: { groupSize: true }
      });

      const availableCapacity = existingBooking.slot.capacity - (currentBookings._sum.groupSize || 0);
      const additionalCapacityNeeded = updates.groupSize - existingBooking.groupSize;

      if (additionalCapacityNeeded > availableCapacity) {
        throw new Error(`Not enough capacity. Available: ${availableCapacity}, Additional needed: ${additionalCapacityNeeded}`);
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (updates.groupSize !== undefined) updateData.groupSize = updates.groupSize;
    if (updates.specialRequests !== undefined) updateData.specialRequests = updates.specialRequests;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.gcashNumber !== undefined) updateData.gcashNumber = updates.gcashNumber || null;
    if (updates.referenceNumber !== undefined) updateData.referenceNumber = updates.referenceNumber || null;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    // Update the booking using email and trackingToken in where clause
    const updateResult = await this.prisma.booking.updateMany({
      where: {
        trackingToken: trackingToken,
        visitor: {
          email: email
        },
        status: {
          notIn: ['completed', 'cancelled']
        }
      },
      data: updateData
    });

    if (updateResult.count === 0) {
      throw new Error('Booking not found or cannot be updated. Please check your email and tracking token.');
    }

    // Fetch the updated booking with all relations
    const updatedBooking = await this.prisma.booking.findFirst({
      where: {
        trackingToken: trackingToken,
        visitor: {
          email: email
        }
      },
      include: {
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            capacity: true,
            description: true,
            status: true
          }
        },
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            organization: true,
            visitorType: true
          }
        }
      }
    });

    if (!updatedBooking) {
      throw new Error('Failed to retrieve updated booking');
    }

    // Update slot booked count and status if group size changed
    if (updates.groupSize !== undefined) {
      await this.updateSlotBookedCount(updatedBooking.slotId);
      await this.updateSlotStatus(updatedBooking.slotId);
    }

    return this.transformBooking(updatedBooking);
  }

  private transformBooking(data: any): Booking & { trackingToken?: string; smsStatus?: any; emailStatus?: any; gcashNumber?: string; referenceNumber?: string } {
    return {
      id: data.id,
      slotId: data.slotId,
      visitorId: data.visitorId,
      status: data.status,
      groupSize: data.groupSize,
      notes: data.notes,
      specialRequests: data.specialRequests,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      confirmedAt: data.confirmedAt,
      cancelledAt: data.cancelledAt,
      cancellationReason: data.cancellationReason,
      trackingToken: data.trackingToken || undefined,
      gcashNumber: data.gcashNumber || undefined,
      referenceNumber: data.referenceNumber || undefined,
      // Include visitor summary if available
      visitor: data.visitor ? {
        id: data.visitor.id,
        name: data.visitor.name,
        email: data.visitor.email,
        phone: data.visitor.phone,
        organization: data.visitor.organization,
        visitorType: data.visitor.visitorType,
        specialRequirements: data.visitor.specialRequirements
      } : undefined,
      // Include slot summary if available
      slot: data.slot ? {
        id: data.slot.id,
        date: data.slot.date,
        startTime: data.slot.startTime,
        endTime: data.slot.endTime,
        capacity: data.slot.capacity,
        bookedCount: data.slot.bookedCount,
        description: data.slot.description
      } : undefined,
      // Include SMS status if available
      smsStatus: data.smsStatus ? {
        id: data.smsStatus.id,
        status: data.smsStatus.status,
        attemptCount: data.smsStatus.attemptCount,
        maxAttempts: data.smsStatus.maxAttempts,
        lastAttemptAt: data.smsStatus.lastAttemptAt,
        sentAt: data.smsStatus.sentAt,
        lastErrorMessage: data.smsStatus.lastErrorMessage
      } : undefined,
      // Include Email status if available
      emailStatus: data.emailStatus ? {
        id: data.emailStatus.id,
        status: data.emailStatus.status,
        sentAt: data.emailStatus.sentAt,
        lastErrorMessage: data.emailStatus.lastErrorMessage
      } : undefined
    };
  }
}
