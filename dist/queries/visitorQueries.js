"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisitorStatistics = exports.getVisitorsByAgeGroup = exports.getVisitorsByType = exports.hardDeleteVisitor = exports.deleteVisitor = exports.updateVisitor = exports.getVisitors = exports.getVisitorByEmail = exports.getVisitorById = exports.createVisitor = void 0;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
// Create a new visitor
const createVisitor = async (visitorData) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.createVisitor = createVisitor;
// Get visitor by ID
const getVisitorById = async (id) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.getVisitorById = getVisitorById;
// Get visitor by email
const getVisitorByEmail = async (email) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.getVisitorByEmail = getVisitorByEmail;
// Get all visitors with optional filters
const getVisitors = async (filters) => {
    try {
        const whereClause = {};
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
    }
    catch (error) {
        throw error;
    }
};
exports.getVisitors = getVisitors;
// Update visitor
const updateVisitor = async (id, updateData) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.updateVisitor = updateVisitor;
// Delete visitor (soft delete by setting isActive to false)
const deleteVisitor = async (id) => {
    try {
        await prisma.visitor.update({
            where: { id },
            data: { isActive: false },
        });
        return true;
    }
    catch (error) {
        throw error;
    }
};
exports.deleteVisitor = deleteVisitor;
// Hard delete visitor
const hardDeleteVisitor = async (id) => {
    try {
        await prisma.visitor.delete({
            where: { id },
        });
        return true;
    }
    catch (error) {
        throw error;
    }
};
exports.hardDeleteVisitor = hardDeleteVisitor;
// Get visitors by type
const getVisitorsByType = async (visitorType) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.getVisitorsByType = getVisitorsByType;
// Get visitors by age group
const getVisitorsByAgeGroup = async (ageGroup) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.getVisitorsByAgeGroup = getVisitorsByAgeGroup;
// Get visitor statistics
const getVisitorStatistics = async () => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.getVisitorStatistics = getVisitorStatistics;
//# sourceMappingURL=visitorQueries.js.map