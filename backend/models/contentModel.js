import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctOptionIndex: { type: Number, default: 0 },
  explanation: { type: String, default: '' }
});

const lessonSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['lesson', 'quiz'], default: 'lesson' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  duration: { type: String, default: '' },
  videoLink: { type: String, default: '' },
  body: { type: String, default: '' },
  isPublished: { type: Boolean, default: true },
  attachments: [
    {
      title: { type: String, required: true },
      url: { type: String, required: true }
    }
  ],
  passingScore: { type: Number, default: 70 },
  questions: [questionSchema]
});

const moduleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  lessons: [lessonSchema]
});

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    profession: { type: String, default: '' },
    rating: { type: Number, required: true, default: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

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
    memberDiscountPercentage: {
      type: Number,
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
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
    body: {
      type: String,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
    videoFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideotecaFolder',
    },
    videoLink: {
      type: String,
      default: '',
    },
    attachments: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        fileType: { type: String, default: 'file' }
      }
    ],
    modules: [moduleSchema],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    certificate: {
      type: Boolean,
      default: true,
    },
    duration: {
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
