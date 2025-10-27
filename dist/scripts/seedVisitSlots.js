"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNovemberSlots = exports.seedVisitSlots = void 0;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
// Helper function to create DateTime for time
const createTimeDateTime = (hours, minutes) => {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};
// Helper function to add minutes to time string
const addMinutesToTime = (timeString, minutes) => {
    const [hours, mins] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};
// Helper function to check if date is a weekday
const isWeekday = (date) => {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday to Friday
};
// Helper function to get random status with weighted distribution
const getRandomStatus = () => {
    const rand = Math.random();
    if (rand < 0.7)
        return 'available'; // 70% available
    if (rand < 0.85)
        return 'booked'; // 15% booked
    if (rand < 0.95)
        return 'cancelled'; // 10% cancelled
    return 'maintenance'; // 5% maintenance
};
// Generate time slots for a day
const generateTimeSlots = (startHour, endHour, slotDurationMinutes) => {
    const slots = [];
    const totalMinutes = (endHour - startHour) * 60;
    const numSlots = Math.floor(totalMinutes / slotDurationMinutes);
    for (let i = 0; i < numSlots; i++) {
        const startMinutes = i * slotDurationMinutes;
        const startHourSlot = startHour + Math.floor(startMinutes / 60);
        const startMinuteSlot = startMinutes % 60;
        const timeString = `${startHourSlot.toString().padStart(2, '0')}:${startMinuteSlot.toString().padStart(2, '0')}`;
        slots.push(timeString);
    }
    return slots;
};
// Generate visit slots for November 2024
const generateNovemberSlots = async (createdBy) => {
    try {
        console.log('🌱 Starting visit slots seeding for November 2024...');
        // November 2024 date range
        const startDate = new Date('2024-11-01');
        const endDate = new Date('2024-11-30');
        // Slot generation options
        const options = {
            startDate,
            endDate,
            startHour: 8, // 8 AM
            endHour: 16, // 4 PM
            slotDurationMinutes: 30, // 30-minute slots
            capacity: Math.floor(Math.random() * 10) + 5, // Random capacity between 5-15
            includeWeekends: false,
            createdBy,
        };
        const slotsToCreate = [];
        const currentDate = new Date(startDate);
        // Generate slots for each day in November
        while (currentDate <= endDate) {
            // Only generate slots for weekdays
            if (isWeekday(currentDate)) {
                const timeSlots = generateTimeSlots(options.startHour, options.endHour, options.slotDurationMinutes);
                // Create slots for each time slot
                for (const startTime of timeSlots) {
                    const endTime = addMinutesToTime(startTime, options.slotDurationMinutes);
                    const status = getRandomStatus();
                    // Skip some slots randomly (10% chance) to make it more realistic
                    if (Math.random() < 0.1)
                        continue;
                    const slotData = {
                        date: new Date(currentDate),
                        startTime: startTime,
                        endTime: endTime,
                        durationMinutes: options.slotDurationMinutes,
                        capacity: options.capacity + Math.floor(Math.random() * 5), // Vary capacity slightly
                        status,
                        description: getSlotDescription(status),
                        createdBy: options.createdBy,
                    };
                    slotsToCreate.push(slotData);
                }
            }
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        console.log(`📅 Generated ${slotsToCreate.length} visit slots for November 2024`);
        // Create slots in batches to avoid overwhelming the database
        const batchSize = 50;
        for (let i = 0; i < slotsToCreate.length; i += batchSize) {
            const batch = slotsToCreate.slice(i, i + batchSize);
            await prisma.visitSlot.createMany({
                data: batch.map(slot => ({
                    date: slot.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    durationMinutes: slot.durationMinutes,
                    capacity: slot.capacity,
                    bookedCount: slot.status === 'booked' ? Math.floor(Math.random() * slot.capacity) + 1 : 0,
                    status: slot.status,
                    description: slot.description,
                    createdBy: slot.createdBy,
                })),
            });
            console.log(`✅ Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(slotsToCreate.length / batchSize)}`);
        }
        console.log('🎉 Visit slots seeding completed successfully!');
        // Print summary
        const summary = await prisma.visitSlot.groupBy({
            by: ['status'],
            _count: {
                status: true,
            },
        });
        console.log('\n📊 Summary:');
        summary.forEach(item => {
            console.log(`  ${item.status}: ${item._count.status} slots`);
        });
    }
    catch (error) {
        console.error('❌ Error seeding visit slots:', error);
        throw error;
    }
};
exports.generateNovemberSlots = generateNovemberSlots;
// Helper function to generate slot descriptions
const getSlotDescription = (status) => {
    const descriptions = {
        available: 'Available for booking',
        booked: 'Fully booked',
        cancelled: 'Cancelled due to maintenance',
        maintenance: 'Under maintenance - not available',
    };
    return descriptions[status];
};
// Main seeding function
const seedVisitSlots = async () => {
    try {
        // Get an admin user to assign as creator
        const adminUser = await prisma.user.findFirst({
            where: { role: 'admin' },
            select: { id: true },
        });
        if (!adminUser) {
            console.log('⚠️  No admin user found. Creating slots without creator assignment.');
        }
        await generateNovemberSlots(adminUser?.id);
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.seedVisitSlots = seedVisitSlots;
// Run the seeding if this file is executed directly
if (require.main === module) {
    seedVisitSlots();
}
//# sourceMappingURL=seedVisitSlots.js.map