import { PrismaClient } from '../generated/prisma';

export interface DashboardStats {
  totalSlots: number;
  todayVisits: number;
  upcomingVisits: number;
  availableSlots: number;
  bookedSlots: number;
  totalVisitors: number;
  totalBookings: number;
  revenue: number;
  capacityUtilization: number;
}

export interface UpcomingVisit {
  id: string;
  slot: {
    id: string;
    date: string;
    startTime: string; // Format: "HH:MM:SS" or "HH:MM"
    endTime: string;   // Format: "HH:MM:SS" or "HH:MM"
    status: string;
    bookedCount: number;
    capacity: number;
  };
  visitor: {
    name: string;
    email: string;
  } | null;
  booking: {
    id: string;
    status: string;
    groupSize: number;
    specialRequests: string | null;
  } | null;
  totalBookings: number;
  timeUntil: string;
}

export interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  user: string;
  metadata: {
    table: string;
    newValues: any;
    oldValues: any;
  };
}

export class DashboardService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getDashboardStats(month?: number, year?: number): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate date range based on month/year or default to last 30 days
    let dateFrom: Date;
    let dateTo: Date;
    
    if (month && year) {
      // First day of selected month (month is 1-indexed, Date uses 0-indexed)
      dateFrom = new Date(year, month - 1, 1);
      dateFrom.setHours(0, 0, 0, 0);
      
      // Always use the last day of the selected month (not today, even if current month)
      // Last day of the month: new Date(year, month, 0) where month is 0-indexed
      // Since month is 1-indexed, we use month (not month-1) to get last day
      dateTo = new Date(year, month, 0); // Last day of month
      dateTo.setHours(23, 59, 59, 999);
    } else {
      // Default: last 30 days
      dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);
      dateTo = new Date(today);
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get slot statistics - count all slots scheduled in the selected period
    // This includes all slots regardless of status (available, booked, cancelled, expired, maintenance)
    // Filter by date (slot's scheduled date) not createdAt (when slot was created)
    const slotStats = await this.prisma.visitSlot.aggregate({
      where: {
        date: {
          gte: dateFrom,
          lte: dateTo
        }
      },
      _count: true,
      _sum: {
        capacity: true,
        bookedCount: true
      }
    });

    // Today's visits: The number of visit slots scheduled for today within the selected month/year period
    // This shows how many time slots are available or have bookings for the current day
    // Only count if today falls within the selected period
    let todaySlots = 0;
    if (month && year) {
      // Check if today is within the selected month/year
      const isTodayInSelectedPeriod = 
        today.getFullYear() === year && 
        today.getMonth() + 1 === month;
      
      if (isTodayInSelectedPeriod) {
        // Count all slots scheduled for today (regardless of status)
        todaySlots = await this.prisma.visitSlot.count({
          where: {
            date: today
          }
        });
      }
    } else {
      // Default: count slots for today
      todaySlots = await this.prisma.visitSlot.count({
        where: {
          date: today
        }
      });
    }

    // Upcoming Visits: Shows visit slots with confirmed or tentative bookings in the selected month/year
    // These are upcoming time slots that have not yet occurred
    // Filter by: date in selected period AND date >= tomorrow AND has confirmed/tentative bookings
    const tomorrowForCount = new Date(today);
    tomorrowForCount.setDate(tomorrowForCount.getDate() + 1);
    tomorrowForCount.setHours(0, 0, 0, 0);
    
    const upcomingSlots = await this.prisma.visitSlot.count({
      where: {
        AND: [
          {
            date: {
              gte: dateFrom,
              lte: dateTo
            }
          },
          {
            date: {
              gte: tomorrowForCount // Must be in the future (tomorrow or later)
            }
          },
          {
            bookings: {
              some: {
                status: {
                  in: ['confirmed', 'tentative']
                }
              }
            }
          }
        ]
      }
    });

    // Available slots: Count of visit slots with status 'available' scheduled in the selected period
    // These slots are open for new bookings
    // Criteria: status = 'available' AND date (slot's scheduled date) in selected period
    const availableSlots = await this.prisma.visitSlot.count({
      where: {
        status: 'available',
        date: {
          gte: dateFrom,
          lte: dateTo
        }
      }
    });

  
    // Slots that have any active bookings (confirmed or tentative) in the selected period
    const bookedSlots = await this.prisma.visitSlot.count({
      where: {
        date: { 
          gte: dateFrom,
          lte: dateTo
        },
        bookings: {
          some: {
            status: { in: ['confirmed', 'tentative'] as any }
          }
        }
      }
    });

    // Get revenue statistics for the selected period
    const revenueStats = await this.prisma.booking.aggregate({
      where: {
        status: 'confirmed',
        slot: {
          date: {
            gte: dateFrom,
            lte: dateTo
          }
        }
      },
      _sum: {
        totalAmount: true,
        groupSize: true
      },
      _count: true
    });

    // Total unique visitors with confirmed or completed bookings in the selected period
    const visitorsGrouped = await this.prisma.booking.groupBy({
      by: ['visitorId'],
      where: {
        status: {
          in: ['confirmed', 'completed'] as any
        },
        slot: {
          date: {
            gte: dateFrom,
            lte: dateTo
          }
        }
      },
      _count: { visitorId: true }
    });
    const totalVisitors = visitorsGrouped.length;

    // Get capacity utilization for the selected period (month/year)
    // This calculates the percentage of total available capacity that has been booked
    const capacityStats = await this.prisma.visitSlot.aggregate({
      where: {
        date: {
          gte: dateFrom,
          lte: dateTo
        }
      },
      _sum: {
        capacity: true,
        bookedCount: true
      }
    });

    const totalCapacity = capacityStats._sum.capacity || 0;
    const totalBooked = capacityStats._sum.bookedCount || 0;
    const utilizationPercentage = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;

    return {
      totalSlots: slotStats._count || 0,
      todayVisits: todaySlots,
      upcomingVisits: upcomingSlots,
      availableSlots,
      bookedSlots,
      // Unique visitors with confirmed or completed bookings in the selected period
      totalVisitors: totalVisitors,
      totalBookings: revenueStats._count || 0,
      revenue: revenueStats._sum.totalAmount?.toNumber() || 0,
      capacityUtilization: Math.round(utilizationPercentage * 100) / 100
    };
  }

  async getUpcomingVisits(limit: number = 5, month?: number, year?: number): Promise<UpcomingVisit[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dateFrom: Date;
    let dateTo: Date;
    
    if (month && year) {
      // First day of selected month
      dateFrom = new Date(year, month - 1, 1);
      dateFrom.setHours(0, 0, 0, 0);
      
      // Always use the last day of the selected month (not today, even if current month)
      dateTo = new Date(year, month, 0); // Last day of the month
      dateTo.setHours(23, 59, 59, 999);
    } else {
      // Default: from today onwards
      dateFrom = today;
      dateTo = new Date(today);
      dateTo.setDate(dateTo.getDate() + 30); // Next 30 days
    }

    // Get slots in the selected period that have confirmed or tentative bookings
    // These are upcoming time slots that have not yet occurred (date > today)
    // Ordered by date and start time
    // For date comparison: use gte with tomorrow (today + 1 day) to ensure we only get future dates
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const upcomingSlots = await this.prisma.visitSlot.findMany({
      where: {
        AND: [
          {
            date: {
              gte: dateFrom,
              lte: dateTo
            }
          },
          {
            date: {
              gte: tomorrow // Must be in the future (tomorrow or later)
            }
          },
          {
            bookings: {
              some: {
                status: {
                  in: ['confirmed', 'tentative']
                }
              }
            }
          }
        ]
      },
      include: {
        bookings: {
          where: {
            status: {
              in: ['confirmed', 'tentative']
            }
          },
          include: {
            visitor: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      take: limit
    });
    

    return upcomingSlots.map(slot => {
      const now = new Date();
      const slotDateTime = new Date(slot.date);
      
      // Parse time string (HH:MM:SS or HH:MM)
      const timeParts = slot.startTime.split(':');
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;
      
      slotDateTime.setHours(hours, minutes, seconds);
      
      const hoursUntil = Math.floor((slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      let timeUntil = '';
      if (hoursUntil < 1) {
        timeUntil = 'Less than 1 hour';
      } else if (hoursUntil < 24) {
        timeUntil = `${hoursUntil} hours`;
      } else {
        const days = Math.floor(hoursUntil / 24);
        timeUntil = `${days} day${days > 1 ? 's' : ''}`;
      }

      // Get all bookings for this slot
      const bookings = slot.bookings || [];
      const primaryBooking = bookings[0]; // Get first booking for primary visitor info

      return {
        id: slot.id,
        slot: {
          id: slot.id,
          date: slot.date.toISOString().split('T')[0],
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
          bookedCount: slot.bookedCount,
          capacity: slot.capacity
        },
        visitor: primaryBooking?.visitor ? {
          name: primaryBooking.visitor.name,
          email: primaryBooking.visitor.email
        } : null,
        booking: primaryBooking ? {
          id: primaryBooking.id,
          status: primaryBooking.status,
          groupSize: primaryBooking.groupSize,
          specialRequests: primaryBooking.specialRequests
        } : null,
        totalBookings: bookings.length,
        timeUntil
      };
    });
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentActivities = await this.prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return recentActivities.map(activity => {
      const message = this.generateActivityMessage(activity);
      
      return {
        id: activity.id,
        type: activity.action,
        message,
        timestamp: activity.createdAt.toISOString(),
        user: activity.user?.name || 'System',
        metadata: {
          table: activity.tableName,
          newValues: activity.newValues,
          oldValues: activity.oldValues
        }
      };
    });
  }

  async getRevenueTrend(month?: number, year?: number): Promise<Array<{date: string, revenue: number}>> {
    let startDate: Date;
    let endDate: Date;
    
    if (month && year) {
      // First day of selected month
      startDate = new Date(year, month - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      
      // Last day of selected month, or today if current month
      const today = new Date();
      const isCurrentMonth = month === today.getMonth() + 1 && year === today.getFullYear();
      if (isCurrentMonth) {
        endDate = new Date(today);
      } else {
        endDate = new Date(year, month, 0); // Last day of the month
        endDate.setHours(23, 59, 59, 999);
      }
    } else {
      // Default: last 7 days
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date();
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'confirmed',
        slot: {
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      select: {
        totalAmount: true,
        slot: {
          select: {
            date: true
          }
        }
      }
    });

    // Group by slot date and sum revenue
    const revenueByDate = bookings.reduce((acc, booking) => {
      const date = booking.slot.date.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + booking.totalAmount.toNumber();
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by date
    return Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  private generateActivityMessage(activity: any): string {
    const { action, tableName, newValues, oldValues } = activity;
    
    switch (action) {
      case 'INSERT':
        if (tableName === 'bookings') {
          return `New booking created for ${newValues?.visitor_name || 'visitor'}`;
        } else if (tableName === 'visitors') {
          return `New visitor registered: ${newValues?.name || 'Unknown'}`;
        }
        break;
      case 'UPDATE':
        if (tableName === 'visit_slots') {
          return `Slot updated: ${oldValues?.description || 'Unknown slot'}`;
        } else if (tableName === 'bookings') {
          return `Booking status changed to ${newValues?.status || 'unknown'}`;
        }
        break;
      case 'DELETE':
        if (tableName === 'bookings') {
          return `Booking cancelled by ${oldValues?.visitor_name || 'visitor'}`;
        }
        break;
    }
    
    return `${action} operation on ${tableName}`;
  }
}
