import { PrismaClient, Visitor, VisitorType, AgeGroup } from '../generated/prisma';
import { CreateVisitorData, UpdateVisitorData, VisitorResponse, VisitorSearchFilters } from '../type';

const prisma = new PrismaClient();

// Create a new visitor
export const createVisitor = async (visitorData: CreateVisitorData): Promise<VisitorResponse> => {
  try {
    const visitor = await prisma.visitor.create({
      data: {
        name: visitorData.name,
        email: visitorData.email,
        phone: visitorData.phone,
        organization: visitorData.organization,
        specialRequirements: visitorData.specialRequirements,
        visitorType: visitorData.visitorType || 'individual',
        ageGroup: visitorData.ageGroup,
        addressLine1: visitorData.addressLine1,
        addressLine2: visitorData.addressLine2,
        city: visitorData.city,
        state: visitorData.state,
        postalCode: visitorData.postalCode,
        country: visitorData.country || 'US',
        emergencyContactName: visitorData.emergencyContactName,
        emergencyContactPhone: visitorData.emergencyContactPhone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        organization: true,
        specialRequirements: true,
        visitorType: true,
        ageGroup: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    });

    return visitor;
  } catch (error) {
    throw error;
  }
};

// Get visitor by ID
export const getVisitorById = async (id: string): Promise<VisitorResponse | null> => {
  try {
    const visitor = await prisma.visitor.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        organization: true,
        specialRequirements: true,
        visitorType: true,
        ageGroup: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    });

    return visitor;
  } catch (error) {
    throw error;
  }
};

// Get visitor by email
export const getVisitorByEmail = async (email: string): Promise<VisitorResponse | null> => {
  try {
    const visitor = await prisma.visitor.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        organization: true,
        specialRequirements: true,
        visitorType: true,
        ageGroup: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    });

    return visitor;
  } catch (error) {
    throw error;
  }
};

// Get all visitors with optional filters
export const getVisitors = async (filters?: VisitorSearchFilters): Promise<VisitorResponse[]> => {
  try {
    const whereClause: any = {};

    if (filters) {
      if (filters.name) {
        whereClause.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }
      if (filters.email) {
        whereClause.email = {
          contains: filters.email,
          mode: 'insensitive',
        };
      }
      if (filters.visitorType) {
        whereClause.visitorType = filters.visitorType;
      }
      if (filters.ageGroup) {
        whereClause.ageGroup = filters.ageGroup;
      }
      if (filters.city) {
        whereClause.city = {
          contains: filters.city,
          mode: 'insensitive',
        };
      }
      if (filters.state) {
        whereClause.state = {
          contains: filters.state,
          mode: 'insensitive',
        };
      }
      if (filters.country) {
        whereClause.country = {
          contains: filters.country,
          mode: 'insensitive',
        };
      }
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
    }

    const visitors = await prisma.visitor.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        organization: true,
        specialRequirements: true,
        visitorType: true,
        ageGroup: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
      orderBy: [
        { createdAt: 'desc' },
        { name: 'asc' },
      ],
    });

    return visitors;
  } catch (error) {
    throw error;
  }
};

// Update visitor
export const updateVisitor = async (
  id: string,
  updateData: UpdateVisitorData
): Promise<VisitorResponse | null> => {
  try {
    const visitor = await prisma.visitor.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        organization: true,
        specialRequirements: true,
        visitorType: true,
        ageGroup: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    });

    return visitor;
  } catch (error) {
    throw error;
  }
};

// Delete visitor (soft delete by setting isActive to false)
export const deleteVisitor = async (id: string): Promise<boolean> => {
  try {
    await prisma.visitor.update({
      where: { id },
      data: { isActive: false },
    });

    return true;
  } catch (error) {
    throw error;
  }
};

// Hard delete visitor
export const hardDeleteVisitor = async (id: string): Promise<boolean> => {
  try {
    await prisma.visitor.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    throw error;
  }
};

// Get visitors by type
export const getVisitorsByType = async (visitorType: VisitorType): Promise<VisitorResponse[]> => {
  try {
    const visitors = await prisma.visitor.findMany({
      where: { 
        visitorType,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        organization: true,
        specialRequirements: true,
        visitorType: true,
        ageGroup: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
      orderBy: [
        { name: 'asc' },
      ],
    });

    return visitors;
  } catch (error) {
    throw error;
  }
};

// Get visitors by age group
export const getVisitorsByAgeGroup = async (ageGroup: AgeGroup): Promise<VisitorResponse[]> => {
  try {
    const visitors = await prisma.visitor.findMany({
      where: { 
        ageGroup,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        organization: true,
        specialRequirements: true,
        visitorType: true,
        ageGroup: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
      orderBy: [
        { name: 'asc' },
      ],
    });

    return visitors;
  } catch (error) {
    throw error;
  }
};

// Get visitor statistics
export const getVisitorStatistics = async () => {
  try {
    const totalVisitors = await prisma.visitor.count({
      where: { isActive: true },
    });

    const visitorsByType = await prisma.visitor.groupBy({
      by: ['visitorType'],
      where: { isActive: true },
      _count: {
        visitorType: true,
      },
    });

    const visitorsByAgeGroup = await prisma.visitor.groupBy({
      by: ['ageGroup'],
      where: { isActive: true },
      _count: {
        ageGroup: true,
      },
    });

    const recentVisitors = await prisma.visitor.count({
      where: {
        isActive: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    return {
      totalVisitors,
      recentVisitors,
      visitorsByType: visitorsByType.map(item => ({
        type: item.visitorType,
        count: item._count.visitorType,
      })),
      visitorsByAgeGroup: visitorsByAgeGroup.map(item => ({
        ageGroup: item.ageGroup,
        count: item._count.ageGroup,
      })),
    };
  } catch (error) {
    throw error;
  }
};
