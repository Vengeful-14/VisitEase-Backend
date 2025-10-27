"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorService = void 0;
const prisma_1 = require("../generated/prisma");
class VisitorService {
    constructor() {
        this.prisma = new prisma_1.PrismaClient();
    }
    async getVisitors(filters) {
        const where = {
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
    async createVisitor(visitorData) {
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
                visitorType: this.determineVisitorType(visitorData.organization),
                ageGroup: (visitorData.ageGroup || null),
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
    async updateVisitor(id, updates) {
        // Validate updates
        if (updates.email) {
            await this.checkDuplicateEmail(updates.email, id);
        }
        // Prepare update data
        const updateData = {};
        if (updates.name)
            updateData.name = updates.name;
        if (updates.email)
            updateData.email = updates.email;
        if (updates.phone !== undefined)
            updateData.phone = updates.phone;
        if (updates.organization !== undefined)
            updateData.organization = updates.organization;
        if (updates.specialRequirements !== undefined)
            updateData.specialRequirements = updates.specialRequirements;
        if (updates.visitorType)
            updateData.visitorType = updates.visitorType;
        if (updates.ageGroup !== undefined)
            updateData.ageGroup = updates.ageGroup;
        if (updates.addressLine1 !== undefined)
            updateData.addressLine1 = updates.addressLine1;
        if (updates.addressLine2 !== undefined)
            updateData.addressLine2 = updates.addressLine2;
        if (updates.city !== undefined)
            updateData.city = updates.city;
        if (updates.state !== undefined)
            updateData.state = updates.state;
        if (updates.postalCode !== undefined)
            updateData.postalCode = updates.postalCode;
        if (updates.country)
            updateData.country = updates.country;
        if (updates.emergencyContactName !== undefined)
            updateData.emergencyContactName = updates.emergencyContactName;
        if (updates.emergencyContactPhone !== undefined)
            updateData.emergencyContactPhone = updates.emergencyContactPhone;
        if (Object.keys(updateData).length === 0) {
            throw new Error('No valid fields to update');
        }
        const visitor = await this.prisma.visitor.update({
            where: { id },
            data: updateData
        });
        return this.transformVisitor(visitor);
    }
    async deleteVisitor(id) {
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
    async getVisitorStats() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [totalVisitors, newVisitorsThisMonth, returningVisitors, avgGroupSize, mostPopularOrg] = await Promise.all([
            this.prisma.visitor.count({
                where: { isActive: true }
            }),
            this.prisma.visitor.count({
                where: {
                    isActive: true,
                    createdAt: { gte: thirtyDaysAgo }
                }
            }),
            this.prisma.visitor.count({
                where: {
                    isActive: true,
                    bookings: {
                        some: {
                            status: 'confirmed'
                        }
                    }
                }
            }),
            this.prisma.booking.aggregate({
                where: { status: 'confirmed' },
                _avg: { groupSize: true }
            }),
            this.prisma.visitor.groupBy({
                by: ['organization'],
                where: {
                    isActive: true,
                    organization: { not: null }
                },
                _count: { organization: true },
                orderBy: { _count: { organization: 'desc' } },
                take: 1
            })
        ]);
        return {
            totalVisitors,
            newVisitorsThisMonth,
            returningVisitors,
            averageGroupSize: Math.round((avgGroupSize._avg.groupSize || 0) * 10) / 10,
            mostPopularOrganization: mostPopularOrg[0]?.organization || 'N/A'
        };
    }
    async getVisitorById(id) {
        const visitor = await this.prisma.visitor.findUnique({
            where: { id }
        });
        return visitor ? this.transformVisitor(visitor) : null;
    }
    async validateVisitorData(visitorData) {
        if (!visitorData.name || visitorData.name.trim().length === 0) {
            throw new Error('Name is required');
        }
        if (!visitorData.email || !this.isValidEmail(visitorData.email)) {
            throw new Error('Valid email is required');
        }
    }
    async checkDuplicateEmail(email, excludeId) {
        const where = {
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
    determineVisitorType(organization) {
        if (!organization)
            return 'individual';
        const org = organization.toLowerCase();
        if (org.includes('school') || org.includes('university') || org.includes('college')) {
            return 'educational';
        }
        else if (org.includes('company') || org.includes('inc') || org.includes('corp')) {
            return 'corporate';
        }
        else if (org.includes('club') || org.includes('society') || org.includes('group')) {
            return 'group';
        }
        return 'individual';
    }
    mapTypeFilter(type) {
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
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    transformVisitor(data) {
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
exports.VisitorService = VisitorService;
//# sourceMappingURL=visitorService.js.map