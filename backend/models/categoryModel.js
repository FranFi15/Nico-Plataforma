import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor, añade un nombre de categoría'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['blog', 'course', 'general', 'videoteca'],
      default: 'general',
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ name: 1, type: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
