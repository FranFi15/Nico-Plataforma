import mongoose from 'mongoose';

const transactionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'ARS',
  },
  platform: {
    type: String,
    enum: ['mercadopago', 'paypal'],
    required: true,
  },
  type: {
    type: String,
    enum: ['one-time-purchase', 'subscription'],
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: false,
  },
  status: {
    type: String,
    enum: ['completed', 'failed', 'refunded'],
    default: 'completed',
  },
  externalId: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
