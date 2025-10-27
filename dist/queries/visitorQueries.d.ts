import { VisitorType, AgeGroup } from '../generated/prisma';
import { CreateVisitorData, UpdateVisitorData, VisitorResponse, VisitorSearchFilters } from '../type';
export declare const createVisitor: (visitorData: CreateVisitorData) => Promise<VisitorResponse>;
export declare const getVisitorById: (id: string) => Promise<VisitorResponse | null>;
export declare const getVisitorByEmail: (email: string) => Promise<VisitorResponse | null>;
export declare const getVisitors: (filters?: VisitorSearchFilters) => Promise<VisitorResponse[]>;
export declare const updateVisitor: (id: string, updateData: UpdateVisitorData) => Promise<VisitorResponse | null>;
export declare const deleteVisitor: (id: string) => Promise<boolean>;
export declare const hardDeleteVisitor: (id: string) => Promise<boolean>;
export declare const getVisitorsByType: (visitorType: VisitorType) => Promise<VisitorResponse[]>;
export declare const getVisitorsByAgeGroup: (ageGroup: AgeGroup) => Promise<VisitorResponse[]>;
export declare const getVisitorStatistics: () => Promise<{
    totalVisitors: number;
    recentVisitors: number;
    visitorsByType: {
        type: import("../generated/prisma").$Enums.VisitorType;
        count: number;
    }[];
    visitorsByAgeGroup: {
        ageGroup: import("../generated/prisma").$Enums.AgeGroup | null;
        count: number;
    }[];
}>;
//# sourceMappingURL=visitorQueries.d.ts.map