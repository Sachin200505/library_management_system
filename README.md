# 📚 LIBSYS — The Ultimate Library Ecosystem
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Backend-Django%20REST-092E20?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**LIBSYS** is a state-of-the-art Library Management System designed for the modern academic environment. It combines a high-performance Django backend with a stunning, immersive React frontend to deliver a seamless experience for Students, Admins, and Owners.

---

## ✨ Immersive Features

### 🎨 Thematic Core
- **20+ Luxury Themes**: From "Timeless Learning" to "Nebula Research," the environment reacts to your focus with dynamic gradients and micro-animations.
- **Glassmorphism UI**: High-end glass-based components for a premium feel.
- **Responsive Mastery**: Precision-crafted layouts for Desktop, Tablet, and Mobile.

### 📊 Tactical Dashboards
- **Interactive Analytics**: Real-time charts (Recharts) tracking books, users, and transactions.
- **Global Audit Logs**: Immutable history of every action taken within the system for complete transparency.
- **Notification Engine**: Integrated alert system keeping all users updated on status shifts.

### 📖 Lifecycle Management
- **Universal Search**: Lightning-fast keyword-based book discovery.
- **Reservation Logic**: Real-time booking and availability tracking.
- **Fine Automation**: Per-day fine calculation engine with integrated payment tracking.
- **Review System**: Collaborative knowledge sharing through student reviews.

---

## 🔐 Role-Based Authority

| Feature | Student | Admin | Owner |
| :--- | :---: | :---: | :---: |
| Browse & Review Books | ✅ | ✅ | ✅ |
| Borrow / Reserve Books | ✅ | ❌ | ❌ |
| Manage Inventory | ❌ | ✅ | ✅ |
| Approve/Reject Requests | ❌ | ✅ | ✅ |
| View System Analytics | ❌ | ⚠️ (Restricted) | ✅ (Full) |
| Manage Staff/Admins | ❌ | ❌ | ✅ |
| System-Wide Audit Logs | ❌ | ⚠️ (Limited) | ✅ (Global) |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite (for speed)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Styling**: Tailwind CSS (Mobile-first surgical hotfixes applied)
- **API Client**: Axios with interceptors

### Backend
- **Engine**: Django REST Framework (DRF)
- **Database**: PostgreSQL (Supabase) / SQLite
- **Auth**: JWT / Session-based role locking
- **Performance**: WhiteNoise Static Serving

---

## 🚀 Quick Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- npm / yarn

### 2. Backend Installation
```bash
# Clone the repo
cd "Library Management System"

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

### 3. Frontend Installation
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🌍 Deployment
- **Frontend**: Scaled on **Vercel** with full CI/CD.
- **Backend**: Hosted on **Render** (or Dockerized environment).
- **Database**: **Supabase** Managed PostgreSQL.

---

> [!IMPORTANT]
> This system is designed for high-concurrency academic environments. Ensure CORS and CSRF origins are correctly set in the production `.env`.

> [!TIP]
> Use the **Owner** role to access the "System Pulse" dashboard for full-spectrum analytics and audit logs.

---
Created with ❤️ by **Sachin & Team** | 🛡️ *Redefining Scholarship*
