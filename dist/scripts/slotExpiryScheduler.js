"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expirePastVisitSlots = expirePastVisitSlots;
exports.startSlotExpiryScheduler = startSlotExpiryScheduler;
const prisma_1 = require("../generated/prisma");
const systemLogService_1 = require("../services/systemLogService");
const prisma = new prisma_1.PrismaClient();
const systemLog = new systemLogService_1.SystemLogService();
function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
async function expirePastVisitSlots() {
    const today = startOfToday();
    const now = new Date();
    // Fetch candidates: today and older, not cancelled/expired
    const candidates = await prisma.visitSlot.findMany({
        where: {
            date: { lte: now },
            status: { notIn: ['cancelled', 'expired'] },
        },
        select: { id: true, date: true, startTime: true },
    });
    const toExpire = [];
    for (const s of candidates) {
        const start = new Date(s.date);
        const [hStr, mStr, sStr] = String(s.startTime || '00:00:00').split(':');
        const h = parseInt(hStr || '0', 10);
        const m = parseInt(mStr || '0', 10);
        const sec = parseInt(sStr || '0', 10);
        start.setHours(h, m, sec || 0, 0);
        if (now > start)
            toExpire.push(s.id);
    }
    if (toExpire.length === 0)
        return { updated: 0 };
    const result = await prisma.visitSlot.updateMany({
        where: { id: { in: toExpire } },
        data: { status: 'expired' },
    });
    try {
        await systemLog.createLog({
            level: 'info',
            message: `Expired ${result.count || 0} visit slots by scheduler`,
            context: {
                action: 'slot_auto_expire',
                count: result.count || 0,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch { }
    return { updated: result.count || 0 };
}
function startSlotExpiryScheduler() {
    // Run once on startup
    expirePastVisitSlots().catch(() => { });
    // Then run hourly
    const oneHourMs = 60 * 60 * 1000;
    setInterval(() => {
        expirePastVisitSlots().catch(() => { });
    }, oneHourMs);
}
//# sourceMappingURL=slotExpiryScheduler.js.map