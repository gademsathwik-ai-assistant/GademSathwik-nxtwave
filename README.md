# 🏫 CampusResolve — College Complaint Management System

> **CampusResolve** is a full-stack, enterprise-grade college complaint and grievance redressal web platform. It replaces manual complaint handling with centralized ticket submission, departmental routing, end-to-end timeline auditability, real-time WebSocket notifications, and automated SLA escalations.

---

## 📑 Table of Contents
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏛️ Architecture & Data Flow](#️-architecture--data-flow)
- [🚀 Quickstart Guide (Run Locally)](#-quickstart-guide-run-locally)
- [👥 Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)
- [📡 REST API Reference](#-rest-api-reference)
- [⚡ Real-Time Socket.IO Events](#-real-time-socketio-events)
- [⏰ Background Escalation Engine](#-background-escalation-engine)
- [🐳 Docker Deployment](#-docker-deployment)
- [📂 Project Directory Structure](#-project-directory-structure)

---

## ✨ Key Features

- **🔐 Robust Role-Based Authentication:**
  - Strict role isolation for `student`, `admin`, and `staff`.
  - Passwords hashed with `bcrypt` (Cost Factor: 12).
  - Short-lived signed JWT session tokens.
- **📝 Student Grievance Filing:**
  - Multi-category support: `IT/Wi-Fi`, `Hostel`, `Infrastructure`, `Academic`, `Mess/Canteen`, `Library`, `Transport`, `Sports`, `Other`.
  - Priority selector (`low`, `medium`, `high`, `urgent`).
  - Campus location tagging (Hostel blocks, room numbers, lecture halls).
  - Drag-and-drop file attachments (Images, PDFs, Documents) with image previews.
  - **🤖 AI Smart Classifier:** Analyzes complaint text to auto-recommend category, priority, and department routing.
- **🔄 Complete Complaint Lifecycle:**
  - `Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`.
  - Interactive visual stepper and state transition rules.
- **📜 Immutable Audit Trail (`ComplaintLogs`):**
  - Full chronological event log recording every state change, department assignment, staff comment, and student review.
- **⚡ Real-Time Notifications (Socket.IO):**
  - Push notifications sent instantly to user-specific and department rooms.
  - Slide-over notification drawer with unread counter.
- **⭐ Student Satisfaction Reviews:**
  - 1-to-5 star rating and comment feedback on resolved tickets.
- **📊 Admin Analytics Command Center:**
  - Executive KPI dashboard: Total complaints, resolution turnaround SLA, student satisfaction index.
  - Interactive status distribution bars, departmental workload, and recent activity streams.
- **⏰ Automated Escalations:**
  - Background scheduler automatically promotes overdue unassigned tickets to **Urgent** priority and alerts administration.
  - In-memory scheduler fallback for local dev when Redis is not present.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (Pages Router), React 18, [Tailwind CSS](https://tailwindcss.com/), [Zustand](https://zustand-demo.pmnd.rs/), [Axios](https://axios-http.com/), [Lucide React](https://lucide.dev/), [Socket.IO Client](https://socket.io/) |
| **Backend** | [Node.js](https://nodejs.org/) (20+), [Express.js](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), [Mongoose](https://mongoosejs.com/) |
| **Database** | **MongoDB** (with automatic in-memory fallback for instant zero-dependency running) |
| **Realtime** | **Socket.IO** (WebSockets) |
| **Background Jobs** | **BullMQ** + **Redis** (with built-in timer scheduler fallback) |
| **File Storage** | Local static disk storage (`/uploads`) + S3 ready |
| **Security** | Helmet, CORS, Express Rate Limit, Express Validator, bcryptjs (Cost 12), JWT |
| **DevOps** | Docker, Docker Compose |

---

## 🏛️ Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│             Next.js Frontend (Client)                  │
│   Tailwind CSS • Zustand • Socket.IO Client • Axios    │
└───────────────▲────────────────────────▲───────────────┘
                │ REST (HTTP/JSON)       │ WebSocket (Events)
┌───────────────▼────────────────────────▼───────────────┐
│            Express + TypeScript Server                 │
│   Auth • RBAC • Multer • Validators • SocketManager    │
└───────┬───────────────────┬────────────────────┬───────┘
        │                   │                    │
┌───────▼────────┐  ┌───────▼────────┐  ┌────────▼───────┐
│ MongoDB /      │  │ BullMQ /       │  │ File Storage   │
│ In-Memory DB   │  │ Fallback Queue │  │ (/uploads)     │
└────────────────┘  └────────────────┘  └────────────────┘
```

---

## 🚀 Quickstart Guide (Run Locally)

### 1. Prerequisites
Ensure you have **Node.js** (v18 or v20+) installed on your machine.

### 2. Clone and Setup Dependencies
You can install dependencies for both `client` and `server` with one command:

```bash
# Install all dependencies
npm run install:all
```

Or install separately:
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Run the Backend API Server
```bash
cd server
npm run dev
```
> **Note on Zero-Config Database:** If you don't have MongoDB running locally, the server will **automatically initialize an in-memory MongoDB instance** and seed realistic test data!

The backend will start at: **`http://localhost:5000`**

### 4. Run the Frontend Client
In a new terminal window:
```bash
cd client
npm run dev
```

Open your browser and visit: **`http://localhost:3000`**

---

## 👥 Pre-Seeded Demo Accounts

The database comes pre-populated with ready-to-test accounts. You can also use the **1-Click Quick Login** buttons on the `/login` page:

| Role | Email | Password | Details / Scope |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campus.edu` | `Student@123` | Aarav Sharma (Hostel B, Room 304) — Can submit complaints, track status & submit feedback |
| **Admin** | `admin@campus.edu` | `Admin@123` | Dean Dr. Sarah Mitchell — Full access to analytics, complaint triage, assignments & escalations |
| **IT Staff** | `staff.it@campus.edu` | `Staff@123` | Alex Rivera (Network Lead) — Manages IT, Wi-Fi & classroom AV tickets |
| **Hostel Staff**| `staff.hostel@campus.edu`| `Staff@123` | Rajesh Kumar (Hostel Warden) — Manages room & hostel facilities |
| **Maintenance**| `staff.maint@campus.edu` | `Staff@123` | Marcus Vance (Chief Engineer) — Handles electrical & plumbing |

---

## 📡 REST API Reference

### 🔐 Authentication & Health
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Heartbeat & uptime check |
| `POST` | `/api/auth/register` | Public | Register new student account |
| `POST` | `/api/auth/login` | Public | Login with email & password, returns JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetch profile of logged-in user |

### 📋 Complaints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/complaints` | Authenticated | List complaints (supports `search`, `category`, `status`, `priority`, `page`, `limit`) |
| `POST` | `/api/complaints` | Authenticated | Submit new complaint (multipart with file upload) |
| `GET` | `/api/complaints/:id` | Authenticated | Fetch complaint details + complete chronological audit logs |
| `POST` | `/api/complaints/:id/assign` | Admin / Staff | Assign complaint to department and/or specific staff member |
| `POST` | `/api/complaints/:id/status` | Admin / Staff | Transition status with progress / resolution notes |
| `POST` | `/api/complaints/:id/comments`| Authenticated | Post message to timeline (supports internal notes for staff) |
| `POST` | `/api/complaints/:id/feedback`| Student | Submit 1–5 star rating and comments upon resolution |
| `DELETE`| `/api/complaints/:id` | Admin Only | Delete complaint & associated audit logs |

### 🏢 Departments & Users
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | Public | List all campus departments with complaint counts |
| `POST` | `/api/departments` | Admin | Create a new department |
| `GET` | `/api/users` | Authenticated | List staff and admin users for assignment |

### 🔔 Notifications & Analytics
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Authenticated | List user notifications with unread count |
| `POST` | `/api/notifications/mark-read` | Authenticated | Mark notifications as read |
| `GET` | `/api/analytics` | Admin / Staff | Executive KPI dashboard, workload stats, SLA times |
| `POST` | `/api/ai/categorize` | Authenticated | AI/NLP categorization & urgency estimation |
| `POST` | `/api/jobs/trigger-escalation`| Admin | Manually trigger overdue complaint escalation scan |

---

## ⚡ Real-Time Socket.IO Events

The Socket.IO server authenticates connections via JWT and routes live events:

- `user:<userId>`: Personal channel for assignment alerts and status updates.
- `role:admin`: Broadcasts when new complaints are created or auto-escalated.
- `complaint:<complaintId>`: Live communication channel for timeline updates and messages.

### Key Events
| Event Name | Direction | Description |
| :--- | :--- | :--- |
| `join_complaint_room` | Client ➔ Server | Join live complaint room |
| `complaint:created` | Server ➔ Client | New complaint alert dispatched to admins |
| `complaint:status_updated` | Server ➔ Client | Real-time status change broadcast |
| `complaint:comment_added` | Server ➔ Client | New message or progress note added |
| `notification:new` | Server ➔ Client | Real-time push notification delivered to user |

---

## ⏰ Background Escalation Engine

CampusResolve includes an automated SLA escalation worker:
1. **Unassigned Escalation:** Any complaint in `Submitted` status that remains unassigned for >48 hours is elevated to **`urgent`** priority, marked as `escalated: true`, and dispatched as a high-priority alert to college administration.
2. **Scheduled Workers:** Uses **BullMQ** with **Redis** when configured, and automatically runs a built-in timer loop fallback for local zero-dependency development.

---

## 🐳 Docker Deployment

To launch the full containerized stack (MongoDB, Redis, Express API, Next.js Web App):

```bash
docker-compose up --build
```

- Web Portal: `http://localhost:3000`
- API Server: `http://localhost:5000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

---

## 📂 Project Directory Structure

```
CampusResolve/
├── client/                     # Next.js Frontend Application
│   ├── src/
│   │   ├── components/         # UI Components, Modals, Timeline, Badges, Layout
│   │   ├── pages/              # Pages Router (/dashboard, /complaints, /admin, etc.)
│   │   ├── services/           # Axios API Client & Socket.IO Client
│   │   ├── store/              # Zustand Stores (authStore, uiStore)
│   │   ├── styles/             # Global CSS & Tailwind Design System
│   │   └── types/              # TypeScript Definitions
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── server/                     # Express.js Backend API
│   ├── src/
│   │   ├── config/             # Environment & Database Connections
│   │   ├── controllers/        # Express Route Controllers
│   │   ├── jobs/               # BullMQ Escalation Workers & Scheduler
│   │   ├── middlewares/        # Auth, RBAC, Multer, ErrorHandler, Validator
│   │   ├── models/             # Mongoose Models (User, Complaint, ComplaintLog, etc.)
│   │   ├── routes/             # REST API Routes
│   │   ├── services/           # Core Business Logic & Notifications
│   │   ├── sockets/            # Socket.IO Connection & Room Management
│   │   ├── utils/              # Seed Script & Logger
│   │   └── server.ts           # Server Bootstrap Entrypoint
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml          # Multi-Container Compose Configuration
├── .env.example                # Environment Variable Template
├── package.json                # Root Workspaces & Scripts
├── spec.md                     # Source Project Specification
└── README.md                   # Complete Documentation
```

---

## 🎓 Summary & Testing Workflow

1. Start server (`cd server && npm run dev`) and client (`cd client && npm run dev`).
2. Navigate to `http://localhost:3000` and sign in using the **1-Click Student** login.
3. Click **Submit Complaint**, select `IT/Wi-Fi`, test the **Classify with AI** helper, attach an image, and submit.
4. Open another window/tab, log in with the **1-Click Admin** login, navigate to `/admin` to inspect real-time KPIs, assign the complaint to a staff member, and progress the status.
5. Notice real-time status updates and notifications arrive on the student screen via WebSockets without page refreshes!
6. Mark the ticket as `Resolved` and submit a 5-star student review.
