// Vercel Serverless Function: Handle Donation Submissions & Order Creation
export default async function handler(req, res) {
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
    const { name, email, amount, cause, phone } = req.body || {};

    console.log('❤️ Donation recorded on Vercel:', {
      name,
      email,
      amount,
      cause,
      phone,
      date: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Donation recorded successfully! Thank you for your support.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error processing donation.' });
  }
}
