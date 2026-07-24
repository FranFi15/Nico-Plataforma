import mongoose from 'mongoose';

const kinventCertificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    contentTitle: {
      type: String,
      required: true,
    },
    isSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user is only certified once per content
kinventCertificationSchema.index({ user: 1, content: 1 }, { unique: true });

const KinventCertification = mongoose.model('KinventCertification', kinventCertificationSchema);

export default KinventCertification;
