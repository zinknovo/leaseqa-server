import mongoose from 'mongoose';
import schema from './schema.js';

const model = mongoose.model("PostsModel", schema);
export default model;