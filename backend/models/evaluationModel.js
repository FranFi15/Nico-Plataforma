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
    colectivoVideos: [
      {
        type: String,
      }
    ],
    individualPdfUrl: {
      type: String,
      default: '/Evaluaciones_Kinvent.pdf',
    },
    individualFormLink: {
      type: String,
      default: 'https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform',
    },
    individualVideos: [
      {
        type: String,
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

export default Evaluation;
