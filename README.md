<div align="center">

# 🦷 Dentify

### Dental Clinic Management System

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

A full-stack dental clinic management platform built as a graduation project. Dentify connects patients, dentists, clinic administrators, secretaries, and radiology centers on a unified system accessible through a **web dashboard** and a **cross-platform mobile app**.

</div>

---

## 📋 Table of Contents

- [✨ Overview](#-overview)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [👥 Features by Role](#-features-by-role)
- [🏗️ Architecture](#️-architecture)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Mobile Setup](#mobile-setup)

---

## ✨ Overview

Dentify streamlines dental clinic operations through:

- 🎯 **Role-based dashboards** for Admins, Clinics, Dentists, Secretaries, Patients, and Radiology Centers
- 🤖 **AI-powered chatbot** (Google Gemini 2.5 Flash) with RAG for appointment booking and dental FAQs
- 🔔 **Real-time push notifications** via Firebase Cloud Messaging
- 🔐 **Two-factor authentication** (TOTP) with QR code setup
- 🩻 **DICOM/radiology file management** with base64 storage
- 🦷 **Interactive tooth chart** and treatment tracking
- 💳 **Payment management** with cash/card support and discount tracking
- 🗺️ **Map-based clinic and dentist discovery** (Leaflet)

---

## 🛠️ Tech Stack

### 🟢 Backend

| Layer         | Technology                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Runtime       | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) Express 5                     |
| ORM           | ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white) Prisma 6                         |
| Database      | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) via Supabase         |
| Auth          | ![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) + bcrypt + Speakeasy (TOTP 2FA) |
| AI Chatbot    | ![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=flat-square&logo=google&logoColor=white) + RAG                  |
| Notifications | ![Firebase](https://img.shields.io/badge/Firebase_FCM-FFCA28?style=flat-square&logo=firebase&logoColor=black) Admin SDK              |
| File Storage  | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) Storage / Base64           |
| Email         | ![Nodemailer](https://img.shields.io/badge/Nodemailer-22B573?style=flat-square&logo=nodemailer&logoColor=white)                      |
| Testing       | ![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white) + Supertest                            |

### 🔵 Frontend (Web)

| Layer         | Technology                                                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) + ![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white) |
| Styling       | ![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)                                                                                   |
| Routing       | ![React Router](https://img.shields.io/badge/React_Router_7-CA4245?style=flat-square&logo=react-router&logoColor=white)                                                                               |
| Charts        | ![Chart.js](https://img.shields.io/badge/Chart.js_4-FF6384?style=flat-square&logo=chart.js&logoColor=white)                                                                                           |
| Maps          | ![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat-square&logo=leaflet&logoColor=white) + React-Leaflet                                                                                |
| Animations    | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)                                                                                     |
| Notifications | ![Firebase](https://img.shields.io/badge/Firebase_SDK-FFCA28?style=flat-square&logo=firebase&logoColor=black)                                                                                         |

### 📱 Mobile

| Layer         | Technology                                                                                                                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | ![React Native](https://img.shields.io/badge/React_Native_0.81-61DAFB?style=flat-square&logo=react&logoColor=black) + ![Expo](https://img.shields.io/badge/Expo_54-000020?style=flat-square&logo=expo&logoColor=white) |
| Navigation    | Expo Router 6 + React Navigation                                                                                                                                                                                       |
| Styling       | ![NativeWind](https://img.shields.io/badge/NativeWind-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white) (Tailwind for RN)                                                                                    |
| Maps          | React Native Maps                                                                                                                                                                                                      |
| Notifications | ![Firebase](https://img.shields.io/badge/Firebase_SDK-FFCA28?style=flat-square&logo=firebase&logoColor=black)                                                                                                          |

---

## 📁 Project Structure

```
🗂️ Dentify/
├── 🟢 backend/                  # Express API server
│   ├── controllers/             # Route handler logic
│   ├── routes/                  # Express route definitions
│   ├── services/                # Business logic (auth, chatbot, email, notifications, appointments)
│   ├── middleware/              # Auth + file upload middleware
│   ├── helpers/                 # Hashing, validation, response helpers
│   ├── factories/               # CRUD factory + generic route handlers
│   ├── utils/                   # Query helpers, response transformers
│   ├── config/                  # Firebase admin, database config
│   └── prisma/                  # Prisma schema + migrations
│
├── 🔵 frontend/                 # React web dashboard
│   └── src/
│       ├── pages/               # Auth pages + per-role dashboards
│       ├── components/          # Shared UI + feature components
│       ├── contexts/            # Theme, Notification, Chat contexts
│       ├── hooks/               # Custom React hooks
│       ├── services/            # API client + chatbot service
│       └── utils/               # Auth, date, validation, search helpers
│
├── 📱 mobile/                   # Expo React Native app
│   └── app/
│       ├── (auth)/              # Login, signup, forgot/reset password
│       └── dashboard/           # Per-role mobile screens
│
├── ⚙️ config/
│   └── firebase/                # Firestore rules, indexes, realtime DB rules
│
└── 📄 docs/                     # Project report and presentation (PDF)
```

---

## 👥 Features by Role

<details>
<summary>🔴 <strong>Admin</strong></summary>

- 📊 System-wide analytics and overview
- 👤 Manage all users: clinics, dentists, patients, secretaries, radiology centers, admins
- ✅ Activate / deactivate accounts

</details>

<details>
<summary>🟠 <strong>Clinic</strong></summary>

- 🏥 Clinic profile with working hours, available treatments, coordinates, and website
- 👨‍⚕️ Manage dentists and secretaries
- 📅 View appointments, patients, treatments, and payments
- 📈 Clinic-level analytics and expense tracking
- 📦 Inventory management

</details>

<details>
<summary>🟡 <strong>Dentist</strong></summary>

- 🗓️ Personal schedule and working-hours configuration
- 📅 Appointment management (confirm, complete, cancel)
- 🦷 Patient treatment plans with per-tooth status tracking (interactive tooth chart)
- 💊 Prescription creation and management
- 🩻 Radiology request submission to radiology centers
- 💰 Payment recording and session cost entry
- 📊 Analytics and reports

</details>

<details>
<summary>🟢 <strong>Secretary</strong></summary>

- 📅 View and manage dentist schedules
- 💳 Record and manage payments
- 🩺 Treatment overview for the clinic

</details>

<details>
<summary>🔵 <strong>Patient</strong></summary>

- 🗺️ Search and discover clinics and dentists by city/name/specialization (map + list)
- 📅 Book, view, and manage appointments
- 📋 View treatment history and per-tooth records
- 💊 Download prescriptions
- 🩻 View X-ray and radiology results
- 💳 Payment history

</details>

<details>
<summary>🟣 <strong>Radiology Center</strong></summary>

- 📥 Receive and manage radiology requests from dentists
- 📤 Upload report files (base64 images or PDFs)
- 📊 Analytics overview

</details>

<details>
<summary>🤖 <strong>AI Chatbot</strong> (All Roles)</summary>

- ✨ Powered by **Google Gemini 2.5 Flash**
- 🧠 Context-aware responses using RAG (Retrieval-Augmented Generation)
- 📅 Appointment booking assistance via natural language
- 🦷 Dental FAQ and post-care advice
- 💬 Maintains per-user conversation history

</details>

---

## 🏗️ Architecture

```
🖥️  Client (React Web / 📱 React Native Mobile)
              │
              │  HTTPS / REST
              ▼
🟢  Express API Server  ──►  🐘 PostgreSQL (Prisma ORM)
              │
              ├──►  🔥 Firebase Admin SDK  ──►  Firestore (notifications, real-time)
              │                              └►  FCM (push notifications)
              │
              ├──►  🤖 Google Gemini AI (chatbot + RAG)
              │
              ├──►  🗄️  Supabase Storage (file uploads)
              │
              └──►  📧 Nodemailer (password reset emails)
```

**🔐 Authentication flow:**

1. User logs in → receives **JWT access token** + refresh token
2. JWT is verified on each protected request via `authenticate` middleware
3. Optional **TOTP 2FA** using Speakeasy — QR code generated on setup, verified on login

**🔔 Notification flow:**

- Events (appointments, payments, radiology results) trigger `notificationService`
- Notifications are written to **Firestore** and delivered via **FCM** to the user's device

---

## 🚀 Getting Started

### Prerequisites

| Requirement                                                                                                     | Version                 |
| --------------------------------------------------------------------------------------------------------------- | ----------------------- |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)          | ≥ 18                    |
| ![npm](https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm&logoColor=white)                      | ≥ 9                     |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) | any (or Supabase)       |
| ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)       | Firestore + FCM enabled |
| ![Gemini](https://img.shields.io/badge/Gemini_API_Key-8E75B2?style=flat-square&logo=google&logoColor=white)     | Free tier available     |
| ![Expo](https://img.shields.io/badge/Expo_CLI-000020?style=flat-square&logo=expo&logoColor=white)               | For mobile only         |

---

### 🟢 Backend Setup

```bash
cd backend
npm install
```

Run database migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

> The API will be available at `http://localhost:<PORT>`

---

### 🔵 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> The web dashboard will be available at `http://localhost:5173` by default.

---

### 📱 Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

> Scan the QR code with **Expo Go** (Android/iOS) or press `a` / `i` to open an emulator.
