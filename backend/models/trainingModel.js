import mongoose from 'mongoose';

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Por favor, añade un título'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Por favor, añade una descripción'],
    },
    subDescription: {
      type: String,
      trim: true,
    },
    youtubeShortLink: {
      type: String,
      trim: true,
    },
    googleFormLink: {
      type: String,
      required: [true, 'Por favor, añade un link al formulario de Google'],
      trim: true,
    },
    athletePhotos: [
      {
        url: {
          type: String,
        },
        fullname: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Training = mongoose.model('Training', trainingSchema);

export default Training;
