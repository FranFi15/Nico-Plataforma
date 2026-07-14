import mongoose from 'mongoose';

const benefitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Por favor ingresa el título del local o beneficio'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Por favor ingresa la descripción del descuento y cómo utilizarlo'],
    },
    logoUrl: {
      type: String,
      required: [true, 'Por favor sube la imagen/logo del local']
    },
    discountText: {
      type: String,
      default: '' // Ej: "20% OFF", "2x1", "Envío Gratis"
    },
    linkUrl: {
      type: String,
      default: '' // Enlace a la web o Instagram del local
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Benefit = mongoose.model('Benefit', benefitSchema);

export default Benefit;
