import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema(
  {
    colectivoPdfUrl: {
      type: String,
      default: '/Evaluaciones_Kinvent.pdf',
    },
    colectivoFormLink: {
      type: String,
      default: 'https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform',
    },
    individualPdfUrl: {
      type: String,
      default: '/Evaluaciones_Kinvent.pdf',
    },
    individualFormLink: {
      type: String,
      default: 'https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform',
    },
  },
  {
    timestamps: true,
  }
);

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

export default Evaluation;
