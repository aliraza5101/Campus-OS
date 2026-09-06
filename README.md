# Campus OS — Institutional Student Operating System & Career Readiness Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js & Express](https://img.shields.io/badge/Backend-Node.js%20%26%20Express-339933?logo=node.js&logoColor=white)](https://expressjs.com/)
[![PostgreSQL & Supabase](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Supabase-336791?logo=postgresql&logoColor=white)](https://supabase.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![AI Providers](https://img.shields.io/badge/AI%20Engine-Groq%20%7C%20Grok%20%7C%20Gemini-FF6F00?logo=openai&logoColor=white)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Campus OS** is a comprehensive, AI-powered institutional Student Operating System designed for higher education institutions. It bridges the gap between academic enrollment and industry readiness by providing students with a unified academic passport, intelligent career roadmaps, real-time portfolio tracking, and an AI mentor ("Campus GPT"), while empowering university administrators with institutional analytics, diagnostic tools, and student tracking.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
  - [Student Operating System (Student Portal)](#1-student-operating-system-student-portal)
  - [AI Mentorship Engine ("Campus GPT")](#2-ai-mentorship-engine-campus-gpt)
  - [Institutional Administration Portal](#3-institutional-administration-portal)
- [Tech Stack](#-tech-stack)
- [Database Schema & Models](#-database-schema--models)
- [Project Directory Structure](#-project-directory-structure)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Database Migration](#database-migration)
  - [Running the Development Server](#running-the-development-server)
  - [Production Build](#production-build)
- [Testing & Verification](#-testing--verification)
- [Security & Authentication](#-security--authentication)
- [Contributing](#-contributing)
- [License](#-license)

---

## 💡 Overview

University students often struggle to answer four foundational questions:
1. *Where am I right now in my degree?*
2. *What have I actually achieved and verified?*
3. *What crucial skills or projects am I missing for industry placement?*
4. *What concrete steps should I take next?*

**Campus OS** answers these questions systematically. By combining live academic records (GPA, semester progressions, credit hours) with real-time portfolio metrics (skills, GitHub-verified projects, certifications, internships), Campus OS calculates an **Algorithmic Career Readiness Score** and produces personalized, semester-aware **Focus Pillars** and milestones.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Frontend ["Client Layer (React 19 + TypeScript + TailwindCSS v4)"]
        UI_Student[Student Dashboard & Journey Views]
        UI_AI[Campus GPT AI Mentor Chat & SSE Stream]
        UI_Admin[Institutional Admin Management Portal]
        UI_Auth[Multi-Step Auth & Onboarding Flow]
    end

    subgraph Server ["Backend Layer (Express + TypeScript on Node.js)"]
        SVR_Router[Modular Express Router]
        MW_Auth[JWT & RBAC Middleware]
        ENG_Pillars[Semester-Aware Focus Pillars Engine]
        ENG_Readiness[Career Readiness & Diagnostic Engine]
        ENG_AI[Multi-Provider AI Orchestrator]
    end

    subgraph AI_Providers ["AI Mentor Core (Streaming & Fallbacks)"]
        AI_Groq[Groq LPU Engine: Qwen 3.8 / Compound / GPT-OSS]
        AI_Grok[xAI Grok: grok-2-latest / grok-beta]
        AI_Gemini[Google Gemini 3.7 / 2.4 Flash with Thinking Mode]
    end

    subgraph Database ["Persistence Layer (PostgreSQL / Supabase)"]
        DB_Users[(Users & Auth)]
        DB_Profiles[(Student & Admin Profiles)]
        DB_Portfolio[(Skills, Projects, Experiences, Certs)]
        DB_Academics[(Semester Details & Standing)]
        DB_Opp[(Opportunities & Applications)]
        DB_Chat[(Chat Sessions & Messages)]
        DB_Logs[(Audit Trail & System Logs)]
    end

    UI_Student -->|REST / JWT| SVR_Router
    UI_AI -->|SSE Stream / JSON| SVR_Router
    UI_Admin -->|REST / Admin Token| SVR_Router
    UI_Auth -->|Credentials / OAuth| SVR_Router

    SVR_Router --> MW_Auth
    MW_Auth --> ENG_Pillars
    MW_Auth --> ENG_Readiness
    MW_Auth --> ENG_AI

    ENG_AI --> AI_Groq
    ENG_AI --> AI_Grok
    ENG_AI --> AI_Gemini

    ENG_Pillars --> Database
    ENG_Readiness --> Database
    SVR_Router --> Database
```

---

## ✨ Key Features

### 1. Student Operating System (Student Portal)
- **Academic Passport**: Real-time snapshot of CGPA, completed credits vs total degree requirements, semester timeline, and institutional academic standing.
- **Dynamic Profile Completion**: Interactive 5-point checklist tracking profile photos, academic history, verified skills, portfolio projects, and work experience.
- **Career Readiness Index**: Algorithmic scoring (0–100%) computed dynamically from verified projects, core technical proficiencies, work experiences, certifications, and academic performance.
- **Semester-Aware Focus Pillars**: Intelligent stage breakdown tailored to degree and target track (AI/ML, Full Stack, Cloud/DevOps, Cyber Security, Data Science):
  - *Stage 1 (Semesters 1–2)*: Freshman Foundations & Core Tooling
  - *Stage 2 (Semesters 3–4)*: Sophomore Core Systems & Algorithmic Design
  - *Stage 3 (Semesters 5–6)*: Junior Track Specialization & Internship Prep
  - *Stage 4 (Semesters 7–8)*: Senior Capstone / Final Year Project & Industry Placement
- **Skills Portfolio & Verification**: Categorized breakdown (Frontend, Backend, AI/ML, Cloud, Core) with self-assessed and institutionally verified badges.
- **Verified Projects Showcase**: Rich cards displaying live demo URLs, GitHub repository links, tech stack badges, and completion progress bars.
- **Opportunities Board**: Direct application hub for campus recruitments, internships, hackathons, competitions, and research grants.
- **Universal Exporting**: Built-in export tools supporting UTF-8 CSV exports and formatted, print-ready institutional PDF transcripts.

### 2. AI Mentorship Engine ("Campus GPT")
- **Live Student Context Awareness**: Injects real-time student database context (name, GPA, current semester, career goal, verified skills, and project history) into LLM system instructions.
- **Multi-Provider Fallback Cascade**:
  1. **Primary**: Groq LPU Engine (`qwen/qwen3.8-27b`, `groq/compound`, `openai/gpt-oss-120b`) for ultra-low latency inference.
  2. **Secondary**: xAI Grok (`grok-2-latest`, `grok-beta`) for complex reasoning.
  3. **Tertiary**: Google Gemini (`gemini-3.7-flash`, `@google/genai`) with optional Thinking Mode.
  4. **Quaternary**: Resilient local deterministic fallback ensuring 100% uptime.
- **Persistent Chat History**: Stores sessions and messages directly in PostgreSQL (`chat_sessions` and `chat_messages` tables).
- **Server-Sent Events (SSE)**: Real-time token streaming with instant user-experience feedback.

### 3. Institutional Administration Portal
- **Executive Institutional Dashboard**: High-level platform statistics (Total Enrolled Students, Active Rates, Average CGPA, Average Career Readiness Index, At-Risk Student counts).
- **Student Management Directory**: Search, filter by status (`Active`, `Needs Attention`, `At Risk`), and sort students across departments and semesters.
- **Deep Student Inspection Modal**: 360-degree view of any student, including academic history, skills, projects, recent activities, and an **instant AI diagnostic generator**.
- **Opportunity & Application Tracking**: Create, publish, schedule, and review applications for institutional and partner-company opportunities.
- **Campus Announcements Broadcaster**: Publish announcements segmented by target audience, priority (`Normal`, `High`, `Urgent`), and category.
- **System Audit Logs & Security**: Immutable activity log recording actor, IP address, target entity, timestamp, and status.
- **Campus Settings & Configuration**: Manage academic years, term configurations, GPA at-risk alert thresholds, self-registration toggles, and maintenance mode.

---

## 💻 Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) | Modern concurrent React architecture with hooks |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) | End-to-end type safety across client and server |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) | High-performance atomic CSS engine |
| **Iconography** | [Lucide React](https://lucide.dev/) | Consistent, clean modern iconography |
| **Animations** | [Motion](https://motion.dev/) | Fluid layout transitions and modal micro-interactions |
| **Markdown Rendering** | [React Markdown](https://github.com/remarkjs/react-markdown) | Formatted rendering for AI responses and announcements |
| **Backend Runtime** | [Node.js](https://nodejs.org/) & [Express 4](https://expressjs.com/) | Scalable HTTP server with modular routers |
| **Database** | [PostgreSQL](https://www.postgresql.org/) / [Supabase](https://supabase.com/) | Relational database with pooled connections (`pg`) |
| **Authentication** | [JWT](https://jwt.io/) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Stateless JSON Web Tokens with salted password hashing |
| **AI Orchestration** | `@google/genai`, `groq-sdk`, `openai` | Multi-LLM inference engine supporting Gemini, Groq, and xAI |
| **Dev Tooling** | [Vite 6](https://vitejs.dev/) & [TSX](https://github.com/privatenumber/tsx) | Instant HMR development and zero-bundle TypeScript execution |

---

## 🗄️ Database Schema & Models

The PostgreSQL schema is structured across relational entities with foreign keys, cascading deletes, and optimized indexes:

```
├── users                       # Base authentication (id, email, password_hash, role, last_active_at)
├── student_profiles            # Academic passport (degree, semester, university, career_goal, gpa, standing)
├── admin_profiles              # Institutional administrative staff (role, department, staff_id, clearance)
├── skills                      # Technical & soft skills (name, level, percentage, category, verified)
├── projects                    # Student portfolio projects (title, category, status, tech_stack, github_url)
├── experiences                 # Internships & roles (title, company, employment_type, period, location)
├── certifications              # Industry credentials (title, organization, date, credential_id)
├── semester_details            # Semester-by-semester GPA and course history
├── roadmap_tasks               # Personalized AI and manual roadmap action items
├── skill_growth_history        # Historical monthly skill point trajectory
├── achievements                # Unlocked badges and institutional recognitions
├── student_activities          # Student audit log of completed actions
├── opportunities               # Published internships, competitions, and scholarships
├── applications                # Student submissions for opportunities
├── announcements               # Campus-wide notifications and notices
├── chat_sessions               # AI Mentor chat threads
├── chat_messages               # Message history with user/assistant roles
├── notifications               # Targeted user notifications
├── activity_logs               # Administrative platform audit log
└── admin_settings              # Institution-wide configuration parameters
```

---

## 📂 Project Directory Structure

```
Campus OS/
├── .env.example                # Sample environment configuration template
├── package.json                # Project dependencies and operational scripts
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite frontend configuration
├── server.ts                   # Express server entry point, AI streaming, and Vite integration
│
├── server/                     # Backend Source Code
│   ├── db/
│   │   ├── pg.ts               # PostgreSQL connection pool configuration
│   │   └── supabase.ts         # Supabase client initialization
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication and RBAC middleware
│   ├── migrations/
│   │   ├── 001_initial_schema.sql         # Core schema definition
│   │   ├── 002_seed_data.sql              # Initial demo data & accounts
│   │   └── 003_production_extensions.sql  # Milestones, growth & activity tables
│   ├── routes/
│   │   ├── admin.ts            # Admin dashboard, students, diagnostics, analytics
│   │   ├── ai.ts               # AI onboarding and special diagnostic routes
│   │   ├── announcements.ts    # Announcements CRUD and broadcast routes
│   │   ├── auth.ts             # Registration, login, Google OAuth, password changes
│   │   ├── notifications.ts    # User notifications & broadcast triggers
│   │   ├── opportunities.ts    # Opportunity postings & student applications
│   │   ├── reports.ts          # Institutional report generations & exports
│   │   ├── student.ts          # Student profile, skills, projects, roadmap & focus pillars
│   │   └── upload.ts           # Avatar and media upload handlers
│   ├── services/
│   │   ├── adminDiagnosticEngine.ts # Automated AI diagnostic assessment for students
│   │   ├── focusPillarsEngine.ts    # Semester-aware multi-track focus engine
│   │   └── recommendationEngine.ts  # Next-action recommendation generator
│   └── utils/
│       ├── formatters.ts       # Database-to-client DTO mappers
│       ├── notify.ts           # Notification helper
│       └── readinessCalculator.ts # Backend readiness calculation sync
│
├── src/                        # Frontend Source Code
│   ├── components/
│   │   ├── admin/              # Institutional Admin Portal views and modals
│   │   │   ├── layout/         # AdminLayout, AdminHeader, AdminSidebar
│   │   │   ├── modals/         # NewOpportunity, NewAnnouncement, AdminHelp modals
│   │   │   ├── profile/        # Admin profile editor
│   │   │   └── views/          # 15+ Admin subviews (Dashboard, Students, Analytics, etc.)
│   │   ├── auth/               # Multi-step onboarding and Google account chooser
│   │   ├── common/             # Button, Badge, Card, Logo reusable primitives
│   │   ├── dashboard/          # Student dashboard widgets (Profile, Readiness, Pillars, etc.)
│   │   ├── layout/             # Student DashboardLayout, Sidebar, Header
│   │   ├── modals/             # Experience, Project, Skill, Roadmap modals
│   │   └── views/              # Main student views (Academic, Opportunities, Roadmap, AI Mentor)
│   ├── pages/
│   │   └── Dashboard.tsx       # Student dashboard view orchestrator
│   ├── services/
│   │   └── api.ts              # Strongly-typed client HTTP API layer
│   ├── types/
│   │   ├── index.ts            # Student and shared TypeScript interfaces
│   │   └── admin.ts            # Admin, Analytics, and Reporting interfaces
│   ├── utils/
│   │   ├── aiMentorEngine.ts   # Client-side AI prompt structures
│   │   ├── exportUtils.ts      # CSV and print-ready PDF generator
│   │   ├── profileCompletion.ts# Dynamic completion checklist logic
│   │   └── readinessEngine.ts  # Client-side readiness score breakdown
│   ├── App.tsx                 # Root application router & global state
│   ├── index.css               # Design system tokens and Tailwind styles
│   └── main.tsx                # React DOM mount point
│
└── scripts/                    # Automation & Verification Suite
    ├── migrate.ts              # Migration runner for PostgreSQL / Supabase
    ├── seed_admin_accounts.ts  # Seeds default administrative credentials
    ├── verify_e2e.ts           # Comprehensive runtime end-to-end verification
    ├── verify_focus_pillars.ts # Focus pillars engine validation
    └── test_admin_portal_e2e.ts# End-to-end verification of Admin portal APIs
```

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new student account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/auth/google` | Public | Authenticate via Google OAuth / simulator |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `POST` | `/api/auth/change-password` | Authenticated | Update user account password |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate current user session |

### Student Services (`/api/student`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/student/profile` | Student | Full profile with skills, projects, certs, and history |
| `POST` | `/api/student/onboarding` | Student | Complete multi-step onboarding wizard |
| `GET` | `/api/student/skills` | Student | Get all technical and soft skills |
| `POST` | `/api/student/skills` | Student | Add or update student skills |
| `GET` | `/api/student/projects` | Student | Get verified and in-progress projects |
| `POST` | `/api/student/projects` | Student | Create or update a portfolio project |
| `GET` | `/api/student/experiences` | Student | Get work and internship experiences |
| `POST` | `/api/student/experiences` | Student | Log new professional experience |
| `GET` | `/api/student/roadmap/focus-pillars` | Student | Fetch semester-aware focus pillars |
| `POST` | `/api/student/roadmap/focus-pillars/regenerate` | Student | Recompute AI focus pillars based on progress |
| `GET` | `/api/student/roadmap` | Student | Get active roadmap action items |
| `POST` | `/api/student/roadmap` | Student | Add a custom roadmap task |

### AI Mentor (`/api/chat` & `/api/mentor-chat`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/chat/stream` | Authenticated | Real-time SSE streaming mentor response |
| `POST` | `/api/chat` | Authenticated | Standard JSON mentor response |
| `GET` | `/api/chat/sessions` | Authenticated | List persistent conversation sessions |
| `POST` | `/api/chat/sessions` | Authenticated | Create a new conversation thread |
| `DELETE` | `/api/chat/sessions/:id` | Authenticated | Remove a conversation session |

### Opportunities & Applications (`/api/opportunities`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/opportunities` | Public / Auth | List published opportunities |
| `POST` | `/api/opportunities` | Admin | Post a new internship/scholarship/competition |
| `POST` | `/api/opportunities/:id/apply` | Student | Apply for a specific opportunity |
| `GET` | `/api/opportunities/admin/applications` | Admin | Review student applications |

### Institutional Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | Fetch institutional top-level KPIs |
| `GET` | `/api/admin/students` | Admin | Filter and list all registered students |
| `GET` | `/api/admin/students/:id` | Admin | Full 360-degree student dossier |
| `POST` | `/api/admin/students/:id/ai-diagnostic` | Admin | Run LLM diagnostic on student risk factors |
| `GET` | `/api/admin/analytics` | Admin | Academic, skills, projects, and career analytics |
| `GET` | `/api/admin/activity-logs` | Admin | Immutable platform audit trail |
| `GET` | `/api/admin/settings` | Admin | Institutional settings and policy thresholds |
| `PUT` | `/api/admin/settings` | Admin | Update institution-wide configurations |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.x or later recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- A PostgreSQL database instance (local PostgreSQL or hosted on [Supabase](https://supabase.com/))

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/aliraza5101/Campus-OS-.git
   cd Campus-OS-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Populate `.env` with your credentials:
   ```env
   PORT=3000
   APP_URL="http://localhost:3000"
   NODE_ENV="development"

   # JWT Secret Key
   JWT_SECRET="generate_a_secure_random_key_for_jwt"

   # PostgreSQL / Supabase Connection
   DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres"
   SUPABASE_URL="https://[YOUR_PROJECT_REF].supabase.co"
   SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

   # AI Provider API Keys (at least one key enables AI features)
   GROQ_API_KEY="gsk_..."
   GEMINI_API_KEY="AIza..."
   GROK_API_KEY="xai-..."
   ```

### Database Migration

Run the automated migration runner to apply the SQL schemas and seed data:
```bash
npm run db:migrate
```

*(Optional)* Seed default administrative accounts:
```bash
npx tsx scripts/seed_admin_accounts.ts
```

### Running the Development Server

Start the integrated full-stack development environment (Node.js API + Vite HMR frontend):
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### Production Build

1. Compile the frontend and bundle the server:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

---

## 🧪 Testing & Verification

Campus OS comes equipped with a comprehensive automated runtime verification suite:

- **End-to-End Verification**: Validates registration, authentication, database persistence, readiness calculation, and student operations.
  ```bash
  npx tsx scripts/verify_e2e.ts
  ```
- **Admin Portal Verification**: Tests institutional statistics, student detail views, activity logs, and settings.
  ```bash
  npx tsx scripts/test_admin_portal_e2e.ts
  ```
- **Focus Pillars Engine Verification**: Validates semester staging, track key detection, and milestone recommendation generation.
  ```bash
  npx tsx scripts/verify_focus_pillars.ts
  ```
- **Type Checking**:
  ```bash
  npm run lint
  ```

---

## 🔒 Security & Authentication

- **Password Security**: All user passwords are encrypted using `bcryptjs` with auto-generated salts before database storage.
- **Stateless Tokens**: JWTs contain user IDs and roles, verified on every protected API call.
- **Role-Based Access Control (RBAC)**: Distinct permissions enforced via `requireAuth` and `requireRole('admin')` middleware.
- **SQL Injection Prevention**: All database interactions use parameterized PostgreSQL queries (`$1, $2, ...`).
- **Input Sanitation & Boundaries**: File upload limits and structured JSON payloads prevent resource exhaustion.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Engineered with precision for modern university students and educational institutions.</sub>
</div>
