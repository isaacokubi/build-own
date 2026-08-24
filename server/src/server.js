import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import mongoose from 'mongoose';
import tenantRoutes from './routes/tenantRoutes.js';
import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import constructionCoreRoutes from './routes/constructionCoreRoutes.js';
import financeProcurementRoutes from './routes/financeProcurementRoutes.js';
import hrRoutes from './routes/hrRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import procurementRoutes from './routes/procurementRoutes.js';
import hrPayrollRoutes from './routes/hrPayrollRoutes.js';
import safetyQualityRoutes from './routes/safetyQualityRoutes.js';
import documentReportRoutes from './routes/documentReportRoutes.js';
import notificationAuditRoutes from './routes/notificationAuditRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import { requireHttpsInProduction } from './middleware/securityHeaders.js';
import { requestContext } from './middleware/requestContext.js';
import { observability } from './middleware/observability.js';
import { isAllowedCorsOrigin } from './config/cors.js';
import { requireAuth } from './middleware/auth.js';
import { requireTenantSubscription } from './middleware/tenantAccess.js';
import { startSubscriptionExpiryNotificationScheduler } from './utils/subscriptionNotifications.js';

const app = express();
const port = Number(process.env.PORT || 5000);

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);

app.use(helmet());
app.use(requestContext);
app.use(observability);
app.use(requireHttpsInProduction);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedCorsOrigin(origin)) return callback(null, true);
      const error = new Error(`CORS blocked origin: ${origin}`);
      error.status = 403;
      error.code = 'CORS_ORIGIN_DENIED';
      return callback(error);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use('/api/health', healthRoutes);
app.use('/api/backup', backupRoutes);
app.get('/api/health', (_req, res) =>
  res.json({
    success: true,
    service: 'construction-api',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  }),
);
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);

const subscriptionProtected = [requireAuth, requireTenantSubscription];
app.use('/api/roles', ...subscriptionProtected, roleRoutes);
app.use('/api/construction', ...subscriptionProtected, constructionCoreRoutes);
app.use('/api/finance', ...subscriptionProtected, financeProcurementRoutes);
app.use('/api/hr', ...subscriptionProtected, hrRoutes);
app.use('/api/payroll', ...subscriptionProtected, payrollRoutes);
app.use('/api/equipment', ...subscriptionProtected, equipmentRoutes);
app.use('/api/inventory', ...subscriptionProtected, inventoryRoutes);
app.use('/api/procurement', ...subscriptionProtected, procurementRoutes);
app.use('/api/hr-payroll', ...subscriptionProtected, hrPayrollRoutes);
app.use('/api/safety-quality', ...subscriptionProtected, safetyQualityRoutes);
app.use('/api/documents-reporting', ...subscriptionProtected, documentReportRoutes);
app.use('/api/notifications-audit', notificationAuditRoutes);

app.use((_req, res) =>
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
  }),
);

app.use((err, req, res, _next) => {
  console.error({
    requestId: req.requestId,
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: err.code || 'INTERNAL_ERROR',
    requestId: req.requestId,
  });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  startSubscriptionExpiryNotificationScheduler();
  app.listen(port, () => console.log(`Construction API listening on ${port}`));
}

if (process.env.NODE_ENV !== 'test') {
  start().catch((error) => {
    console.error('Startup failed:', error);
    process.exit(1);
  });
}

export default app;
