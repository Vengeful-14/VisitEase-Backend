export interface ReportsSummary {
    totalBookings: number;
    totalVisitors: number;
    averageBookingsPerDay: number;
    averageVisitorsPerDay: number;
    confirmationRate: number;
    cancelledCount: number;
    days: number;
}
export declare class ReportsService {
    private prisma;
    constructor();
    getSummary(days?: number): Promise<ReportsSummary>;
    getDaily(params: {
        days?: number;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<Array<{
        date: string;
        totalBookings: number;
        confirmedBookings: number;
        cancelledBookings: number;
        totalVisitors: number;
    }>>;
    getBookingTrend(params: {
        days?: number;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<{
        dates: string[];
        confirmed: number[];
        cancelled: number[];
        comparison: {
            currentConfirmed: number;
            currentCancelled: number;
            previousConfirmed: number;
            previousCancelled: number;
            confirmedChangePct: number;
            cancelledChangePct: number;
        };
    }>;
}
export default ReportsService;
//# sourceMappingURL=reportsService.d.ts.map