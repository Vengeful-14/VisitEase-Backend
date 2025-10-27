import { CreateVisitorSlotData, UpdateVisitorSlotData, VisitorSlotResponse, VisitorSlotSearchFilters, VisitorSlotStatistics, SlotAvailabilityCheck } from '../type';
export declare const createVisitorSlot: (bookingData: CreateVisitorSlotData) => Promise<VisitorSlotResponse>;
export declare const getVisitorSlotById: (id: string) => Promise<VisitorSlotResponse | null>;
export declare const getVisitorSlots: (filters: VisitorSlotSearchFilters) => Promise<VisitorSlotResponse[]>;
export declare const updateVisitorSlot: (id: string, updateData: UpdateVisitorSlotData) => Promise<VisitorSlotResponse>;
export declare const deleteVisitorSlot: (id: string) => Promise<void>;
export declare const getVisitorSlotsByVisitorId: (visitorId: string) => Promise<VisitorSlotResponse[]>;
export declare const getVisitorSlotsBySlotId: (slotId: string) => Promise<VisitorSlotResponse[]>;
export declare const checkSlotAvailability: (slotId: string, groupSize: number) => Promise<SlotAvailabilityCheck>;
export declare const getVisitorSlotStatistics: () => Promise<VisitorSlotStatistics>;
export declare const cancelVisitorSlot: (id: string, reason?: string) => Promise<VisitorSlotResponse>;
export declare const updateSlotBookedCount: (slotId: string) => Promise<void>;
//# sourceMappingURL=visitorSlotQueries.d.ts.map