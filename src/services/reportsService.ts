import { PrismaClient } from '../generated/prisma';

export interface ReportsSummary {
  totalBookings: number;
  totalVisitors: number;
  averageBookingsPerDay: number;
  averageVisitorsPerDay: number;
  confirmationRate: number; // percentage 0-100
  cancelledCount: number;
  days: number;
}

export class ReportsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getSummary(days?: number, month?: number, year?: number): Promise<ReportsSummary> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate date range based on month/year or days
    let startDate: Date;
    let endDate: Date;
    let daysWindow: number;
    
    if (month && year) {
      // First day of selected month (month is 1-indexed, Date uses 0-indexed)
      startDate = new Date(year, month - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      
      // Last day of selected month
      endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);
      
      // Calculate number of days in the month
      daysWindow = endDate.getDate();
    } else {
      // Default: use days parameter
      const daysValue = Math.max(1, days || 7);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - daysValue + 1);
      endDate = new Date(today);
      daysWindow = daysValue;
    }

    const [bookings, confirmedCount, cancelledCount, visitorsSum] = await Promise.all([
      this.prisma.booking.count({
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      this.prisma.booking.count({
        where: { createdAt: { gte: startDate, lte: endDate }, status: 'confirmed' }
      }),
      this.prisma.booking.count({
        where: { createdAt: { gte: startDate, lte: endDate }, status: 'cancelled' }
      }),
      this.prisma.booking.aggregate({
        where: { createdAt: { gte: startDate, lte: endDate } },
        _sum: { groupSize: true }
      })
    ]);

    const totalBookings = bookings || 0;
    const totalVisitors = visitorsSum._sum.groupSize || 0;
    const averageBookingsPerDay = Math.round((totalBookings / daysWindow) * 100) / 100;
    const averageVisitorsPerDay = Math.round((totalVisitors / daysWindow) * 100) / 100;
    const confirmationRate = totalBookings > 0 ? Math.round((confirmedCount / totalBookings) * 100) : 0;

    return {
      totalBookings,
      totalVisitors,
      averageBookingsPerDay,
      averageVisitorsPerDay,
      confirmationRate,
      cancelledCount,
      days: daysWindow,
    };
  }

  async getDaily(params: { days?: number; dateFrom?: string; dateTo?: string }): Promise<Array<{
    date: string;
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    totalVisitors: number;
  }>> {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (params.dateFrom) startDate = new Date(params.dateFrom);
    if (params.dateTo) endDate = new Date(params.dateTo);

    if (!startDate) {
      const days = Math.max(1, params.days || 7);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days + 1);
    }
    if (!endDate) {
      endDate = new Date();
    }

    // Fetch minimal fields and aggregate in memory by date (YYYY-MM-DD)
    const bookings = await this.prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        createdAt: true,
        status: true,
        groupSize: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const dailyMap: Record<string, {
      date: string;
      totalBookings: number;
      confirmedBookings: number;
      cancelledBookings: number;
      totalVisitors: number;
    }> = {};

    for (const b of bookings) {
      const key = b.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[key]) {
        dailyMap[key] = {
          date: key,
          totalBookings: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
          totalVisitors: 0,
        };
      }
      const d = dailyMap[key];
      d.totalBookings += 1;
      if (b.status === 'confirmed') d.confirmedBookings += 1;
      if (b.status === 'cancelled') d.cancelledBookings += 1;
      d.totalVisitors += Number(b.groupSize || 1);
    }

    return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getBookingTrend(params: { days?: number; dateFrom?: string; dateTo?: string }): Promise<{
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
  }> {
    // Determine current range
    let startDate: Date | undefined;
    let endDate: Date | undefined = new Date();
    if (params.dateFrom) startDate = new Date(params.dateFrom);
    if (params.dateTo) endDate = new Date(params.dateTo);
    const days = Math.max(1, params.days || 7);
    if (!startDate) {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days + 1);
    }
    if (!endDate) endDate = new Date();

    // Previous range
    const prevEnd = new Date(startDate);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - days + 1);

    // Fetch bookings for both ranges
    const [current, previous] = await Promise.all([
      this.prisma.booking.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.booking.findMany({
        where: { createdAt: { gte: prevStart, lte: prevEnd } },
        select: { createdAt: true, status: true },
      }),
    ]);

    // Build continuous date axis
    const dates: string[] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      dates.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }

    const initMap = () => Object.fromEntries(dates.map(d => [d, 0]));
    const confirmedMap: Record<string, number> = initMap();
    const cancelledMap: Record<string, number> = initMap();

    for (const b of current) {
      const key = b.createdAt.toISOString().slice(0, 10);
      if (confirmedMap[key] === undefined) continue; // skip out of range just in case
      if (b.status === 'confirmed') confirmedMap[key] += 1;
      if (b.status === 'cancelled') cancelledMap[key] += 1;
    }

    const confirmed = dates.map(d => confirmedMap[d] || 0);
    const cancelled = dates.map(d => cancelledMap[d] || 0);

    const currentConfirmed = confirmed.reduce((a, b) => a + b, 0);
    const currentCancelled = cancelled.reduce((a, b) => a + b, 0);

    // Previous totals
    let previousConfirmed = 0;
    let previousCancelled = 0;
    for (const b of previous) {
      if (b.status === 'confirmed') previousConfirmed += 1;
      if (b.status === 'cancelled') previousCancelled += 1;
    }

    const pct = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Math.round(((cur - prev) / prev) * 100);
    };

    const comparison = {
      currentConfirmed,
      currentCancelled,
      previousConfirmed,
      previousCancelled,
      confirmedChangePct: pct(currentConfirmed, previousConfirmed),
      cancelledChangePct: pct(currentCancelled, previousCancelled),
    };

    return { dates, confirmed, cancelled, comparison };
  }
}

export default ReportsService;


