import mongoose from 'mongoose';

const zoomEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['zoom', 'news'],
      default: 'zoom',
    },
    title: {
      type: String,
      required: [true, 'Por favor ingresa un título'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    zoomUrl: {
      type: String,
      default: '',
      trim: true,
    },
    eventDate: {
      type: Date,
      default: Date.now,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'members', 'courses', 'specific_course'],
      default: 'all',
    },
    targetCourseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      default: null,
    },
    notifiedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ZoomEvent = mongoose.model('ZoomEvent', zoomEventSchema);

export default ZoomEvent;
