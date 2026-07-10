import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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
import evaluationRoutes from './routes/evaluationRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

// Load environment variables (from .env file)
dotenv.config();

// Connect to Database
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Static file serving for uploaded PDFs and files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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
app.use('/api/evaluations', evaluationRoutes);

// Custom Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
// Nodemon trigger change

