# WorkBridge — MERN Job Marketplace

A full-featured, locally deployable job marketplace inspired by Fiverr and Upwork. Built with the MERN stack (MongoDB, Express, React, Node.js), JWT authentication, and role-based access control.

---

## 🏗 Project Structure

```
mern-job-marketplace/
├── server/                     # Node.js + Express backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js  # Full CRUD for systemadmin
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── reviewController.js
│   │   ├── skillController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + role authorize
│   │   └── errorHandler.js     # Global error handler
│   ├── models/
│   │   ├── Application.js
│   │   ├── Job.js
│   │   ├── JobPosterProfile.js
│   │   ├── JobSeekerProfile.js
│   │   ├── Review.js           # Auto-updates avg rating on save/delete
│   │   ├── Skill.js
│   │   └── User.js             # bcrypt hashing via pre-save hook
│   ├── routes/
│   │   ├── admin.js
│   │   ├── applications.js
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── reviews.js
│   │   ├── skills.js
│   │   └── users.js
│   ├── seed/
│   │   └── seed.js             # Sample data (users, jobs, apps, reviews)
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── client/                     # React + Vite frontend
    ├── src/
    │   ├── api/
    │   │   └── axios.js        # Axios instance with JWT interceptor
    │   ├── context/
    │   │   └── AuthContext.jsx # Auth state + login/register/logout
    │   ├── components/
    │   │   └── common/
    │   │       └── Sidebar.jsx # Role-aware navigation sidebar
    │   ├── pages/
    │   │   ├── auth/           # LoginPage, RegisterPage
    │   │   ├── jobposter/      # Dashboard, MyJobs, JobForm, Applicants, Profile
    │   │   ├── jobseeker/      # Dashboard, BrowseJobs, JobDetail, MyApplications, Profile
    │   │   ├── admin/          # Dashboard, Users, Jobs, Applications, Reviews
    │   │   └── LandingPage.jsx
    │   ├── App.jsx             # Router + ProtectedRoute
    │   ├── index.css           # Design system (dark theme, CSS variables)
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🗄 Data Models

| Model              | Key Fields |
|--------------------|-----------|
| `User`             | name, email, password (hashed), role, isBlocked |
| `Skill`            | name (unique, lowercase), category |
| `JobSeekerProfile` | user, bio, headline, skills[], experience[], education[], hourlyRate, availability, averageRating |
| `JobPosterProfile` | user, companyName, industry, companySize, location, averageRating |
| `Job`              | poster, title, description, skills[], type, category, budget{type,min,max}, status |
| `Application`      | job, applicant, coverLetter, proposedRate, status, note — **unique(job+applicant)** |
| `Review`           | reviewer, reviewee, job, rating(1-5), comment — **auto-updates profile ratings** |

---

## 🔌 REST API Reference

### Auth
| Method | Endpoint           | Description |
|--------|--------------------|-------------|
| POST   | /api/auth/register | Register (jobseeker or jobposter) |
| POST   | /api/auth/login    | Login → JWT |
| GET    | /api/auth/me       | Get current user + profile |
| PUT    | /api/auth/password | Change password |

### Jobs
| Method | Endpoint                    | Role       | Description |
|--------|-----------------------------|------------|-------------|
| GET    | /api/jobs                   | Any        | List/search all open jobs |
| GET    | /api/jobs/matched           | jobseeker  | Jobs matching seeker's skills |
| GET    | /api/jobs/my                | jobposter  | Own job listings |
| GET    | /api/jobs/:id               | Any        | Job detail |
| GET    | /api/jobs/:id/applicants    | jobposter  | Applications for a job |
| POST   | /api/jobs                   | jobposter  | Create job |
| PUT    | /api/jobs/:id               | jobposter  | Update own job |
| DELETE | /api/jobs/:id               | jobposter  | Delete own job |

### Applications
| Method | Endpoint                        | Role      |
|--------|---------------------------------|-----------|
| POST   | /api/applications/job/:jobId    | jobseeker |
| GET    | /api/applications/my            | jobseeker |
| PUT    | /api/applications/:id/status    | jobposter |
| DELETE | /api/applications/:id/withdraw  | jobseeker |

### Users / Profiles
| Method | Endpoint                      | Description |
|--------|-------------------------------|-------------|
| GET    | /api/users/jobseeker/:userId  | View seeker profile |
| GET    | /api/users/jobposter/:userId  | View poster profile |
| PUT    | /api/users/jobseeker/profile  | Update seeker profile |
| PUT    | /api/users/jobposter/profile  | Update poster profile |

### Reviews
| Method | Endpoint                    | Description |
|--------|-----------------------------|-------------|
| POST   | /api/reviews                | Create review |
| GET    | /api/reviews/user/:userId   | Get reviews for user |
| DELETE | /api/reviews/:id            | Delete own review (or admin) |

### Admin (systemadmin only)
| Method | Endpoint                          |
|--------|-----------------------------------|
| GET    | /api/admin/stats                  |
| GET/PUT/DELETE | /api/admin/users/:id     |
| PUT    | /api/admin/users/:id/block        |
| PUT    | /api/admin/users/:id/unblock      |
| GET/PUT/DELETE | /api/admin/jobs/:id      |
| GET/DELETE | /api/admin/applications/:id |
| GET/DELETE | /api/admin/reviews/:id      |

---

## ⚡ Local Setup

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`
  - Install: https://www.mongodb.com/try/download/community
  - Start: `mongod` (or `brew services start mongodb-community` on macOS)

---

### Step 1 — Clone / extract the project

```bash
cd mern-job-marketplace
```

---

### Step 2 — Configure environment variables

**Server:**
```bash
cp server/.env.example server/.env
# Edit server/.env if needed (defaults work for local MongoDB)
```

**Client:**
```bash
cp client/.env.example client/.env
# VITE_API_URL defaults to /api which is proxied by Vite to localhost:5000
```

---

### Step 3 — Install dependencies

```bash
# Server
cd server && npm install

# Client (in a new terminal)
cd client && npm install
```

---

### Step 4 — Seed the database

```bash
cd server
npm run seed
```

Output confirms created users, skills, jobs, applications, and reviews.

---

### Step 5 — Run the servers

**Terminal 1 — Backend (port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd client
npm run dev
```

Open: **http://localhost:5173**

---

## 🔑 Demo Credentials

| Role        | Email                     | Password     |
|-------------|---------------------------|--------------|
| Admin       | admin@jobmarket.dev       | Admin@1234   |
| Job Poster  | technova@jobmarket.dev    | Poster@1234  |
| Job Poster  | designhub@jobmarket.dev   | Poster@1234  |
| Job Poster  | datastream@jobmarket.dev  | Poster@1234  |
| Job Seeker  | alice@jobmarket.dev       | Seeker@1234  |
| Job Seeker  | bob@jobmarket.dev         | Seeker@1234  |
| Job Seeker  | clara@jobmarket.dev       | Seeker@1234  |

---

## 🛡 Security Notes

- Passwords are **never stored in plain text** — bcrypt (cost factor 12) via Mongoose pre-save hook
- JWT tokens expire in **7 days** (configurable via `JWT_EXPIRE` in .env)
- Blocked users receive a 403 on every protected request
- Duplicate applications prevented by a **compound unique index** on `(job, applicant)`
- Role-based middleware (`authorize()`) guards every sensitive endpoint
- Admin cannot be blocked or deleted through the UI

---

## 🎨 Features by Role

### Job Seeker
- Register / login / logout
- Edit profile: bio, headline, skills, hourly rate, availability
- Browse all open jobs with search + filters
- View full job detail + company profile
- Apply to jobs with cover letter and proposed rate
- Prevent duplicate applications
- Track application status (pending → reviewing → shortlisted → hired / rejected)
- Withdraw pending applications
- Receive and display reviews + computed star rating

### Job Poster
- Register / login / logout
- Edit company profile
- Create / edit / delete job listings
- Toggle job status (open / closed)
- View all applicants per job
- Update applicant status (reviewing, shortlisted, hired, rejected)
- Receive and display reviews + computed star rating

### System Admin
- View platform-wide stats dashboard
- Search, filter, block/unblock, delete any user
- View, close, delete any job
- View and delete any application
- View and delete any review (auto-recalculates ratings)
