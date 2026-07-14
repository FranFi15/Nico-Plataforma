import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Por favor ingresa un código de descuento'],
      unique: true,
      uppercase: true,
      trim: true
    },
    discountPercentage: {
      type: Number,
      required: [true, 'Por favor ingresa el porcentaje de descuento'],
      min: 1,
      max: 100,
      default: 10
    },
    applyToAll: {
      type: Boolean,
      default: true // Si es true, se puede aplicar a TODOS los cursos
    },
    applicableCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
      }
    ],
    active: {
      type: Boolean,
      default: true
    },
    usedCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
