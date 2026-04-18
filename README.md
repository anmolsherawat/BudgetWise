# NovaMint — AI-Powered Finance Platform

> Built with ❤️ by **TEAM07**

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)

## Project Overview

**NovaMint** is a comprehensive, AI-powered personal finance platform designed to help users track daily transactions, build wealth intelligently, and make data-driven financial decisions. The platform combines real-time analytics, AI insights powered by Google Gemini, goal tracking, and financial education into a single premium dashboard.

## Key Features

1. **Dashboard & Analytics**
   - Centralized view of your financial health.
   - Dynamic charts tracking income and expense flow.
   - AI-driven insights generated from real transaction data.

2. **Transaction Ledger**
   - Full history of all financial inputs and outputs.
   - Add, edit, and delete transactions seamlessly.
   - Filter and visualize cash flow over any time period.

3. **Smart Reminders & Alerts**
   - Automated budgeting alerts (nearing limits or deficit warnings).
   - Milestone notifications when saving targets are met.
   - Daily actionable financial nudges.

4. **Goal Tracking**
   - Set specific financial goals with target dates.
   - Monitor monthly saving requirements based on time remaining.

5. **Financial Education & Tools**
   - Built-in learning modules for personal finance.
   - Compound interest, SIP, and EMI calculators.
   - Market trends aggregator with live financial news.

6. **Reporting**
   - Generate professional PDF and CSV reports of transactions and budget status.

## Technology Stack

### Frontend
- React.js + Vite
- Tailwind CSS (Glassmorphism, Indigo/Violet design system)
- Framer Motion (Animations)
- Recharts (Data visualization)
- Google Fonts — Inter + Sora

### Backend
- Node.js & Express.js
- Prisma ORM
- MongoDB (Database)
- JSON Web Tokens (Authentication)
- Google Gemini API (AI Insights Engine)

## Local Installation and Setup

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB instance (Local or Atlas)
- NPM or Yarn

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd finance-tracker-main
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The client runs at `http://localhost:3000`.

## License

© 2025 NovaMint — TEAM07. All rights reserved.
