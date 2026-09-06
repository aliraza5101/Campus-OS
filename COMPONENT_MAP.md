# Campus OS — Frontend Component Hierarchy & Module Map

This document outlines the component architecture, modular hierarchy, and state responsibilities across the **Campus OS** platform.

---

## 1. Directory Structure

```
src/
├── types/
│   ├── index.ts                     # Core student, profile, roadmap, and notification interfaces
│   └── admin.ts                     # Institutional admin, analytics, reports, and audit interfaces
│
├── services/
│   └── api.ts                       # Strongly-typed Axios/Fetch API client for all backend endpoints
│
├── utils/
│   ├── profileCompletion.ts         # 5-point dynamic profile completion algorithm
│   ├── readinessEngine.ts           # Career readiness index calculation and breakdown
│   ├── aiMentorEngine.ts            # Client-side AI prompt generation and persona formatting
│   └── exportUtils.ts               # Universal CSV download and institutional PDF print generator
│
├── components/
│   ├── layout/                      # Application shells and navigation
│   │   ├── DashboardLayout.tsx      # Responsive student layout container
│   │   ├── Sidebar.tsx              # Student left navigation sidebar with route triggers
│   │   └── Header.tsx               # Student top header with search, notifications, and profile
│   │
│   ├── auth/                        # Authentication and onboarding
│   │   ├── AuthOnboardingView.tsx   # Comprehensive multi-step onboarding wizard
│   │   └── GoogleAccountChooserModal.tsx # Simulated Google OAuth account selection
│   │
│   ├── dashboard/                   # Student dashboard modular cards
│   │   ├── StudentProfileCard.tsx   # Student identity, academic standing, and bio
│   │   ├── CampusOSProfileCard.tsx  # Quick overview card for passport summary
│   │   ├── CareerReadinessCard.tsx  # Career readiness score gauge and progress breakdown
│   │   ├── CareerDirectionCard.tsx  # Target career goal, track badge, and update modal trigger
│   │   ├── AcademicProgressCard.tsx # CGPA, completed credits, and semester milestone tracker
│   │   ├── SemesterJourneyCard.tsx  # Interactive visual timeline of completed & current semesters
│   │   ├── SkillGrowthCard.tsx      # Historical 4-month skill growth bar visualizer
│   │   ├── SkillsProgressCard.tsx   # Categorized skills breakdown with proficiency bars
│   │   ├── ProjectsCard.tsx         # Verified projects list with GitHub links and status pills
│   │   ├── ExperienceCard.tsx       # Work and internship history with add experience modal trigger
│   │   ├── TopOpportunitiesCard.tsx # Featured campus opportunities & direct application links
│   │   ├── NextStepsCard.tsx        # High-priority upcoming milestones and action items
│   │   ├── AchievementsCard.tsx     # Unlocked badges, awards, and credentials
│   │   ├── RecentActivityCard.tsx   # Live stream of student platform interactions
│   │   ├── QuickActionsCard.tsx     # Quick shortcuts (Add Project, Add Skill, Export PDF)
│   │   └── AIMentorCard.tsx         # Interactive dashboard widget for Campus GPT
│   │
│   ├── views/                       # Full-page student subviews
│   │   ├── AIMentorChatView.tsx     # Fullscreen AI mentor conversation view with SSE streaming
│   │   ├── AcademicProgressView.tsx # In-depth degree progress, transcript analysis, and GPA planner
│   │   ├── RoadmapView.tsx          # Dynamic semester-aware focus pillars and career roadmap
│   │   ├── OpportunitiesView.tsx    # Comprehensive directory of campus internships, hackathons, jobs
│   │   ├── VerifiedProjectsView.tsx # Showcase of student portfolio projects and source code repositories
│   │   ├── SkillsPortfolioView.tsx  # Detailed skills inventory with verification metrics
│   │   ├── ExperienceRolesView.tsx  # Full work and internship career timeline
│   │   ├── JourneySubviews.tsx      # Tabbed container orchestrating student deep-dive views
│   │   └── SettingsView.tsx         # User preferences, security credentials, and profile settings
│   │
│   ├── modals/                      # Interactive user dialogue modals
│   │   ├── AddProjectModal.tsx      # Form modal to add and verify a new portfolio project
│   │   ├── AddExperienceModal.tsx   # Form modal to log an internship or employment experience
│   │   ├── UpdateSkillsModal.tsx    # Modal to add technical proficiencies and set skill levels
│   │   ├── UpdateCareerGoalModal.tsx# Modal to adjust career goal and target industry track
│   │   ├── AddRoadmapTaskModal.tsx  # Modal to create custom milestones and learning tasks
│   │   ├── FocusPillarModal.tsx     # Detailed inspection modal for specific focus pillars
│   │   ├── ActionDetailModal.tsx    # Actionable modal with guidance for next steps
│   │   ├── NotificationsFlyout.tsx  # Header notification dropdown with mark-as-read
│   │   └── SettingsModal.tsx        # Quick settings dialog
│   │
│   ├── common/                      # Reusable UI primitives
│   │   ├── Button.tsx               # Standard design-system button component
│   │   ├── Badge.tsx                # Status pills and categorical indicators
│   │   ├── Card.tsx                 # Standard rounded container with borders and shadow
│   │   └── CampusOSLogo.tsx         # Official SVG branded vector logo
│   │
│   └── admin/                       # Institutional Administration Portal
│       ├── layout/
│       │   ├── AdminLayout.tsx      # Admin dashboard shell with navigation container
│       │   ├── AdminHeader.tsx      # Admin top navigation with search, broadcast alerts, and profile
│       │   └── AdminSidebar.tsx     # Administrative navigation sidebar
│       ├── views/
│       │   ├── AdminDashboardView.tsx          # Executive institutional statistics and KPIs
│       │   ├── AdminStudentsView.tsx           # Student directory with search, filter, and at-risk flags
│       │   ├── AdminStudentDetailModal.tsx     # 360-degree student dossier and AI diagnostic runner
│       │   ├── AdminPlatformAnalyticsView.tsx  # Institution-wide data charts and metrics
│       │   ├── AdminAcademicView.tsx           # Degree progression and GPA distribution analysis
│       │   ├── AdminCareerView.tsx             # Career readiness trends and target roles
│       │   ├── AdminSkillsView.tsx             # Institutional skill distribution and gaps
│       │   ├── AdminProjectsView.tsx           # Overview of student project submissions
│       │   ├── AdminExperienceView.tsx         # Internship and employment placement tracking
│       │   ├── AdminRoadmapsView.tsx           # Institutional curriculum alignment tracking
│       │   ├── AdminOpportunitiesView.tsx      # Job/internship postings and publisher
│       │   ├── AdminApplicationsView.tsx       # Student opportunity application reviewer
│       │   ├── AdminAnnouncementsView.tsx      # Campus notice broadcast manager
│       │   ├── AdminNotificationsView.tsx      # System notification dispatcher
│       │   ├── AdminActivityLogsView.tsx       # Security audit log and activity stream
│       │   ├── AdminReportsView.tsx            # Institutional reporting and data exports
│       │   ├── AdminIntegrationsView.tsx       # External LMS and API integrations
│       │   ├── AdminUsersView.tsx              # Institutional user and staff access control
│       │   ├── AdminSettingsView.tsx           # Global university configuration and policies
│       │   └── AdminProfileView.tsx            # Staff administrator account settings
│       ├── modals/
│       │   ├── AdminNewOpportunityModal.tsx    # Modal to draft and publish a new opportunity
│       │   ├── AdminNewAnnouncementModal.tsx   # Modal to broadcast a campus announcement
│       │   ├── AdminHelpModal.tsx              # Administrative documentation and help
│       │   └── AdminNotificationsFlyout.tsx    # Administrator notifications panel
│       └── profile/
│           └── AdminProfileModal.tsx           # Admin credentials and staff profile editor
│
├── pages/
│   └── Dashboard.tsx                # Main student dashboard assembling all widgets
├── App.tsx                          # Root application component with state, routing & auth guards
├── index.css                        # Global Tailwind CSS directives and custom styling
└── main.tsx                         # React 19 application entry point
```

---

## 2. Component Responsibility Matrix

| Component | Layer | Primary Responsibility | Key Props / Dependencies |
|---|---|---|---|
| `App.tsx` | Root | Authentication routing, role resolution, global modal states | JWT token, auth state |
| `DashboardPage` | Student Page | Assembles widgets for overview mode | `user`, `skills`, `projects`, `experiences` |
| `JourneySubviews` | Student Subview | Switches between Academic, Roadmap, Opportunities, and AI Mentor | `activeTab`, `studentData` |
| `AIMentorChatView` | Student Subview | Real-time SSE streaming dialogue with Campus GPT | `user`, `studentContext`, `sessionId` |
| `RoadmapView` | Student Subview | Focus pillars visualization and task milestone updates | `pillars`, `tasks`, `careerGoal` |
| `AdminDashboardView` | Admin Subview | High-level institutional KPIs and at-risk student monitoring | `stats`, `analytics` |
| `AdminStudentsView` | Admin Subview | Search, filter, and inspect enrolled university students | `students`, `onSelectStudent` |
| `AdminStudentDetailModal` | Admin Modal | Deep dossier on a student with instant AI diagnostic assessment | `studentId`, `isOpen`, `onClose` |
| `AdminOpportunitiesView` | Admin Subview | Create, publish, and review campus opportunities | `opportunities`, `onOpenModal` |
| `AdminReportsView` | Admin Subview | Generate, download, and print institutional PDF & CSV reports | `reportData`, `exportUtils` |
