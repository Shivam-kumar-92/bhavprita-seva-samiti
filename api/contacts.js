// Vercel Serverless Function: Handle Contact Form Submissions
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { firstName, lastName, email, subject, message } = req.body || {};

    if (!firstName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'First name, email, and message are required.'
      });
    }

    // In serverless environment, log received contact submission
    console.log('📬 New Contact Submission:', {
      firstName,
      lastName,
      email,
      subject: subject || 'General Enquiry',
      message,
      receivedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been received successfully.'
    });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error processing contact form.'
    });
  }
}
