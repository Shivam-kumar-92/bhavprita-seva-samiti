const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const adminAuth = require('../middleware/auth');
const { sendContactNotification } = require('../utils/mailer');
const {
  saveFallbackContact,
  getFallbackContacts,
  toggleFallbackContactRead,
  deleteFallbackContact
} = require('../utils/fallbackStorage');

/**
 * POST /api/contacts
 * Public — submit a new contact message
 */
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    // Validation
    if (!firstName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'First name, email, and message are required.'
      });
    }

    let contact;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        contact = await Contact.create({
          firstName: firstName.trim(),
          lastName: lastName ? lastName.trim() : '',
          email: email.trim(),
          subject: subject ? subject.trim() : 'General Enquiry',
          message: message.trim()
        });
      } catch (dbErr) {
        console.warn('Could not save to DB, using local fallback:', dbErr.message);
        contact = saveFallbackContact({ firstName, lastName, email, subject, message });
      }
    } else {
      console.log('Database offline. Saving contact to fallback storage.');
      contact = saveFallbackContact({ firstName, lastName, email, subject, message });
    }

    // Send email notification (non-blocking)
    sendContactNotification(contact).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: {
        id: contact._id,
        firstName: contact.firstName
      }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    console.error('Contact error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

/**
 * GET /api/contacts
 * Admin — list all contact messages with pagination
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    if (!isDbConnected) {
      const allContacts = getFallbackContacts().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const total = allContacts.length;
      const contacts = allContacts.slice(skip, skip + limit);
      const unreadCount = allContacts.filter(c => !c.isRead).length;

      return res.json({
        success: true,
        data: contacts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount,
        dbConnected: false
      });
    }

    const [contacts, total, unreadCount] = await Promise.all([
      Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(),
      Contact.countDocuments({ isRead: false })
    ]);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount,
      dbConnected: true
    });
  } catch (err) {
    console.error('Get contacts error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PATCH /api/contacts/:id/read
 * Admin — toggle message read status
 */
router.patch('/:id/read', adminAuth, async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let contact;

    if (!isDbConnected || req.params.id.startsWith('fb-')) {
      contact = toggleFallbackContactRead(req.params.id);
    } else {
      contact = await Contact.findById(req.params.id);
      if (contact) {
        contact.isRead = !contact.isRead;
        await contact.save();
      }
    }

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, data: contact, dbConnected: isDbConnected });
  } catch (err) {
    console.error('Toggle read error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * DELETE /api/contacts/:id
 * Admin — delete a contact message
 */
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let success = false;

    if (!isDbConnected || req.params.id.startsWith('fb-')) {
      success = deleteFallbackContact(req.params.id);
    } else {
      const contact = await Contact.findByIdAndDelete(req.params.id);
      success = !!contact;
    }

    if (!success) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, message: 'Message deleted', dbConnected: isDbConnected });
  } catch (err) {
    console.error('Delete contact error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
