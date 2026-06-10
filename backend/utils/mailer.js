const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter if SMTP is configured.
 * Returns null if SMTP credentials are not set.
 */
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('⚠️  SMTP not configured — email notifications disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT) || 587,
    secure: parseInt(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

let transporter = null;

/**
 * Initialize the mailer (call once at startup).
 */
function initMailer() {
  transporter = createTransporter();
}

/**
 * Send a donation notification email.
 */
async function sendDonationNotification(donation) {
  if (!transporter) return;

  const html = `
    <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8faf5;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#052e16,#166534);padding:32px 28px;text-align:center">
        <h1 style="color:#4ade80;font-size:24px;margin:0 0 6px">🌱 New Donation Received!</h1>
        <p style="color:rgba(255,255,255,.7);font-size:14px;margin:0">Bhavprita Seva Samiti</p>
      </div>
      <div style="padding:28px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:10px 0;color:#475569;font-size:13px;font-weight:600;width:120px">Name</td><td style="padding:10px 0;color:#1e293b;font-size:15px">${donation.name}</td></tr>
          <tr><td style="padding:10px 0;color:#475569;font-size:13px;font-weight:600">Email</td><td style="padding:10px 0;color:#1e293b;font-size:15px">${donation.email}</td></tr>
          <tr><td style="padding:10px 0;color:#475569;font-size:13px;font-weight:600">Phone</td><td style="padding:10px 0;color:#1e293b;font-size:15px">${donation.phone || '—'}</td></tr>
          <tr><td style="padding:10px 0;color:#475569;font-size:13px;font-weight:600">Amount</td><td style="padding:10px 0;color:#16a34a;font-size:20px;font-weight:900">₹${donation.amount.toLocaleString('en-IN')}</td></tr>
          <tr><td style="padding:10px 0;color:#475569;font-size:13px;font-weight:600">Cause</td><td style="padding:10px 0;color:#1e293b;font-size:15px">${donation.cause}</td></tr>
        </table>
        <div style="margin-top:24px;padding:16px;background:rgba(22,163,74,.08);border-radius:12px;text-align:center">
          <p style="color:#166534;font-size:13px;margin:0">View in <a href="http://localhost:${process.env.PORT || 5000}/admin.html" style="color:#16a34a;font-weight:700">Admin Dashboard</a></p>
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Bhavprita Seva Samiti" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: `🌱 New Donation: ₹${donation.amount.toLocaleString('en-IN')} from ${donation.name}`,
      html
    });
    console.log('📧 Donation notification email sent.');
  } catch (err) {
    console.error('❌ Failed to send donation email:', err.message);
  }
}

/**
 * Send a contact message notification email.
 */
async function sendContactNotification(contact) {
  if (!transporter) return;

  const html = `
    <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8faf5;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#052e16,#0f3d5e);padding:32px 28px;text-align:center">
        <h1 style="color:#38bdf8;font-size:24px;margin:0 0 6px">✉️ New Contact Message</h1>
        <p style="color:rgba(255,255,255,.7);font-size:14px;margin:0">Bhavprita Seva Samiti</p>
      </div>
      <div style="padding:28px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:10px 0;color:#475569;font-size:13px;font-weight:600;width:120px">Name</td><td style="padding:10px 0;color:#1e293b;font-size:15px">${contact.firstName} ${contact.lastName}</td></tr>
          <tr><td style="padding:10px 0;color:#475569;font-size:13px;font-weight:600">Email</td><td style="padding:10px 0;color:#1e293b;font-size:15px">${contact.email}</td></tr>
          <tr><td style="padding:10px 0;color:#475569;font-size:13px;font-weight:600">Subject</td><td style="padding:10px 0;color:#1e293b;font-size:15px">${contact.subject}</td></tr>
        </table>
        <div style="margin-top:18px;padding:18px;background:#fff;border:1px solid #e2e8f0;border-radius:12px">
          <p style="color:#475569;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Message</p>
          <p style="color:#1e293b;font-size:15px;line-height:1.7;margin:0;white-space:pre-wrap">${contact.message}</p>
        </div>
        <div style="margin-top:24px;padding:16px;background:rgba(2,132,199,.08);border-radius:12px;text-align:center">
          <p style="color:#0c4a6e;font-size:13px;margin:0">View in <a href="http://localhost:${process.env.PORT || 5000}/admin.html" style="color:#0284c7;font-weight:700">Admin Dashboard</a></p>
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Bhavprita Seva Samiti" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: `✉️ New Contact: ${contact.subject} — from ${contact.firstName}`,
      html
    });
    console.log('📧 Contact notification email sent.');
  } catch (err) {
    console.error('❌ Failed to send contact email:', err.message);
  }
}

module.exports = {
  initMailer,
  sendDonationNotification,
  sendContactNotification
};
