import { SlotStatus } from '../generated/prisma';
import { CreateVisitSlotData, UpdateVisitSlotData, VisitSlotResponse } from '../type';
export declare const createVisitSlot: (slotData: CreateVisitSlotData) => Promise<VisitSlotResponse>;
export declare const createMultipleVisitSlots: (slotsData: CreateVisitSlotData[]) => Promise<VisitSlotResponse[]>;
export declare const getVisitSlotById: (id: string) => Promise<VisitSlotResponse | null>;
export declare const getVisitSlotsByDateRange: (startDate: Date, endDate: Date) => Promise<VisitSlotResponse[]>;
export declare const getAvailableVisitSlots: (startDate?: Date, endDate?: Date) => Promise<VisitSlotResponse[]>;
export declare const updateVisitSlot: (id: string, updateData: UpdateVisitSlotData) => Promise<VisitSlotResponse | null>;
export declare const deleteVisitSlot: (id: string) => Promise<boolean>;
export declare const getVisitSlotsByStatus: (status: SlotStatus) => Promise<VisitSlotResponse[]>;
//# sourceMappingURL=visitSlotQueries.d.ts.map