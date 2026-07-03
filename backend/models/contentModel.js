import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
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
    contentType: {
      type: String,
      required: [true, 'Por favor, especifica el tipo de contenido'],
      enum: {
        values: ['course', 'blog', 'workshop', 'videoteca'],
        message: '{VALUE} no es un tipo de contenido válido',
      },
    },
    accessType: {
      type: String,
      required: [true, 'Por favor, especifica el tipo de acceso'],
      enum: {
        values: ['free', 'subscription', 'one-time-purchase'],
        message: '{VALUE} no es un tipo de acceso válido',
      },
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    priceUsd: {
      type: Number,
      required: true,
      default: 0,
    },
    priceArs: {
      type: Number,
      required: true,
      default: 0,
    },
    cardImage: {
      type: String,
      default: '',
    },
    cardImagePosition: {
      type: String,
      default: '50%',
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    body: {
      type: String,
      default: '',
    },
    videoFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideotecaFolder',
    },
    videoLink: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model('Content', contentSchema);

export default Content;
