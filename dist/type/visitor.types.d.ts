import { VisitorType, AgeGroup } from '../generated/prisma';
export interface CreateVisitorData {
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    specialRequirements?: string;
    visitorType?: VisitorType;
    ageGroup?: AgeGroup;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
}
export interface VisitorResponse {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    organization: string | null;
    specialRequirements: string | null;
    visitorType: VisitorType;
    ageGroup: AgeGroup | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}
export interface UpdateVisitorData {
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
    specialRequirements?: string;
    visitorType?: VisitorType;
    ageGroup?: AgeGroup;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    isActive?: boolean;
}
export interface VisitorSearchFilters {
    name?: string;
    email?: string;
    visitorType?: VisitorType;
    ageGroup?: AgeGroup;
    city?: string;
    state?: string;
    country?: string;
    isActive?: boolean;
}
export interface VisitorRegistrationRequest {
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    specialRequirements?: string;
    visitorType?: VisitorType;
    ageGroup?: AgeGroup;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
}
//# sourceMappingURL=visitor.types.d.ts.map