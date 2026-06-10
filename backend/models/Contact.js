const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: 60
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  subject: {
    type: String,
    trim: true,
    default: 'General Enquiry'
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: 5000
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for admin queries
contactSchema.index({ createdAt: -1 });
contactSchema.index({ isRead: 1 });

module.exports = mongoose.model('Contact', contactSchema);
