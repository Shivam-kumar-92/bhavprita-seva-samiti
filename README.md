# 🌿 Bhavprita Seva Samiti — NGO Website

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)

> **Bhavprita Seva Samiti** — Empowering rural & tribal communities through environmental protection, adult education, women empowerment, and student motivation since **2019**.

---

## 📁 Project Structure

```
Bhavprita-Seva-Samiti-NGO/
│
├── frontend/                  # Static Website (HTML + CSS + JS)
│   ├── index.html             # Main website — all pages in one file
│   └── assets/
│       └── images/            # All website images
│
├── backend/                   # Node.js + Express REST API
│   ├── server.js              # Main entry point
│   ├── package.json
│   ├── .env.example           # Environment variable template
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── Contact.js         # Contact form schema
│   │   └── Donation.js        # Donation record schema
│   ├── routes/
│   │   ├── contacts.js        # Contact form API
│   │   └── donations.js       # Donation API (Razorpay)
│   ├── middleware/
│   │   └── auth.js            # Admin auth middleware
│   └── utils/
│       ├── mailer.js          # Email notifications (Nodemailer)
│       └── fallbackStorage.js # Local JSON storage fallback
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## ✨ Features

- 🏠 **Full One-Page Website** — Hero, About, Programs, Gallery, Team, Contact
- 💳 **Razorpay Payment Integration** — Online donations
- 📧 **Email Notifications** — Auto-emails on contact/donation via Nodemailer
- 🛡️ **Admin Dashboard** — View contacts & donations with password auth
- 📦 **MongoDB Storage** — With local JSON fallback (offline mode)
- 📱 **Fully Responsive** — Mobile-first design
- ⚡ **Smooth Animations** — Scroll reveal, particle effects, glassmorphism

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://mongodb.com/) (local or Atlas cloud)
- A [Razorpay](https://razorpay.com/) account (for donations)

---

### 1️⃣ Frontend (Static Site)

Just open `frontend/index.html` in any browser — **no build step needed**.

For local development with live reload:
```bash
# Using VS Code Live Server extension, OR
npx serve frontend
```

To deploy on **GitHub Pages**:
1. Push the repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `frontend/` folder on `main` branch
4. Your site will be live at `https://<username>.github.io/<repo>/`

---

### 2️⃣ Backend (API Server)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file and fill in your values
copy .env.example .env

# Start development server
npm run dev

# OR start production server
npm start
```

The server runs at: **http://localhost:5000**

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your values:

| Variable        | Description                              | Example                          |
|----------------|------------------------------------------|----------------------------------|
| `PORT`          | Server port                              | `5000`                           |
| `MONGO_URI`     | MongoDB connection string                | `mongodb://localhost:27017/bhavprita` |
| `ADMIN_PASSWORD`| Password for admin dashboard             | `your_secure_password`           |
| `SMTP_HOST`     | Email SMTP host                          | `smtp.gmail.com`                 |
| `SMTP_PORT`     | SMTP port                                | `587`                            |
| `SMTP_USER`     | SMTP username / email                    | `your@gmail.com`                 |
| `SMTP_PASS`     | SMTP password / app password             | `your_app_password`              |
| `NOTIFY_EMAIL`  | Email to receive notifications           | `info@bhavpritasevasamiti.org`   |

> ⚠️ **Never commit `.env` to GitHub!** It is listed in `.gitignore`.

---

## 🌐 Deployment

### Frontend → GitHub Pages (Free)
See instructions in [Getting Started → Frontend](#1️⃣-frontend-static-site).

### Backend → Render / Railway (Free Tier)
1. Push repo to GitHub
2. Connect on [render.com](https://render.com) or [railway.app](https://railway.app)
3. Set `Root Directory` to `backend`
4. Set `Start Command` to `node server.js`
5. Add environment variables in the dashboard

### Database → MongoDB Atlas (Free Tier)
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Get your connection string and set it as `MONGO_URI`

---

## 📜 API Endpoints

| Method | Endpoint                | Description                    |
|--------|------------------------|--------------------------------|
| `POST` | `/api/contacts`         | Submit contact form            |
| `GET`  | `/api/contacts`         | Get all contacts (admin auth)  |
| `POST` | `/api/donations/order`  | Create Razorpay order          |
| `POST` | `/api/donations/verify` | Verify & save donation         |
| `GET`  | `/api/donations`        | Get all donations (admin auth) |

---

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 📬 Contact

**Bhavprita Seva Samiti**
- 📍 Jharkhand, India
- 📧 info@bhavpritasevasamiti.org

---

<div align="center">
  Made with ❤️ for the communities of Jharkhand
</div>
