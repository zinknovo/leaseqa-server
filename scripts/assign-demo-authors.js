import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import PostsModel from '../LeaseQA/Posts/model.js';
import UsersModel from '../LeaseQA/Users/model.js';

const mongoUrl = process.env.DATABASE_CONNECTION_STRING;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;

if (!DEMO_PASSWORD) {
  console.error("DEMO_PASSWORD is required in .env");
  process.exit(1);
}
const demoUsers = [
  { email: 'admin@leaseqa.dev', username: 'Demo Admin', role: 'admin' },
  { email: 'tenant@leaseqa.dev', username: 'Demo Tenant', role: 'tenant' },
  { email: 'casey@leaseqa.dev', username: 'Casey Tenant', role: 'tenant' },
  { email: 'jordan@leaseqa.dev', username: 'Jordan Renter', role: 'tenant' },
  { email: 'sam@leaseqa.dev', username: 'Sam Subletter', role: 'tenant' },
  { email: 'alex@leaseqa.dev', username: 'Alex Apartment', role: 'tenant' },
  { email: 'riley@leaseqa.dev', username: 'Riley Resident', role: 'tenant' },
  { email: 'lena@leaseqa.dev', username: 'Lena Lawyer', role: 'lawyer' },
  { email: 'marcus@leaseqa.dev', username: 'Marcus Attorney', role: 'lawyer' },
];

if (!mongoUrl) {
  console.error('DATABASE_CONNECTION_STRING is required');
  process.exit(1);
}

async function main() {
  await mongoose.connect(mongoUrl);

  const hashed = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const ids = [];
  for (const u of demoUsers) {
    const user = await UsersModel.findOneAndUpdate(
      { email: u.email },
      {
        username: u.username,
        email: u.email,
        role: u.role,
        hashedPassword: hashed,
        banned: false,
      },
      { upsert: true, new: true }
    );
    ids.push(user._id);
  }

  const posts = await PostsModel.find({}).sort({ createdAt: 1 });
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    post.authorId = ids[i % ids.length];
    post.isAnonymous = false;
    post.fromAIReviewId = null;
    await post.save();
  }

  console.log(`Seeded demo users (${ids.length}) and updated ${posts.length} posts.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
