# Tapza Care — Premium Healthcare Platform

Deployment link- https://tapzacare23.netlify.app

**Tapza Care** is a comprehensive, production-grade healthcare platform featuring:
- 🛵 **30-Minute Medicine Express Delivery** (Swiggy / Instamart style ordering)
- 🔐 **Role-Isolated Portals** for Admin, Pharmacist, Doctor, and Patients
- 💊 **Database-Synced Medicine Inventory CRUD**
- 📅 **Doctor Appointment Scheduling with Conflict Prevention (`409 Conflict`)**
- 🔔 **Real-Time Medicine Reminders & Dose Logging**
- 🎨 **Dynamic Home Screen Layout Engine & Festival Theme Switching**

---

## 🔑 System Access & Credentials Directory

> [!NOTE]
> All seed accounts are pre-configured in the database for instant testing across all roles. The default password for all demo accounts is **`password123`** (or the role-specific fallbacks listed below).

### 🛡️ Administrative & Clinical Portals
Credentials

Admin
Username- admin@tapzacare.com
Password- admin123

Patient
Username- virinchigourishetty23@gmail.com
Password- Virinchi

Doctor
Username- srinivas@tapzacare.com
Password- srinivas

Pharmacist
Username- pharma@tapzacare.com
Password- password123

Lab Assistant
Username- lab@tapzacare.com
Password- password123

## 🌟 Key System Modules & Features

### 1. 🛵 Swiggy / Instamart-Style Express Medicine Delivery
- **Patient Storefront (`/pharmacy`)**: Search medicines, filter by health category/Rx requirements, live floating cart, address selector, payment options (**Cash on Delivery, UPI, Credit/Debit Card, Pay Later**), and prescription file attachment.
- **30-Minute Live Delivery Tracker**: Real-time status stepper (`Placed 🛒` ➔ `Processing 💊` ➔ `Out for Delivery 🛵` ➔ `Delivered ✅`).
- **Pharmacist Operations (`/pharmacist`)**: Live order dispatch queue with 1-click status updates and prescription validation.

### 2. 💊 Medicine Inventory CRUD (Turso DB Synced)
- Full CRUD operations available in **Pharmacist Portal** and **Admin Portal**:
  - **Create**: Add new medicines (Name, Brand, Category, Pack size, Selling Price, MRP, Rx requirement, Image URL, Description).
  - **Read**: Live search & category filters.
  - **Update**: Edit medicine details, price, and toggle stock (`In Stock ✓` / `Out of Stock ✕`).
  - **Delete**: Remove items from database catalog.

### 3. 🔐 Strict Role-Isolated Portal Navigation
- Header navigation automatically restricts portal buttons to matching logged-in user roles:
  - Admin sees **Admin Portal** only.
  - Doctor sees **Doctor Portal** only.
  - Pharmacist sees **Pharmacist Portal** only.
  - Patients access patient care tools (`Pharmacy 🛵`, `Prescriptions`, `Reminders`, `Bookings`).

### 4. 📅 Appointment Booking with Database Conflict Prevention
- Slot conflict detection prevents overlapping appointments for the same doctor, date, and time slot (`409 Conflict`).
- Automatic notification generation upon appointment confirmation.

### 5. 🔔 Real-Time Dose Reminders
- Schedule-based dose tracking (Morning, Afternoon, Night timing).
- Visual modal alerts when dose times trigger.

---

## 🛠️ Technology Stack

- **Web App**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router DOM.
- **Mobile App**: React Native, Expo, TypeScript, React Navigation.
- **Backend REST API**: Node.js, Express, TypeScript, Zod validation, JWT authentication, bcrypt password hashing.
- **Database**: Turso (powered by libSQL) with fallback to local SQLite (`tapza_local.db`).

---

## 🚀 Getting Started

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/tapza-care.git
cd tapza-care

# Install root & workspace dependencies
npm install
npm --prefix apps/api install
npm --prefix apps/web install
```

### 2. Environment Setup (`.env`)
Create a `.env` file in the root directory:
```ini
TURSO_DATABASE_URL=libsql://tpza-virinchi23-tech.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token_here
PORT=5000
JWT_SECRET=tapza_care_jwt_secret_key_2026_prod_grade
APP_ENV=development
```

### 3. Database Migration & Seeding
```bash
npm run migrate
npm run seed
```

### 4. Running Development Servers & Mobile App
```bash
# Start Node.js API (Port 5000)
npm run dev:api

# Start Web Application (Port 3000)
npm run dev:web

# Start Mobile App (Expo)
npm run dev:mobile
```

### 📱 5. Generating Mobile Android APK
To generate a standalone Android `.apk` package for mobile phones:

1. **Using EAS Cloud Build (Direct APK Download)**:
```bash
# Run from root directory
npm run build:apk

# Or from apps/mobile directory
cd apps/mobile
npx eas-cli build --platform android --profile preview
```

2. **Mobile Web PWA Bundle**:
```bash
cd apps/mobile
npx expo export -p web
```

---

## 📁 Repository Structure

```text
tapza-care/
├── apps/
│   ├── api/             # Express + TypeScript REST API
│   │   └── src/
│   │       ├── database/ # DB connection & seed scripts
│   │       ├── middleware/ # Auth & role authorization
│   │       └── routes/   # Auth, Doctors, Bookings, Pharmacy, Admin
│   ├── web/             # React + Vite Web App & Portals
│   │   └── src/
│   │       ├── components/ # Header, Footer, Modals, Reminder Notifier
│   │       └── pages/      # Pharmacy, Pharmacist, Admin, Doctor, Bookings
│   └── mobile/          # React Native Patient Expo App
├── .gitignore           # Git ignore configuration
├── .env.example         # Environment template
└── README.md            # System documentation & credentials
```
