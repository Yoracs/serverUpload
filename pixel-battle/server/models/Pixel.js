import mongoose from 'mongoose';

const pixelSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true,
    min: 0
  },
  y: {
    type: Number,
    required: true,
    min: 0
  },
  color: {
    type: String,
    required: true,
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  placedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  placedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for unique x,y position
pixelSchema.index({ x: 1, y: 1 }, { unique: true });

export default mongoose.model('Pixel', pixelSchema);
