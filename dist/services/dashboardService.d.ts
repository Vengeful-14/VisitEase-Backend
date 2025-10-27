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
        startTime: string;
        endTime: string;
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
    } | null;
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
export declare class DashboardService {
    private prisma;
    constructor();
    getDashboardStats(): Promise<DashboardStats>;
    getUpcomingVisits(limit?: number): Promise<UpcomingVisit[]>;
    getRecentActivity(limit?: number): Promise<RecentActivity[]>;
    getRevenueTrend(days?: number): Promise<Array<{
        date: string;
        revenue: number;
    }>>;
    private generateActivityMessage;
}
//# sourceMappingURL=dashboardService.d.ts.map