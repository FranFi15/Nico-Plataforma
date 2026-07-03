import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor, añade un nombre a la carpeta'],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate items in a folder at schema level if needed, 
// though we will handle this in the controller as well.
const Folder = mongoose.model('Folder', folderSchema);

export default Folder;
