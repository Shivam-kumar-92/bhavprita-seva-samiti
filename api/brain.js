// Vercel Serverless Function: AI Seva Assistant & Intelligence Engine
// Powered by Google Gemini 1.5/2.0 API with fallback to built-in NGO knowledge base

const NGO_KNOWLEDGE = {
  name: "Bhavprita Seva Samiti",
  founded: "2019",
  location: "Jharkhand, India",
  phone: "+91 9113351257",
  email: "info@bhavpritasevasamiti.org",
  registration: "Reg No. 2019/BSS (Recognized under 80G & 12A of Income Tax Act)",
  pillars: [
    "🌱 Environmental Protection: Extensive tree plantation drives & community green spaces across Jharkhand.",
    "📚 Adult Education & Literacy: Empowering village elders & adults with foundational reading, writing, and arithmetic skills.",
    "🏆 Student Motivation & Matric Topper Awards: Mentoring youth and honoring top academic achievers in rural schools.",
    "💜 Tribal & Rural Women Empowerment: Vocational skill workshops, handicraft training, and Self-Help Group (SHG) micro-finance support."
  ],
  taxBenefits: "All individual and corporate donations are eligible for 50% tax deduction under Section 80G of the Income Tax Act.",
  howToHelp: "You can donate online via UPI/Razorpay, register as a volunteer, supply educational/plantation materials, or collaborate on CSR initiatives."
};

export default async function handler(req, res) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { question } = req.body || {};

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question prompt is required.' });
    }

    const cleanQuery = question.trim().toLowerCase();

    // Check if Gemini API Key is configured in environment
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const systemPrompt = `You are the official AI Seva Assistant for "Bhavprita Seva Samiti", a grassroots social welfare NGO based in Jharkhand, India (Serving since 2019).
Focus Areas: Environmental protection & tree plantation, Adult literacy, Student motivation & Matric awards, and Tribal women empowerment.
Contact: +91 9113351257, info@bhavpritasevasamiti.org.
Donations are eligible for 80G tax deductions.
Respond warmly, politely, and informatively. Keep responses concise (2 to 4 sentences).`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: question }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answer) {
            return res.status(200).json({ success: true, answer: answer.trim() });
          }
        }
      } catch (apiErr) {
        console.warn('Gemini API call failed, falling back to local intelligence:', apiErr);
      }
    }

    // Built-in Intelligent Brain & Knowledge Retrieval
    let answer = "";
    if (cleanQuery.includes('tax') || cleanQuery.includes('80g') || cleanQuery.includes('12a') || cleanQuery.includes('deduct')) {
      answer = `Yes! All donations to ${NGO_KNOWLEDGE.name} are eligible for 50% tax exemption under Section 80G of the Income Tax Act. You will receive an official tax-deductible receipt for your contribution.`;
    } else if (cleanQuery.includes('donate') || cleanQuery.includes('pay') || cleanQuery.includes('money') || cleanQuery.includes('upi')) {
      answer = `You can donate securely using Razorpay (supporting UPI, Google Pay, PhonePe, Cards, and NetBanking) right from the "Get Involved" section on this page, or scan the official UPI QR code. Every rupee goes directly to our grassroots programs in Jharkhand.`;
    } else if (cleanQuery.includes('volunteer') || cleanQuery.includes('join') || cleanQuery.includes('help')) {
      answer = `We warmly welcome volunteers! You can join our network of over 200+ volunteers for tree plantation drives, teaching adult literacy classes, or mentoring students. Fill out the Contact form below or call us at ${NGO_KNOWLEDGE.phone}.`;
    } else if (cleanQuery.includes('women') || cleanQuery.includes('shg') || cleanQuery.includes('female')) {
      answer = `Our Tribal & Rural Women Empowerment program provides vocational skills training (tailoring, handicrafts) and aids Self-Help Groups (SHGs) with financial literacy to foster true economic independence in rural Jharkhand.`;
    } else if (cleanQuery.includes('contact') || cleanQuery.includes('phone') || cleanQuery.includes('email') || cleanQuery.includes('address')) {
      answer = `You can reach Bhavprita Seva Samiti at ${NGO_KNOWLEDGE.phone} or email us at ${NGO_KNOWLEDGE.email}. Our team is active Monday through Saturday from 9:00 AM to 6:00 PM IST.`;
    } else if (cleanQuery.includes('who are you') || cleanQuery.includes('about') || cleanQuery.includes('what is') || cleanQuery.includes('mission')) {
      answer = `Bhavprita Seva Samiti is a registered non-profit organization established in 2019, dedicated to uplifting rural and tribal communities in Jharkhand through environmental conservation, adult literacy, women empowerment, and youth education.`;
    } else {
      answer = `Hello! I am the AI Seva Assistant for ${NGO_KNOWLEDGE.name}. We work tirelessly across Jharkhand on environmental conservation, adult education, women empowerment, and student motivation. How can I guide you with donations, volunteering, or program details today?`;
    }

    return res.status(200).json({ success: true, answer });

  } catch (err) {
    console.error('Brain AI error:', err);
    return res.status(500).json({ success: false, message: 'AI Assistant temporary processing error.' });
  }
}
