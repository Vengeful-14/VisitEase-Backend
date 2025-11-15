import { PrismaClient } from '../generated/prisma';

export interface Visitor {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  specialRequirements: string;
  visitorType: string;
  ageGroup?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface VisitorStats {
  totalVisitors: number;
  newVisitorsThisMonth: number;
  returningVisitors: number;
  averageGroupSize: number;
  minGroupSize: number;
  maxGroupSize: number;
  totalBookings: number;
  mostPopularOrganization: string;
  mostPopularVisitorType: string;
  specialRequirements: {requirement: string, count: number}[];
  specialRequirementsCount: number;
}

export class VisitorService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getVisitors(filters: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{visitors: Visitor[], total: number}> {
    
    const where: any = {
      isActive: true
    };

    // Search filter
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { organization: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      where.visitorType = this.mapTypeFilter(filters.type);
    }

    const limit = filters.limit || 20;
    const skip = ((filters.page || 1) - 1) * limit;

    const [visitors, total] = await Promise.all([
      this.prisma.visitor.findMany({
        where,
        include: {
          bookings: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      this.prisma.visitor.count({ where })
    ]);

    return {
      visitors: visitors.map(visitor => this.transformVisitor(visitor)),
      total
    };
  }

  async createVisitor(visitorData: Omit<Visitor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Visitor> {
    // Validate visitor data
    await this.validateVisitorData(visitorData);

    // Check for duplicate email
    await this.checkDuplicateEmail(visitorData.email);

    const visitor = await this.prisma.visitor.create({
      data: {
        name: visitorData.name,
        email: visitorData.email,
        phone: visitorData.phone || null,
        organization: visitorData.organization || null,
        specialRequirements: visitorData.specialRequirements || null,
        visitorType: this.determineVisitorType(visitorData.organization) as any,
        ageGroup: (visitorData.ageGroup || null) as any,
        addressLine1: visitorData.addressLine1 || null,
        addressLine2: visitorData.addressLine2 || null,
        city: visitorData.city || null,
        state: visitorData.state || null,
        postalCode: visitorData.postalCode || null,
        country: visitorData.country || 'US',
        emergencyContactName: visitorData.emergencyContactName || null,
        emergencyContactPhone: visitorData.emergencyContactPhone || null
      }
    });

    return this.transformVisitor(visitor);
  }

  async updateVisitor(id: string, updates: Partial<Visitor>): Promise<Visitor> {
    // Validate updates
    if (updates.email) {
      await this.checkDuplicateEmail(updates.email, id);
    }

    // Prepare update data
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.organization !== undefined) updateData.organization = updates.organization;
    if (updates.specialRequirements !== undefined) updateData.specialRequirements = updates.specialRequirements;
    if (updates.visitorType) updateData.visitorType = updates.visitorType;
    if (updates.ageGroup !== undefined) updateData.ageGroup = updates.ageGroup;
    if (updates.addressLine1 !== undefined) updateData.addressLine1 = updates.addressLine1;
    if (updates.addressLine2 !== undefined) updateData.addressLine2 = updates.addressLine2;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.state !== undefined) updateData.state = updates.state;
    if (updates.postalCode !== undefined) updateData.postalCode = updates.postalCode;
    if (updates.country) updateData.country = updates.country;
    if (updates.emergencyContactName !== undefined) updateData.emergencyContactName = updates.emergencyContactName;
    if (updates.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = updates.emergencyContactPhone;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const visitor = await this.prisma.visitor.update({
      where: { id },
      data: updateData
    });

    return this.transformVisitor(visitor);
  }

  async deleteVisitor(id: string): Promise<void> {
    // Check if visitor has active bookings
    const activeBookings = await this.prisma.booking.count({
      where: {
        visitorId: id,
        status: {
          in: ['confirmed', 'tentative']
        }
      }
    });

    if (activeBookings > 0) {
      throw new Error('Cannot delete visitor with active bookings');
    }

    // Soft delete by setting is_active to false
    await this.prisma.visitor.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async getVisitorStats(month?: number, year?: number): Promise<VisitorStats> {
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
      dateTo = new Date(year, month, 0); // Last day of month
      dateTo.setHours(23, 59, 59, 999);
    } else {
      // Default: last 30 days
      dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);
      dateTo = new Date(today);
    }

    // Define completed booking filter with date range
    const completedBookingFilter = { 
      status: 'completed' as any,
      createdAt: {
        gte: dateFrom,
        lte: dateTo
      }
    };

    const [totalVisitors, newVisitorsThisMonth, returningVisitors, avgGroupSize, groupSizeStats, completedBookingsForOrg, specialRequirementsData] = await Promise.all([
      // Total active visitors (all time, not filtered by date)
      this.prisma.visitor.count({ where: { isActive: true } }),
      // New visitors created in the selected month/year
      this.prisma.visitor.count({ where: { isActive: true, createdAt: { gte: dateFrom, lte: dateTo } } }),
      // Count visitors who have at least one COMPLETED booking in the selected period
      this.prisma.visitor.count({
        where: { 
          isActive: true, 
          bookings: { 
            some: completedBookingFilter
          } 
        }
      }),
      // Average group size from COMPLETED bookings created in the selected month/year period
      // Calculates the average number of people per booking group from completed bookings
      // Filtered by: status = 'completed' AND createdAt within selected month/year
      this.prisma.booking.aggregate({
        where: completedBookingFilter,
        _avg: { groupSize: true }
      }),
      // Min / Max / Count from COMPLETED bookings created in the selected month/year period
      // Used to show the range (minimum to maximum) and total count of completed bookings
      // Filtered by: status = 'completed' AND createdAt within selected month/year
      this.prisma.booking.aggregate({
        where: completedBookingFilter,
        _min: { groupSize: true },
        _max: { groupSize: true },
        _count: { groupSize: true }
      }),
      // Fetch COMPLETED bookings in the selected period with visitor organization
      this.prisma.booking.findMany({
        where: completedBookingFilter,
        select: {
          id: true,
          visitor: { select: { organization: true, visitorType: true } }
        }
      }),
      // Special requirements from visitors (all active visitors, not filtered by date)
      this.prisma.visitor.findMany({ where: { isActive: true }, select: { specialRequirements: true } })
    ]);

    // Process special requirements data
    const specialRequirementsCounts: Record<string, number> = {};
    specialRequirementsData.forEach(visitor => {
      const requirement = (visitor.specialRequirements || '').trim();
      if (requirement) {
        specialRequirementsCounts[requirement] = (specialRequirementsCounts[requirement] || 0) + 1;
      }
    });
    
    const specialRequirements = Object.entries(specialRequirementsCounts).map(([requirement, count]) => ({
      requirement,
      count
    }));
    const specialRequirementsCount = Object.values(specialRequirementsCounts).reduce((sum, c) => sum + c, 0);

    return {
      totalVisitors,
      newVisitorsThisMonth,
      returningVisitors,
      averageGroupSize: Math.round((avgGroupSize._avg.groupSize || 0) * 10) / 10,
      minGroupSize: groupSizeStats._min.groupSize || 0,
      maxGroupSize: groupSizeStats._max.groupSize || 0,
      totalBookings: groupSizeStats._count.groupSize || 0,
      mostPopularOrganization: (() => {
        const freq: Record<string, number> = {};
        (completedBookingsForOrg || []).forEach(b => {
          const org = (b.visitor?.organization || '').trim();
          if (!org) return;
          freq[org] = (freq[org] || 0) + 1; // count bookings, not visitors
        });
        let topOrg = 'N/A';
        let topCount = 0;
        Object.entries(freq).forEach(([org, count]) => {
          if (count > topCount) {
            topOrg = org;
            topCount = count as number;
          }
        });
        return topOrg;
      })(),
      mostPopularVisitorType: (() => {
        const freq: Record<string, number> = {};
        (completedBookingsForOrg || []).forEach(b => {
          const visitorType = b.visitor?.visitorType;
          if (!visitorType) return;
          freq[visitorType] = (freq[visitorType] || 0) + 1; // count bookings by visitor type
        });
        let topType = 'N/A';
        let topCount = 0;
        Object.entries(freq).forEach(([type, count]) => {
          if (count > topCount) {
            topType = type;
            topCount = count as number;
          }
        });
        return topType;
      })(),
      specialRequirements,
      specialRequirementsCount
    };
  }

  async getVisitorById(id: string): Promise<Visitor | null> {
    const visitor = await this.prisma.visitor.findUnique({
      where: { id }
    });

    return visitor ? this.transformVisitor(visitor) : null;
  }

  private async validateVisitorData(visitorData: any): Promise<void> {
    if (!visitorData.name || visitorData.name.trim().length === 0) {
      throw new Error('Name is required');
    }

    if (!visitorData.email || !this.isValidEmail(visitorData.email)) {
      throw new Error('Valid email is required');
    }
  }

  private async checkDuplicateEmail(email: string, excludeId?: string): Promise<void> {
    const where: any = {
      email,
      isActive: true
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existingVisitor = await this.prisma.visitor.findFirst({ where });
    
    if (existingVisitor) {
      throw new Error('Email already exists');
    }
  }

  private determineVisitorType(organization?: string): string {
    if (!organization) return 'individual';
    
    const org = organization.toLowerCase();
    if (org.includes('school') || org.includes('university') || org.includes('college')) {
      return 'educational';
    } else if (org.includes('company') || org.includes('inc') || org.includes('corp')) {
      return 'corporate';
    } else if (org.includes('club') || org.includes('society') || org.includes('group')) {
      return 'group';
    }
    
    return 'individual';
  }

  private mapTypeFilter(type: string): string {
    switch (type) {
      case 'individual':
        return 'individual';
      case 'educational':
        return 'educational';
      case 'corporate':
        return 'corporate';
      case 'group':
        return 'group';
      case 'family':
        return 'family';
      case 'senior':
        return 'senior';
      default:
        return type;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private transformVisitor(data: any): Visitor {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      organization: data.organization || '',
      specialRequirements: data.specialRequirements || '',
      visitorType: data.visitorType,
      ageGroup: data.ageGroup,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      isActive: data.isActive
    };
  }
}
