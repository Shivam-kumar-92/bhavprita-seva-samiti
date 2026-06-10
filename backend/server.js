require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { initMailer } = require('./utils/mailer');
const Razorpay = require('razorpay');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ───
connectDB();

// ─── Initialize Mailer ───
initMailer();

// Initialize Razorpay instance using environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ─── Middleware ───
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limit for form submissions
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                     // 10 submissions per window
  message: {
    success: false,
    message: 'Too many submissions. Please try again later.'
  }
});

// ─── Static Files ───
// Serve admin dashboard
app.use(express.static(path.join(__dirname, 'public')));

// Serve the parent directory (NGO.html + images)
app.use(express.static(path.join(__dirname, '..')));


// =======================================================
// 📡 RAZORPAY PAYMENT ROUTE (Must be before general routes)
// =======================================================
app.post('/api/donations/create-order', apiLimiter, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const options = {
      amount: parseInt(amount) * 100, // Safe conversion to integer paisa
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
});


// ─── API Routes Mounting ───
const donationRoutes = require('./routes/donations');
const contactRoutes = require('./routes/contacts');

// Apply general api rate limits
// Note: Hataya 'app.post(/api/donations)' yahan se taaki create-order crash na kare
app.use('/api/donations', apiLimiter);
app.use('/api/contacts', apiLimiter);

// Specific stricter limit for direct fallback post submsissions if any
app.post('/api/contacts', formLimiter);

// Mount main routers
app.use('/api/donations', donationRoutes);
app.use('/api/contacts', contactRoutes);

// ─── Root → serve NGO.html ───
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'NGO.html'));
});

// ─── 404 Handler ───
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ─── Start Server ───
app.listen(PORT, () => {
  console.log('');
  console.log('🌱 ═══════════════════════════════════════════');
  console.log(`   Bhavprita Seva Samiti — Backend Server`);
  console.log('   ─────────────────────────────────────────');
  console.log(`   🌐 Website:    http://localhost:${PORT}`);
  console.log(`   🔧 Admin:      http://localhost:${PORT}/admin.html`);
  console.log(`   📡 API:        http://localhost:${PORT}/api`);
  console.log('🌱 ═══════════════════════════════════════════');
  console.log('');
});