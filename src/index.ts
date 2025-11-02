// Import dotenv to load environment variables
import 'dotenv/config';

// Import Express
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import visitorRoutes from './routes/visitorRoutes';
import visitorSlotRoutes from './routes/visitorSlotRoutes';
import bookingRoutes from './routes/bookingRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import publicScheduleRoutes from './routes/publicScheduleRoutes';
import publicBookingRoutes from './routes/publicBookingRoutes';
import notificationRoutes from './routes/notificationRoutes';
import reportsRoutes from './routes/reportsRoutes';
import systemLogRoutes from './routes/systemLogRoutes';
import { startSlotExpiryScheduler } from './scripts/slotExpiryScheduler';
import { startBookingReminderScheduler } from './scripts/bookingReminderScheduler';

// Create an Express application
const app: Express = express();
const port: number = 3000;

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',    // React default port
    'http://localhost:3001',    // Alternative React port
    'http://localhost:5173',    // Vite default port
    'http://localhost:5174',    // Vite alternative port
    'http://localhost:8080',    // Alternative frontend port
    'http://127.0.0.1:3000',    // Alternative localhost
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:8080',
    // Add your production frontend URL here when deploying
    // 'https://your-frontend-domain.com'
  ],
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Public API Routes (no authentication required)
app.use('/api/v1/public/schedule', publicScheduleRoutes);
app.use('/api/v1/public/booking', publicBookingRoutes);

// API Routes (authentication required)
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/visitors', visitorRoutes);
app.use('/api/v1/visitor-slot', visitorSlotRoutes);
app.use('/api/v1/booking', bookingRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/schedule', scheduleRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/system-logs', systemLogRoutes);
app.use('/api/v1/reports', reportsRoutes);

// Define a route handler for the default home page
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'VisitEase Backend API',
    version: '1.0.0',
    endpoints: {
      user: {
        register: 'POST /api/v1/user/register',
        profile: 'GET /api/v1/user/:id'
      },
      auth: {
        login: 'POST /api/v1/auth/login',
        refresh: 'POST /api/v1/auth/refresh',
        logout: 'POST /api/v1/auth/logout'
      },
      visitor: {
        register: 'POST /api/v1/visitor/register',
        get: 'GET /api/v1/visitor/:id',
        getAll: 'GET /api/v1/visitor',
        update: 'PUT /api/v1/visitor/:id',
        delete: 'DELETE /api/v1/visitor/:id',
        stats: 'GET /api/v1/visitor/stats'
      },
      visitorSlot: {
        book: 'POST /api/v1/visitor-slot/book',
        get: 'GET /api/v1/visitor-slot/:id',
        getAll: 'GET /api/v1/visitor-slot',
        update: 'PUT /api/v1/visitor-slot/:id',
        cancel: 'PATCH /api/v1/visitor-slot/:id/cancel',
        delete: 'DELETE /api/v1/visitor-slot/:id',
        availability: 'GET /api/v1/visitor-slot/availability/:slotId/:date',
        stats: 'GET /api/v1/visitor-slot/stats'
      },
      booking: {
        create: 'POST /api/v1/booking',
        get: 'GET /api/v1/booking/:id',
        getAll: 'GET /api/v1/booking',
        update: 'PUT /api/v1/booking/:id',
        confirm: 'PUT /api/v1/booking/:id/confirm',
        cancel: 'PUT /api/v1/booking/:id/cancel',
        delete: 'DELETE /api/v1/booking/:id'
      },
      dashboard: {
        stats: 'GET /api/v1/dashboard/stats',
        upcomingVisits: 'GET /api/v1/dashboard/upcoming-visits',
        recentActivity: 'GET /api/v1/dashboard/recent-activity',
        revenueTrend: 'GET /api/v1/dashboard/revenue-trend'
      },
      schedule: {
        slots: 'GET /api/v1/schedule/slots',
        slot: 'GET /api/v1/schedule/slots/:id',
        create: 'POST /api/v1/schedule/slots',
        update: 'PUT /api/v1/schedule/slots/:id',
        delete: 'DELETE /api/v1/schedule/slots/:id',
        statistics: 'GET /api/v1/schedule/statistics',
        issues: 'GET /api/v1/schedule/issues'
      },
      notifications: {
        getAll: 'GET /api/v1/notifications',
        get: 'GET /api/v1/notifications/:id',
        create: 'POST /api/v1/notifications',
        send: 'PUT /api/v1/notifications/:id/send',
        updateStatus: 'PUT /api/v1/notifications/:id/status',
        delete: 'DELETE /api/v1/notifications/:id',
        templates: 'GET /api/v1/notifications/templates',
        createTemplate: 'POST /api/v1/notifications/templates'
      },
      systemLogs: {
        getAll: 'GET /api/v1/system-logs',
        get: 'GET /api/v1/system-logs/:id',
        stats: 'GET /api/v1/system-logs/stats/overview',
        cleanup: 'DELETE /api/v1/system-logs/cleanup'
      }
    }
  });
});

// 404 handler - catch all routes

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start the server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  console.log(`[server]: API Documentation available at http://localhost:${port}`);
  // Start background schedulers
  startSlotExpiryScheduler();
  startBookingReminderScheduler();
});