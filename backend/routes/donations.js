const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const adminAuth = require('../middleware/auth');
const { sendDonationNotification } = require('../utils/mailer');
const {
  saveFallbackDonation,
  getFallbackDonations,
  updateFallbackDonationStatus
} = require('../utils/fallbackStorage');

/**
 * POST /api/donations
 * Public — submit a new donation
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, amount, cause } = req.body;

    // Validation
    if (!name || !email || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and amount are required.'
      });
    }

    if (amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least ₹1.'
      });
    }

    let donation;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        donation = await Donation.create({
          name: name.trim(),
          email: email.trim(),
          phone: phone ? phone.trim() : '',
          amount: Number(amount),
          cause: cause ? cause.trim() : 'Where Most Needed'
        });
      } catch (dbErr) {
        console.warn('Could not save to DB, using local fallback:', dbErr.message);
        donation = saveFallbackDonation({ name, email, phone, amount, cause });
      }
    } else {
      console.log('Database offline. Saving donation to fallback storage.');
      donation = saveFallbackDonation({ name, email, phone, amount, cause });
    }

    // Send email notification (non-blocking)
    sendDonationNotification(donation).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully!',
      data: {
        id: donation._id,
        name: donation.name,
        amount: donation.amount,
        cause: donation.cause
      }
    });
  } catch (err) {
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    console.error('Donation error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

/**
 * GET /api/donations
 * Admin — list all donations with pagination
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    if (!isDbConnected) {
      // Load fallback donations
      const allDonations = getFallbackDonations().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const total = allDonations.length;
      const donations = allDonations.slice(skip, skip + limit);

      // Aggregate stats
      const totalAmount = allDonations.reduce((sum, d) => sum + d.amount, 0);
      const count = allDonations.length;

      return res.json({
        success: true,
        data: donations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: { totalAmount, count },
        dbConnected: false
      });
    }

    const [donations, total] = await Promise.all([
      Donation.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Donation.countDocuments()
    ]);

    // Aggregate stats
    const stats = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || { totalAmount: 0, count: 0 },
      dbConnected: true
    });
  } catch (err) {
    console.error('Get donations error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PATCH /api/donations/:id/status
 * Admin — update donation status
 */
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    let donation;

    if (!isDbConnected || req.params.id.startsWith('fb-')) {
      donation = updateFallbackDonationStatus(req.params.id, status);
    } else {
      donation = await Donation.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
    }

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    res.json({ success: true, data: donation, dbConnected: isDbConnected });
  } catch (err) {
    console.error('Update donation status error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
