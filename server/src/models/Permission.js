import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
  module: { type: String, trim: true, index: true }
}, { timestamps: true });
export default mongoose.model('Permission', permissionSchema);
