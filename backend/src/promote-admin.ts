import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './models';

const MONGODB_URI = process.env.MONGODB_URI;
const email = process.argv[2]?.trim().toLowerCase();
if (!MONGODB_URI) throw new Error('MONGODB_URI is missing. Add it to your backend .env file.');
if (!email) throw new Error('Usage: npm run promote-admin -- your-registered-email@example.com');

async function main() {
  await mongoose.connect(MONGODB_URI!);
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`No account found for ${email}. Register this account through the app first, then run this command again.`);
    await mongoose.disconnect();
    process.exitCode = 1;
    return;
  }
  user.role = 'admin';
  await user.save();
  console.log(`Administrator access granted to ${user.email}. Sign out and sign in again for the new role to take effect.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Could not promote account:', error.message);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
