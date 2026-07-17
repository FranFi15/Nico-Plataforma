import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor, añade un nombre'],
    },
    email: {
      type: String,
      required: [true, 'Por favor, añade un correo electrónico'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Por favor, añade una contraseña'],
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'professor', 'profe', 'instructor', 'admin'],
      default: 'student',
    },
    profession: {
      type: String,
      default: '',
    },
    membership: {
      type: String,
      required: true,
      enum: ['free', 'premium'],
      default: 'free',
    },
    isSubscribed: {
      type: Boolean,
      required: true,
      default: false,
    },
    subscriptionId: {
      type: String,
      default: null,
    },
    membershipExpiresAt: {
      type: Date,
      default: null,
    },
    purchasedItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content',
      },
    ],
    notifications: [
      {
        title: { type: String, required: true },
        message: { type: String, required: true },
        link: { type: String, default: '' },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Match entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
