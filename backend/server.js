import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import paypalRoutes from './routes/paypalRoutes.js';
import trainingRoutes from './routes/trainingRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import videotecaFolderRoutes from './routes/videotecaFolderRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

// Load environment variables (from .env file)
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API del Backend MERN' });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/payments/mercadopago', paymentRoutes);
app.use('/api/payments/paypal', paypalRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/videoteca-folders', videotecaFolderRoutes);

// Custom Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
// Nodemon trigger change

