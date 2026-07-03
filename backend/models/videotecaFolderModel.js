import mongoose from 'mongoose';

const videotecaFolderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor, añade un nombre a la carpeta de video'],
      trim: true,
      unique: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const VideotecaFolder = mongoose.model('VideotecaFolder', videotecaFolderSchema);

export default VideotecaFolder;
