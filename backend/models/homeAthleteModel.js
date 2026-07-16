import mongoose from 'mongoose';

const homeAthleteSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Por favor, añade un nombre para el atleta'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Por favor, añade una URL o foto para el atleta'],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const HomeAthlete = mongoose.model('HomeAthlete', homeAthleteSchema);

export default HomeAthlete;
