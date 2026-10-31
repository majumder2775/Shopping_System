import 'dotenv/config';
import mongoose from 'mongoose';
import { seedDatabase } from './seed';

await mongoose.connect(process.env.MONGODB_URI!);
await seedDatabase(true);
console.log('Database reset and seeded (demo password: Shop@1234).');
await mongoose.disconnect();
