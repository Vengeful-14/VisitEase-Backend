"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const prisma_1 = require("../generated/prisma");
class DashboardService {
    constructor() {
        this.prisma = new prisma_1.PrismaClient();
    }
    async getDashboardStats() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Get slot statistics
        const slotStats = await this.prisma.visitSlot.aggregate({
            where: {
                date: {
                    gte: thirtyDaysAgo
                }
            },
            _count: true,
            _sum: {
                capacity: true,
                bookedCount: true
            }
        });
        const todaySlots = await this.prisma.visitSlot.count({
            where: {
                date: today
            }
        });
        const upcomingSlots = await this.prisma.visitSlot.count({
            where: {
                date: {
                    gt: today
                }
            }
        });
        const availableSlots = await this.prisma.visitSlot.count({
            where: {
                status: 'available',
                date: {
                    gte: thirtyDaysAgo
                }
            }
        });
        const bookedSlots = await this.prisma.visitSlot.count({
            where: {
                status: 'booked',
                date: {
                    gte: thirtyDaysAgo
                }
            }
        });
        // Get revenue statistics for today
        const revenueStats = await this.prisma.booking.aggregate({
            where: {
                status: 'confirmed',
                slot: {
                    date: today
                }
            },
            _sum: {
                totalAmount: true,
                groupSize: true
            },
            _count: true
        });
        // Get capacity utilization for last 7 days
        const capacityStats = await this.prisma.visitSlot.aggregate({
            where: {
                date: {
                    gte: sevenDaysAgo
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
            totalVisitors: revenueStats._sum.groupSize || 0,
            totalBookings: revenueStats._count || 0,
            revenue: revenueStats._sum.totalAmount?.toNumber() || 0,
            capacityUtilization: Math.round(utilizationPercentage * 100) / 100
        };
    }
    async getUpcomingVisits(limit = 5) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Only get TODAY's slots that have confirmed or tentative bookings
        const upcomingSlots = await this.prisma.visitSlot.findMany({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                },
                bookings: {
                    some: {
                        status: {
                            in: ['confirmed', 'tentative']
                        }
                    }
                }
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
            }
            else if (hoursUntil < 24) {
                timeUntil = `${hoursUntil} hours`;
            }
            else {
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
    async getRecentActivity(limit = 10) {
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
    async getRevenueTrend(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const bookings = await this.prisma.booking.findMany({
            where: {
                status: 'confirmed',
                createdAt: {
                    gte: startDate
                }
            },
            select: {
                createdAt: true,
                totalAmount: true
            }
        });
        // Group by date and sum revenue
        const revenueByDate = bookings.reduce((acc, booking) => {
            const date = booking.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + booking.totalAmount.toNumber();
            return acc;
        }, {});
        // Convert to array and sort by date
        return Object.entries(revenueByDate)
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => b.date.localeCompare(a.date));
    }
    generateActivityMessage(activity) {
        const { action, tableName, newValues, oldValues } = activity;
        switch (action) {
            case 'INSERT':
                if (tableName === 'bookings') {
                    return `New booking created for ${newValues?.visitor_name || 'visitor'}`;
                }
                else if (tableName === 'visitors') {
                    return `New visitor registered: ${newValues?.name || 'Unknown'}`;
                }
                break;
            case 'UPDATE':
                if (tableName === 'visit_slots') {
                    return `Slot updated: ${oldValues?.description || 'Unknown slot'}`;
                }
                else if (tableName === 'bookings') {
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
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboardService.js.map