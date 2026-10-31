import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { seedDatabase } from './seed';
import { HttpError } from './auth';
import path from 'path';

const { MONGODB_URI, PORT = '5000', CLIENT_ORIGIN = 'http://localhost:3000' } = process.env;
if (!MONGODB_URI) throw new Error('MONGODB_URI is missing. Copy .env.example to .env and add your Atlas connection string.');

const app = express();
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // let the frontend load /uploads images
}));
app.use(cors({ origin: CLIENT_ORIGIN.split(','), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, limit: 100, standardHeaders: true, legacyHeaders: false }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));
app.use('/api', routes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Route not found.' }));

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  let status = err instanceof HttpError ? err.status : 500;
  let message = err.message;
  if (err.code === 11000) { status = 409; message = 'Duplicate value: that SKU / email already exists.'; }
  else if (err.name === 'ValidationError' || err.name === 'CastError') status = 400;
  else if (err.name === 'MulterError') { status = 400; message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 2 MB.' : err.message; }
  else if (status === 500) { console.error(err); message = 'Internal server error.'; }
  res.status(status).json({ error: message });
});

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Atlas connected:', mongoose.connection.name);
    // make sure unique indexes (sku, email, orderNumber) exist before accepting traffic
    await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
    if (await seedDatabase()) console.log('Empty database detected: seeded demo data.');
    app.listen(+PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  })
  .catch((e) => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
