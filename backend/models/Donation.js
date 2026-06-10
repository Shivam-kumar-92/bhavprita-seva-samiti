const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [1, 'Amount must be at least ₹1']
  },
  cause: {
    type: String,
    trim: true,
    default: 'Where Most Needed'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for admin queries
donationSchema.index({ createdAt: -1 });
donationSchema.index({ status: 1 });

module.exports = mongoose.model('Donation', donationSchema);
