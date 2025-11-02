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
    specialRequirements: {
        requirement: string;
        count: number;
    }[];
    specialRequirementsCount: number;
}
export declare class VisitorService {
    private prisma;
    constructor();
    getVisitors(filters: {
        search?: string;
        type?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        visitors: Visitor[];
        total: number;
    }>;
    createVisitor(visitorData: Omit<Visitor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Visitor>;
    updateVisitor(id: string, updates: Partial<Visitor>): Promise<Visitor>;
    deleteVisitor(id: string): Promise<void>;
    getVisitorStats(): Promise<VisitorStats>;
    getVisitorById(id: string): Promise<Visitor | null>;
    private validateVisitorData;
    private checkDuplicateEmail;
    private determineVisitorType;
    private mapTypeFilter;
    private isValidEmail;
    private transformVisitor;
}
//# sourceMappingURL=visitorService.d.ts.map