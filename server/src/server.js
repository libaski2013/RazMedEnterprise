import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { connectDB } from './config/db.js';
import authPlugin from './plugins/auth.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import branchRoutes from './routes/branches.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import customerRoutes from './routes/customers.routes.js';
import supplierRoutes from './routes/suppliers.routes.js';
import procurementRoutes from './routes/procurement.routes.js';
import posRoutes from './routes/pos.routes.js';
import expenseRoutes from './routes/expenses.routes.js';
import approvalRoutes from './routes/approvals.routes.js';
import accountingRoutes from './routes/accounting.routes.js';
import siteRoutes from './routes/site.routes.js';
import reconciliationRoutes from './routes/reconciliation.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import smsRoutes from './routes/sms.routes.js';
import toolsRoutes from './routes/tools.routes.js';
import performanceRoutes from './routes/performance.routes.js';
import workforceRoutes from './routes/workforce.routes.js';
import taxRoutes from './routes/tax.routes.js';

const fastify = Fastify({ logger: true, bodyLimit: 25 * 1024 * 1024, trustProxy: true });

await connectDB(fastify.log);

const defaultProductionOrigin = 'https://razmedenterprise-production.up.railway.app';
const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(value => value.trim()).filter(Boolean)
  : process.env.NODE_ENV === 'production' ? [defaultProductionOrigin] : [];
const nativeOrigins = new Set(['capacitor://localhost', 'https://localhost', 'http://localhost']);
await fastify.register(cors, {
  origin(origin, callback) {
    const localDevelopment = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
    const developmentFallback = process.env.NODE_ENV !== 'production' && !configuredOrigins.length;
    const allowed = !origin || developmentFallback || configuredOrigins.includes(origin) || nativeOrigins.has(origin) || localDevelopment;
    callback(null, allowed);
  },
});
fastify.addHook('onSend', async (request, reply, payload) => {
  reply
    .header('X-Content-Type-Options', 'nosniff')
    .header('X-Frame-Options', 'DENY')
    .header('Referrer-Policy', 'strict-origin-when-cross-origin')
    .header('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()')
    .header('Cross-Origin-Opener-Policy', 'same-origin')
    .header('Cross-Origin-Resource-Policy', 'same-origin');
  if (process.env.NODE_ENV === 'production') {
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    reply.header('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
  }
  return payload;
});
await fastify.register(authPlugin);

await fastify.register(authRoutes);
await fastify.register(userRoutes);
await fastify.register(dashboardRoutes);
await fastify.register(branchRoutes);
await fastify.register(inventoryRoutes);
await fastify.register(customerRoutes);
await fastify.register(supplierRoutes);
await fastify.register(procurementRoutes);
await fastify.register(posRoutes);
await fastify.register(expenseRoutes);
await fastify.register(approvalRoutes);
await fastify.register(accountingRoutes);
await fastify.register(siteRoutes);
await fastify.register(reconciliationRoutes);
await fastify.register(analyticsRoutes);
await fastify.register(payrollRoutes);
await fastify.register(smsRoutes);
await fastify.register(toolsRoutes);
await fastify.register(performanceRoutes);
await fastify.register(workforceRoutes);
await fastify.register(taxRoutes);

fastify.get('/api/health', async () => {
  return {
    ok: true,
    release: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
    company: 'RazMed Enterprise',
    scope: 'automotive-retail',
  };
});
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(currentDir, '../../dist');
await fastify.register(fastifyStatic, { root: webRoot, wildcard: false });
fastify.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith('/api/')) return reply.code(404).send({ error: 'API route not found' });
  return reply.sendFile('index.html');
});

const port = Number(process.env.PORT) || 4000;
fastify
  .listen({ port, host: '0.0.0.0' })
  .then(() => {
    fastify.log.info(`RAZMED backend listening on port ${port}`);
  })
  .catch((err) => {
    fastify.log.error(err);
    process.exit(1);
  });
