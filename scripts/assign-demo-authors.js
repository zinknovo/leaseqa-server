import 'dotenv/config';
import mongoose from 'mongoose';
import PostsModel from '../LeaseQA/Posts/model.js';
import UsersModel from '../LeaseQA/Users/model.js';

const mongoUrl = process.env.DATABASE_CONNECTION_STRING;
if (!mongoUrl) {
  console.error('DATABASE_CONNECTION_STRING is required');
  process.exit(1);
}

async function main() {
  await mongoose.connect(mongoUrl);

  const tenant = await UsersModel.findOne({email: 'tenant@leaseqa.dev'});
  const admin = await UsersModel.findOne({email: 'admin@leaseqa.dev'});
  const authorId = tenant?._id || admin?._id;
  if (!authorId) throw new Error('No demo users found; run seed-demo-users first.');

  // set all posts to demo author, clear invalid fromAIReviewId, and mark as non-anonymous
  const res = await PostsModel.updateMany(
    {},
    {
      $set: {
        authorId,
        isAnonymous: false,
        fromAIReviewId: null,
      },
    }
  );
  console.log(`Updated ${res.modifiedCount} posts with author ${authorId}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
