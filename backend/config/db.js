const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bhavprita';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.log(`📦 MongoDB offline (${err.message}). Using local JSON fallback storage in backend/data/ for zero-setup persistence.`);
  }
};

module.exports = connectDB;
