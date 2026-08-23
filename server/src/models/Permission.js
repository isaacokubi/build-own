import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true, default: '' },
  module: { type: String, trim: true, default: 'general', index: true }
}, { timestamps: true });

export default mongoose.model('Permission', permissionSchema);
