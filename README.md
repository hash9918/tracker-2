# ⚡ StudyTracker - Visual Tasks & Consistency Tracker

StudyTracker is a modern, responsive **MERN (MongoDB, Express, React, Node.js)** web application designed to help students and developers plan their weekly schedules, track daily task completion, archive future goals with time-to-completion metrics, and visually monitor long-term consistency via a GitHub-style contribution heatmap. Built with a sleek dark-mode glassmorphism interface, it features a live-sync system between templated schedules and daily day logs, daily streaks, automated category-wise task management, Future Vault goal tracking, and robust JWT authentication.

---

## 🚀 Live Demo & Deployment

🔗 **Live Link:** [https://tracker-2-beta.vercel.app](https://tracker-2-beta.vercel.app)  

---

## ✨ Features

- 📅 **Interactive Daily Dashboard:**
  - View today's schedule synced automatically from your weekly template.
  - Interactive checkboxes to mark tasks as completed in real time.
  - Daily check-in system with mood selection, productivity score ratings, and reflection notes.
  - Interactive **Daily Streak Counter** and live focus clocks to motivate consistent study habits.

- 🔮 **Future Vault (Backlog & Long-Term Goals):**
  - **Full Task Visibility:** Break big aspirations into structured checklists and subtasks without truncation or clipping.
  - **Expandable & Scrollable Views:** Smooth scrollbars and expandable note toggles so all tasks remain completely visible regardless of count.
  - **Interactive Subtask Checklists:** Real-time completion checkboxes with dynamic progress bars (`3/5 tasks done • 60%`).
  - **Quick Inline Task Adding:** Instantly append tasks directly onto any vault card.
  - **Done / Completion Marking:** Quick-toggle vault completion status with custom `Done` badges and celebrating visual cues.
  - **Time-to-Completion Tracking:** Automatically tracks the exact duration taken from vault creation (`createdAt`) to completion (`completedAt`) (e.g., `⚡ Completed in 2 days 4 hours`).
  - **Status Filter Tabs:** Filter vaults effortlessly across **All**, **Active**, and **Completed** with live count badges.

- 🛠️ **Weekly Schedule Template Builder:**
  - Plan recurring weekly tasks and schedule slots dynamically.
  - Choose between customized task durations, colors, and categorizations.
  - Automatic template syncing that updates existing active daily schedules.

- 📊 **GitHub-style Contribution Heatmap & Analytics:**
  - Visual consistency grid powered by `react-calendar-heatmap`.
  - Detailed analytics panel displaying total completed tasks, historical active days, and streak milestones.

- 🔁 **History Replay & Weekly Review:**
  - Review historical logs, past day performances, and reflection notes across previous weeks.

- 🔒 **Secure Auth & Session Management:**
  - JSON Web Token (JWT) session persistence.
  - Secure passwords hashed with `bcryptjs`.
  - Sign up with strict password match verification.

- 🎨 **Premium Modern Design System & Theme Engine:**
  - Full toggle support between deep space dark mode (`bg-[#0a0c10]`) and clean light mode (`bg-slate-50`).
  - Styled with Tailwind CSS, sleek glassmorphism, responsive components, and micro-animations.
  - Remembers theme preferences via local storage.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 (Vite-powered for lightning-fast development)
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **Icons:** Lucide React
- **Analytics Visualization:** React Calendar Heatmap
- **Routing:** React Router DOM (v6)
- **HTTP Client:** Axios

### Backend
- **Runtime Environment:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Security:** JWT (JSON Web Tokens), Bcrypt.js
- **Cross-Origin Requests:** CORS

---

## 📁 Repository Structure

```text
tasksTracker/
├── backend/
│   ├── config/            # Database connection configuration (db.js)
│   ├── middleware/        # JWT Authentication middleware (auth.js)
│   ├── models/            # Mongoose schemas (User, DayLog, ScheduleTemplate, BacklogItem)
│   ├── routes/            # Express routes (auth, backlog, daylog, heatmap, template)
│   ├── server.js          # Backend entry point
│   ├── package.json       # Backend dependencies & scripts
│   └── .gitignore
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable UI elements (Navbar, ProtectedRoute)
│   │   ├── context/       # React Context (AuthContext for user sessions & API client)
│   │   ├── pages/         # Page components
│   │   │   ├── Backlog.jsx        # Future Vault page (Goals, Subtasks & Time Tracking)
│   │   │   ├── Dashboard.jsx      # Daily Dashboard & Check-ins
│   │   │   ├── HeatmapView.jsx    # Contribution Heatmap & Stats
│   │   │   ├── HistoryReplay.jsx  # Past Activity Replay
│   │   │   ├── Login.jsx          # Login Page
│   │   │   ├── Register.jsx       # Registration Page
│   │   │   ├── ScheduleBuilder.jsx# Weekly Template Builder
│   │   │   └── WeeklyReview.jsx   # Weekly Reflections & Review
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
cd tracker-2
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
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend application will boot up on `http://localhost:5173`.*

---

## 🔌 API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate a user and return a JWT token.
- `GET /api/auth/user` - Retrieve details of the currently authenticated user (*requires auth*).

### 🔮 Future Vault (`/api/backlog`)
- `GET /api/backlog` - Fetch all vault items for the authenticated user (*requires auth*).
- `POST /api/backlog` - Create a new vault item with optional subtasks checklist (*requires auth*).
- `PUT /api/backlog/:id` - Update vault title, description, color, tasks, or completion status (*requires auth*).
- `PATCH /api/backlog/:id/toggle` - Quick-toggle entire vault completion status and record `completedAt` (*requires auth*).
- `POST /api/backlog/:id/tasks` - Append a new subtask to an existing vault (*requires auth*).
- `PATCH /api/backlog/:id/tasks/:taskIndex/toggle` - Toggle individual subtask completion in a vault (*requires auth*).
- `DELETE /api/backlog/:id` - Remove a vault item (*requires auth*).

### 📋 Schedule Templates (`/api/template`)
- `GET /api/template` - Get current user's weekly template schedule (*requires auth*).
- `POST /api/template` - Create or update weekly recurring schedule blocks (*requires auth*).

### 📅 Daily Logs (`/api/daylog`)
- `GET /api/daylog/:date` - Fetch a specific day's schedule and check-in status (*requires auth*).
- `POST /api/daylog/:date` - Auto-initialize or force-sync the daily snapshot using the weekly template (*requires auth*).
- `PATCH /api/daylog/:date/block/:blockId` - Toggle a specific task block's completion status (*requires auth*).
- `PATCH /api/daylog/:date/review` - Save daily mood, productivity rating, and reflection notes (*requires auth*).

### 📊 Heatmap & Analytics (`/api/heatmap`)
- `GET /api/heatmap` - Retrieve heatmap contribution matrix, streaks, and total completion counts (*requires auth*).

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
