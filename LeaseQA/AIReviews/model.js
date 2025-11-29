import mongoose from 'mongoose';
import schema from './schema.js';

const model = mongoose.model("AIReviewsModel", schema);
export default model;