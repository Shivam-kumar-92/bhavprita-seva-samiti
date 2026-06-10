const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`⚠️ MongoDB connection warning: ${err.message}`);
    console.warn('⚠️ Server is running without a database. Form submissions will only trigger emails (if configured) but will not be saved.');
  }
};

module.exports = connectDB;
