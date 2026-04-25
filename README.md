<<<<<<< HEAD
# Car-Rental-System
Scalable Car Rental platform featuring Google login, KYC verification flow, advanced filters, and booking system. Includes file uploads, responsive UI, and backend-driven architecture using React, PHP, and MySQL.
=======
# CarRental Pro: Enterprise Intelligence Mobility Platform

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![PHP](https://img.shields.io/badge/PHP-8.1+-777BB4.svg)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg)](https://www.mysql.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28.svg)](https://firebase.google.com/)

**CarRental Pro** is a high-performance, full-stack car rental ecosystem designed for high-end agencies and customers. It features a modern React-powered SPA (Single Page Application), integrated Google Authentication, and a zero-trust KYC (Identity Verification) pipeline.

## 🚀 Key Features

- **Intelligence-Driven Discovery**: AI-ready architecture with support for semantic vehicle search.
- **Zero-Trust Identity Pipeline**: Multi-step KYC verification (Manual/Document/Digital Locker simulation).
- **Secure Authentication**: Firebase-backed Google Social Sign-In for friction-less onboarding.
- **Enterprise Fleet Management**: Real-time asset tracking and inventory control for agencies.
- **Responsive Aesthetics**: Premium dark-mode interface built with the "Orbit" design language.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion.
- **Backend**: PHP 8.x (REST API Architecture), JWT for session security.
- **Database**: MySQL 8.0 with optimized indexing for high throughput.
- **Auth/Security**: Google Firebase SDK, Aadhaar Masquerading (Privacy Logic).

## 📂 Project Structure

```text
├── backend/
│   ├── api/          # RESTful API endpoints (PHP)
│   ├── config/       # Database & Environment configurations
│   └── uploads/      # KYC Document storage (excluded from Git)
├── frontend/
│   ├── src/          # React components and state management
│   └── public/       # Static assets and branding
└── database.sql      # Core MySQL schema
```

## ⚙️ Local Setup Instructions

### 1. Database Configuration
1. Import `database.sql` into your MySQL server.
2. Navigate to `backend/config/`.
3. Rename `database.example.php` to `database.php`.
4. Update the `$username` and `$password` with your local credentials.

### 2. Backend Initialization
Ensure you have a local PHP server (XAMPP/WAMP/Built-in) pointed at the `backend/` directory.

### 3. Frontend Initialization
1. Navigate to the `frontend/` directory.
2. Run `npm install` to fetch dependencies.
3. Rename `.env.example` to `.env`.
4. Populate the Firebase keys with your own project credentials from the [Firebase Console](https://console.firebase.google.com/).
5. Run `npm run dev` to launch the development server.

## 🔒 Security Note
- **KYC Simulation**: The DigiLocker/Aadhaar flow in this project is a **functional demo**. It simulates the verification lifecycle for academic and demonstration purposes.
- **Data Privacy**: No real Aadhaar data is stored. The system implements a one-way masking algorithm to protect PII (Personally Identifiable Information).

## 🔗 Repository
[https://github.com/Rohitpvt/Car-Rental-System](https://github.com/Rohitpvt/Car-Rental-System)

---
*Created with passion by Rohit. Prepared for Enterprise Standards.*
>>>>>>> d5beb97 (Initial commit - Car Rental System)
