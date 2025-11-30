import mongoose from 'mongoose';
import schema from './schema.js';

const model = mongoose.model("DiscussionsModel", schema);
export default model;