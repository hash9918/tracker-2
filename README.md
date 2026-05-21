# ⚡ StudyTracker - Visual Tasks & Consistency Tracker

StudyTracker is a modern, responsive **MERN (MongoDB, Express, React, Node.js)** web application designed to help students and developers plan their weekly schedules, track daily task completion, and visually monitor long-term consistency via a GitHub-style contribution heatmap. Built with a sleek dark-mode glassmorphism interface, it features a live-sync system between templated schedules and daily day logs, daily streaks, automated category-wise task management, and robust JWT authentication.

---

## 🚀 Live Demo & Deployment

🔗 **Live Link:** [ https://tracker-2-beta.vercel.app/ ]()
🔗 **Server Link:** [ https://tracker-2-3wsf.onrender.com ] 



---

## ✨ Features

- 📅 **Interactive Daily Dashboard:**
  - View today's schedule synced automatically from your weekly template.
  - Interactive checkboxes to mark tasks as completed in real time.
  - Live local clock for accurate focus timing.
  - Interactive **Daily Streak Counter** to motivate daily study habits.
  
- 🛠️ **Weekly Schedule Template Builder:**
  - Plan your recurring weekly tasks and schedule slots dynamically.
  - Choose between customized task durations and categorizations.
  - Automatic template syncing that updates existing active daily schedules.

- 📊 **GitHub-style Contribution Heatmap:**
  - Beautiful visual consistency grid powered by `react-calendar-heatmap`.
  - Detailed analytics panel displaying:
    - Total completed tasks.
    - Historical active days.
    - Streak milestones.

- 🔒 **Secure Auth & Session Management:**
  - JSON Web Token (JWT) session persistence.
  - Secure passwords hashed with `bcryptjs`.
  - Upgraded signup form featuring strict password match verification.

- 🎨 **Premium Modern Design System:**
  - Stunning Tailwind CSS layout styled with deep space colors (`bg-[#0a0c10]`).
  - High-fidelity visual components, responsive hamburger menu, and modern CSS micro-animations.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 (Vite-powered for rapid hot module replacement)
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **Icons:** Lucide React
- **Analytics Visualization:** React Calendar Heatmap
- **Routing:** React Router DOM (v6)

### Backend
- **Runtime Environment:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Security:** JWT (JSON Web Tokens), Bcrypt.js
- **Cross-Origin Requests:** CORS

---

## 📁 Repository Structure

```text
test-tracker/
├── backend/
│   ├── config/            # Database connection configuration
│   ├── middleware/        # JWT Authentication middleware
│   ├── models/            # Mongoose schemas (User, DayLog, ScheduleTemplate)
│   ├── routes/            # Express routes (auth, daylog, heatmap, template)
│   ├── server.js          # Backend entry point
│   ├── package.json       # Backend dependencies & scripts
│   └── .gitignore
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable UI elements (Navbar, ProtectedRoute)
│   │   ├── context/       # React Context (AuthContext for user sessions)
│   │   ├── pages/         # Page components (Dashboard, HeatmapView, Login, Register, ScheduleBuilder)
│   │   ├── App.jsx        # Route handling & primary wrapper
│   │   ├── index.css      # Core design system stylesheet & Tailwind configurations
│   │   └── main.jsx       # Client entry point
│   ├── tailwind.config.js # Tailwind CSS customization
│   ├── vite.config.js     # Vite dev server configuration
│   ├── package.json       # Frontend dependencies & scripts
│   └── .gitignore
└── README.md              # Project documentation
```

---

## ⚙️ Installation & Setup

Follow these steps to run **StudyTracker** locally:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed (v16.x or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster or a running local MongoDB instance

### 2. Clone the Repository
```bash
git clone https://github.com/hash9918/tracker-2.git
cd test-tracker
```

### 3. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend` directory and provide the required environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend server in development mode:
   ```bash
   npm run dev
   ```
   *The backend server will run on `http://localhost:5000`.*

### 4. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file or verify that your API calls point correctly to `http://localhost:5000`. By default, API calls are configured to communicate with the local server port.
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend application will boot up on `http://localhost:5173`.*

---

## 🔌 API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate a user and return a JWT token.
- `GET /api/auth/user` - Retrieve details of the currently authenticated user (*requires auth header*).

### 📋 Schedule Templates (`/api/template`)
- `GET /api/template` - Get the current user's weekly template schedule (*requires auth header*).
- `POST /api/template` - Create or update weekly recurring schedule blocks (*requires auth header*).

### 📅 Daily Logs (`/api/daylog`)
- `GET /api/daylog/today` - Fetch today's schedule and task status list (*requires auth header*).
- `POST /api/daylog/today` - Auto-initialize or force-sync the daily snapshot using the weekly template (*requires auth header*).
- `PATCH /api/daylog/:dayLogId/task/:taskId` - Toggle a specific task block's completion status (*requires auth header*).

### 📊 Heatmap & Analytics (`/api/heatmap`)
- `GET /api/heatmap/data` - Retrieve activity tracking dates and counts for calendar heatmap visualization (*requires auth header*).
- `GET /api/heatmap/stats` - Fetch overall consistency statistics including total tasks completed, active streaks, and active day counts (*requires auth header*).

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
