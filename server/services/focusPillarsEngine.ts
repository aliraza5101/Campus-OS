import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

export interface FocusPillar {
  number: string;
  title: string;
  tech: string;
  tag: string;
  icon: string;
  description: string;
  keyCompetencies: string[];
  recommendedProject: {
    title: string;
    description: string;
    techStack: string[];
  };
  suggestedMilestone: {
    title: string;
    category: 'Project' | 'Skill' | 'Career' | 'Academic' | 'Research';
    priority: 'High' | 'Medium' | 'Low';
    estimatedTime: string;
    actionType: string;
  };
}

export interface StudentFocusPillarsContext {
  name: string;
  degree: string;
  semester: number;
  gpa: number;
  careerGoal: string;
  university: string;
  skills: Array<{ name: string; level?: string }>;
  projects: Array<{ title: string; category?: string }>;
  relevantCoursework?: string[];
}

function isValidApiKey(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed.length < 8) return false;
  if (/[^\x21-\x7E]/.test(trimmed)) return false;
  if (trimmed === 'MY_GEMINI_API_KEY' || trimmed.startsWith('your-') || trimmed.includes('••••')) {
    return false;
  }
  return true;
}

export function detectTrackKey(goal: string, degree: string): 'ai' | 'fullstack' | 'cloud' | 'cybersecurity' | 'data' | 'general' {
  const combined = `${goal} ${degree}`.toLowerCase();
  if (combined.includes('ai') || combined.includes('machine learning') || combined.includes('deep learning') || combined.includes('vision') || combined.includes('nlp')) {
    return 'ai';
  }
  if (combined.includes('cloud') || combined.includes('devops') || combined.includes('infrastructure') || combined.includes('sre')) {
    return 'cloud';
  }
  if (combined.includes('cyber') || combined.includes('security') || combined.includes('ethical hack') || combined.includes('info sec')) {
    return 'cybersecurity';
  }
  if (combined.includes('data') || combined.includes('analytics') || combined.includes('bi')) {
    return 'data';
  }
  if (combined.includes('full stack') || combined.includes('web') || combined.includes('frontend') || combined.includes('backend') || combined.includes('software')) {
    return 'fullstack';
  }
  return 'general';
}

export function getSemesterStage(semester: number): 1 | 2 | 3 | 4 {
  const sem = Number(semester) || 1;
  if (sem <= 2) return 1; // Freshman Foundations & Tooling
  if (sem <= 4) return 2; // Sophomore Core Systems & Algorithmic Design
  if (sem <= 6) return 3; // Junior Track Specialization & Internship Preparation
  return 4; // Senior Capstone / FYP & Industry Placement
}

export function getStageLabel(semester: number): string {
  const stage = getSemesterStage(semester);
  switch (stage) {
    case 1:
      return 'Freshman Foundations & Developer Tooling';
    case 2:
      return 'Sophomore Core Systems & Algorithms';
    case 3:
      return 'Junior Specialization & Internship Readiness';
    case 4:
      return 'Senior Capstone FYP & Career Placement';
  }
}

/**
 * Deterministic Curriculum Matrix for all 6 tracks and 4 semester stages
 */
export function getDeterministicSemesterPillars(
  track: 'ai' | 'fullstack' | 'cloud' | 'cybersecurity' | 'data' | 'general',
  semester: number,
  careerGoal: string,
  degree: string
): FocusPillar[] {
  const stage = getSemesterStage(semester);
  const goalLabel = careerGoal || 'Software Engineering';

  // =========================================================================
  // STAGE 1: SEMESTERS 1 & 2 (Freshman Foundations across all tracks)
  // =========================================================================
  if (stage === 1) {
    if (track === 'ai') {
      return [
        {
          number: '01',
          title: 'Programming Foundations & Logic Building',
          tech: 'Python 3 · Algorithmic Thinking · Functions & Recursion',
          tag: 'Foundational Coding',
          icon: 'Code',
          description: `Build rock-solid Python programming fundamentals, clean syntax, structured functions, and memory basics tailored for future ${goalLabel} work.`,
          keyCompetencies: [
            'Python syntax, control flow, functions & scopes',
            'Recursion, string manipulation & algorithmic problem solving',
            'File I/O, error handling & unit testing basics',
            'Clean code conventions & PEP 8 readability standards',
          ],
          recommendedProject: {
            title: 'Algorithmic Problem Solver & CLI Tool Suite',
            description: 'Build a modular CLI toolkit containing math engines, string parsers, and interactive simulations.',
            techStack: ['Python', 'pytest', 'CLI'],
          },
          suggestedMilestone: {
            title: 'Master Python Core Fundamentals & Write 30+ Scripts',
            category: 'Skill',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Skill Milestone',
          },
        },
        {
          number: '02',
          title: 'Linear Algebra & Calculus for AI',
          tech: 'Matrix Math · Vectors · Derivatives · NumPy',
          tag: 'Mathematics for AI',
          icon: 'Binary',
          description: 'Bridge undergraduate mathematics with computational data representations, dot products, matrices, and partial derivatives.',
          keyCompetencies: [
            'Matrix operations, determinants, dot & cross products',
            'Vector spaces, basis, and coordinate transformations',
            'Partial derivatives, gradients & chain rule intuition',
            'Vectorized matrix computations with NumPy arrays',
          ],
          recommendedProject: {
            title: 'Matrix & Linear Algebra Computation Engine',
            description: 'Implement a pure NumPy matrix manipulation and linear transformation visualizer.',
            techStack: ['Python', 'NumPy', 'Matplotlib'],
          },
          suggestedMilestone: {
            title: 'Complete Linear Algebra & Matrix Computing Exercises',
            category: 'Academic',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Skill Milestone',
          },
        },
        {
          number: '03',
          title: 'Developer Tooling & Git Version Control',
          tech: 'Git · GitHub · Linux CLI · VS Code & Environments',
          tag: 'Developer Hygiene',
          icon: 'Terminal',
          description: 'Establish professional engineering habits with Git branches, commit hygiene, virtual environments, and bash scripting.',
          keyCompetencies: [
            'Git branch workflows, rebasing, merge conflicts & PRs',
            'Linux bash command line navigation & file manipulation',
            'Python virtual environments (venv/conda) & pip management',
            'Markdown documentation & structured GitHub READMEs',
          ],
          recommendedProject: {
            title: 'Curated GitHub Developer Profile & Script Vault',
            description: 'Publish your first well-documented GitHub repository with clean commits and automated pre-commit hooks.',
            techStack: ['Git', 'GitHub', 'Bash', 'Markdown'],
          },
          suggestedMilestone: {
            title: 'Publish 3 Verified Repositories to GitHub with Clean Commits',
            category: 'Project',
            priority: 'Medium',
            estimatedTime: '2 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '04',
          title: 'Discrete Structures & Computational Logic',
          tech: 'Propositional Logic · Set Theory · Graph Basics · Proofs',
          tag: 'Academic Foundations',
          icon: 'Users',
          description: 'Strengthen mathematical rigor with discrete structures, propositional logic, and induction to prepare for data structures in Year 2.',
          keyCompetencies: [
            'Boolean logic, truth tables & logical equivalences',
            'Sets, relations, functions & cardinality',
            'Mathematical induction & recurrence relations',
            'Basic graph terminology: vertices, edges, paths & cycles',
          ],
          recommendedProject: {
            title: 'Interactive Boolean Logic Simulator',
            description: 'Build a Python script that evaluates complex propositional logic formulas and generates truth tables.',
            techStack: ['Python', 'Discrete Math'],
          },
          suggestedMilestone: {
            title: 'Score 85%+ in Discrete Math & Computational Logic coursework',
            category: 'Academic',
            priority: 'Medium',
            estimatedTime: '4 weeks',
            actionType: 'Skill Milestone',
          },
        },
      ];
    }

    if (track === 'fullstack') {
      return [
        {
          number: '01',
          title: 'Web Foundations: Semantic HTML & Modern CSS',
          tech: 'HTML5 Semantic · Modern CSS3 · Flexbox & Grid · Responsive',
          tag: 'Web Foundations',
          icon: 'Code',
          description: `Master web layout architecture, responsive viewports, CSS Grid/Flexbox, and accessibility required for ${goalLabel}.`,
          keyCompetencies: [
            'Semantic HTML5 structure & accessibility (a11y) standards',
            'Modern CSS Grid, Flexbox, media queries & fluid layouts',
            'CSS custom properties (variables) & modern styling patterns',
            'Mobile-first responsive design best practices',
          ],
          recommendedProject: {
            title: 'Responsive Developer Portfolio & Landing Page',
            description: 'Build an ultra-responsive, accessible developer showcase site from scratch without heavy UI frameworks.',
            techStack: ['HTML5', 'CSS3', 'JavaScript'],
          },
          suggestedMilestone: {
            title: 'Build and Deploy 100% Mobile-Responsive Web Portfolio',
            category: 'Project',
            priority: 'High',
            estimatedTime: '2 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '02',
          title: 'JavaScript Core & DOM Manipulation',
          tech: 'ES6+ · Event Loop · DOM API · Async/Await & Fetch',
          tag: 'Core Scripting',
          icon: 'Terminal',
          description: 'Deep dive into modern JavaScript fundamentals: closures, promises, event loop mechanics, and dynamic DOM manipulation.',
          keyCompetencies: [
            'ES6+ syntax: destructuring, rest/spread, arrow functions, modules',
            'DOM element selection, event delegation & dynamic mutation',
            'Asynchronous JavaScript: Promises, async/await, Fetch API',
            'Browser DevTools: debugging, network inspections, console profiling',
          ],
          recommendedProject: {
            title: 'Interactive Task & Productivity Dashboard',
            description: 'Construct a stateful dashboard with localStorage persistence, drag-and-drop tasks, and live weather API integration.',
            techStack: ['JavaScript ES6+', 'HTML5', 'CSS3', 'REST API'],
          },
          suggestedMilestone: {
            title: 'Build 3 Interactive JavaScript Web Applications',
            category: 'Project',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '03',
          title: 'Programming Fundamentals & Algorithms in C++/JS',
          tech: 'C++ / JavaScript · Loops · Pointers · Control Logic',
          tag: 'Computer Science Core',
          icon: 'Binary',
          description: 'Establish foundational coding logic, memory awareness, algorithmic loops, and structured design in your core university language.',
          keyCompetencies: [
            'Variable scopes, data types, arrays & memory layout',
            'Control flow, loops, recursion & modular functions',
            'Basic algorithmic problem solving & string manipulation',
            'Clean coding standards and structured modular design',
          ],
          recommendedProject: {
            title: 'Command-Line Banking & Inventory System',
            description: 'Develop a robust CLI accounting and inventory management system with file persistence and error recovery.',
            techStack: ['C++', 'File I/O', 'Data Structures'],
          },
          suggestedMilestone: {
            title: 'Solve 30+ Fundamental Coding Problems on HackerRank / LeetCode',
            category: 'Skill',
            priority: 'Medium',
            estimatedTime: '3 weeks',
            actionType: 'Skill Milestone',
          },
        },
        {
          number: '04',
          title: 'Git Version Control & Open Web Deployment',
          tech: 'Git · GitHub Pages · Netlify · Vercel · CLI',
          tag: 'Developer Tooling',
          icon: 'FolderGit2',
          description: 'Learn industry Git workflows, commit hygiene, remote repositories, and free cloud web deployment platforms.',
          keyCompetencies: [
            'Git init, commit, branching, merging & resolving conflicts',
            'Pushing repositories to GitHub & configuring SSH keys',
            'Deploying static websites live to GitHub Pages / Vercel',
            'Writing comprehensive README.md files with live demo badges',
          ],
          recommendedProject: {
            title: 'Public Open-Source Web Component Library',
            description: 'Publish a clean GitHub repository containing reusable UI components deployed to a live URL.',
            techStack: ['Git', 'GitHub', 'Vercel', 'Markdown'],
          },
          suggestedMilestone: {
            title: 'Publish & Deploy 2 Live Web Projects on Vercel/GitHub Pages',
            category: 'Career',
            priority: 'Medium',
            estimatedTime: '2 weeks',
            actionType: 'Apply Opportunity',
          },
        },
      ];
    }

    // Default Freshman Foundations (Cloud, Cyber, Data, General)
    return [
      {
        number: '01',
        title: 'Core Programming Fundamentals',
        tech: 'Python / C++ · Functions · Memory & Types · Algorithmic Logic',
        tag: 'Foundational Coding',
        icon: 'Code',
        description: `Master core programming syntax, control flow, functions, memory allocation, and algorithmic problem-solving for ${goalLabel}.`,
        keyCompetencies: [
          'Variable types, control structures & structured programming',
          'Modular function decomposition & unit testing basics',
          'Algorithmic problem-solving on arrays and strings',
          'Clean code principles, debugging & error handling',
        ],
        recommendedProject: {
          title: 'Algorithmic Tool Suite & Console Application',
          description: 'Build a modular console tool featuring data parsing, file persistence, and interactive user flows.',
          techStack: ['Python', 'pytest', 'CLI'],
        },
        suggestedMilestone: {
          title: 'Complete 30+ Core Programming Challenges with Unit Tests',
          category: 'Skill',
          priority: 'High',
          estimatedTime: '3 weeks',
          actionType: 'Skill Milestone',
        },
      },
      {
        number: '02',
        title: 'Mathematical Foundations for Computing',
        tech: 'Discrete Mathematics · Linear Algebra · Calculus Basics',
        tag: 'Mathematics Core',
        icon: 'Binary',
        description: 'Establish the rigorous theoretical groundwork in discrete structures, propositional logic, and linear algebra.',
        keyCompetencies: [
          'Propositional & predicate logic, truth tables',
          'Matrix computations, dot products & systems of linear equations',
          'Set theory, functions, relations & proofs by induction',
          'Computational complexity fundamentals (Big-O overview)',
        ],
        recommendedProject: {
          title: 'Mathematical Logic & Matrix Calculator',
          description: 'Develop a computational script that solves matrix equations and evaluates logical expressions.',
          techStack: ['Python', 'NumPy', 'Math'],
        },
        suggestedMilestone: {
          title: 'Achieve Strong Academic Standing in Mathematics Coursework',
          category: 'Academic',
          priority: 'High',
          estimatedTime: '3 weeks',
          actionType: 'Skill Milestone',
        },
      },
      {
        number: '03',
        title: 'Developer Environment & Git Hygiene',
        tech: 'Git · GitHub · Linux Terminal · Bash Scripting',
        tag: 'Developer Tooling',
        icon: 'Terminal',
        description: 'Build muscle memory with command-line environments, Linux file systems, Git branching, and GitHub workflows.',
        keyCompetencies: [
          'Linux CLI navigation, file permissions & piping',
          'Git commit hygiene, branching, merging & pull requests',
          'Configuring professional editor setups and extensions',
          'Automating simple developer tasks with shell scripts',
        ],
        recommendedProject: {
          title: 'Automated Developer Setup & Dotfiles Repository',
          description: 'Configure a personal GitHub dotfiles repository documenting your command-line environment and utility scripts.',
          techStack: ['Bash', 'Git', 'Linux'],
        },
        suggestedMilestone: {
          title: 'Establish Verifiable GitHub Activity with Clean Commits',
          category: 'Project',
          priority: 'Medium',
          estimatedTime: '2 weeks',
          actionType: 'Build Project',
        },
      },
      {
        number: '04',
        title: 'Academic Excellence & Professional Habits',
        tech: 'Study Strategy · Time Management · Tech Communities',
        tag: 'Academic Growth',
        icon: 'Users',
        description: `Set high GPA standards in Semester ${semester} and join student technical societies (ACM / IEEE / Google Developer Groups).`,
        keyCompetencies: [
          'Effective coursework planning and high-impact study routines',
          'Active participation in university tech clubs and hackathons',
          'Building strong peer study groups for technical collaboration',
          'Reading technical documentation and foundational CS articles',
        ],
        recommendedProject: {
          title: 'University Hackathon / Coding Contest Debut',
          description: 'Form a freshman team and participate in your first on-campus competitive programming contest or hackathon.',
          techStack: ['C++', 'Python', 'Competitive Coding'],
        },
        suggestedMilestone: {
          title: 'Participate in First University Coding Competition or Hackathon',
          category: 'Career',
          priority: 'Medium',
          estimatedTime: '3 weeks',
          actionType: 'Apply Opportunity',
        },
      },
    ];
  }

  // =========================================================================
  // STAGE 2: SEMESTERS 3 & 4 (Sophomore Core Systems & Algorithms)
  // =========================================================================
  if (stage === 2) {
    if (track === 'ai') {
      return [
        {
          number: '01',
          title: 'Data Structures & Algorithmic Complexity',
          tech: 'Arrays · Trees · Graphs · Stacks · Queues · Big-O',
          tag: 'Core Algorithms',
          icon: 'Binary',
          description: 'Master core memory data structures, recursive traversals, search/sort algorithms, and asymptotic complexity analysis.',
          keyCompetencies: [
            'Linked lists, binary search trees, heaps & hash maps',
            'Graph representations, BFS, DFS & topological sorting',
            'Time & space complexity analysis (Big-O, Big-Omega)',
            'LeetCode Easy/Medium algorithmic problem solving',
          ],
          recommendedProject: {
            title: 'Custom Data Structures Library & Visualizer',
            description: 'Implement a comprehensive library of self-balancing trees, graphs, and priority queues with visual benchmarks.',
            techStack: ['Python', 'C++', 'Data Structures'],
          },
          suggestedMilestone: {
            title: 'Solve 60+ LeetCode Data Structure & Algorithm Problems',
            category: 'Skill',
            priority: 'High',
            estimatedTime: '4 weeks',
            actionType: 'Skill Milestone',
          },
        },
        {
          number: '02',
          title: 'Object-Oriented Design & Software Architecture',
          tech: 'OOP · SOLID Principles · Design Patterns · UML',
          tag: 'Software Engineering',
          icon: 'Code',
          description: 'Learn object-oriented paradigms, encapsulation, polymorphism, design patterns (Factory, Strategy, Observer), and clean architecture.',
          keyCompetencies: [
            'Class hierarchies, inheritance vs composition, and polymorphism',
            'SOLID software design principles for maintainable codebases',
            'Essential design patterns: Factory, Singleton, Strategy, Observer',
            'Modular architecture with interfaces and dependency injection',
          ],
          recommendedProject: {
            title: 'Modular Simulation Engine with Design Patterns',
            description: 'Architect a simulation platform utilizing OOP patterns and loose coupling to model complex systems.',
            techStack: ['Python', 'Design Patterns', 'OOP'],
          },
          suggestedMilestone: {
            title: 'Refactor Legacy Codebase Applying SOLID Principles',
            category: 'Project',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '03',
          title: 'Relational Databases & SQL Engineering',
          tech: 'PostgreSQL · SQL Normalization · Indexes · ACID Transactions',
          tag: 'Data Architecture',
          icon: 'Database',
          description: 'Design robust relational database schemas, write complex analytical SQL queries, and understand transaction isolation.',
          keyCompetencies: [
            'Relational schema design, 3NF normalization & foreign keys',
            'Complex SQL: JOINs, GROUP BY, subqueries & window functions',
            'Indexing strategies (B-Tree, Hash) and query execution plans',
            'ACID transactions, concurrency control & data integrity',
          ],
          recommendedProject: {
            title: 'Academic Analytics Database with Complex SQL Queries',
            description: 'Design and populate a realistic relational database with automated seed scripts and optimized reporting queries.',
            techStack: ['PostgreSQL', 'SQL', 'Docker'],
          },
          suggestedMilestone: {
            title: 'Master Advanced SQL Queries & Query Plan Analysis',
            category: 'Skill',
            priority: 'Medium',
            estimatedTime: '2 weeks',
            actionType: 'Skill Milestone',
          },
        },
        {
          number: '04',
          title: 'Applied Machine Learning Foundations',
          tech: 'Scikit-Learn · Pandas · Feature Engineering · Regression',
          tag: 'AI Specialization',
          icon: 'Eye',
          description: `Transition into practical machine learning with tabular data, feature scaling, supervised models, and cross-validation for ${goalLabel}.`,
          keyCompetencies: [
            'Data wrangling, cleaning & exploratory data analysis with Pandas',
            'Supervised learning: Linear Regression, Logistic Regression, Trees',
            'Feature scaling, one-hot encoding & train/test split validation',
            'Evaluation metrics: Precision, Recall, F1-Score, ROC-AUC',
          ],
          recommendedProject: {
            title: 'Predictive Machine Learning Pipeline with Scikit-Learn',
            description: 'Build an end-to-end ML pipeline with exploratory data analysis, hyperparameter tuning, and model evaluation.',
            techStack: ['Python', 'Scikit-Learn', 'Pandas', 'Seaborn'],
          },
          suggestedMilestone: {
            title: 'Complete and Publish Machine Learning Benchmark on Kaggle / GitHub',
            category: 'Project',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Build Project',
          },
        },
      ];
    }

    if (track === 'fullstack') {
      return [
        {
          number: '01',
          title: 'Data Structures & Algorithmic Problem Solving',
          tech: 'DSA · Trees & Graphs · Stacks · Queues · Big-O',
          tag: 'Computer Science Core',
          icon: 'Binary',
          description: 'Master core algorithmic problem-solving patterns needed for full-stack engineering interviews and efficient systems.',
          keyCompetencies: [
            'Arrays, Hash Maps, Two-Pointers, and Sliding Window techniques',
            'Binary search, recursion, trees, BFS/DFS graph traversals',
            'Time & space complexity analysis (Big-O notation)',
            'Solving 60+ LeetCode problems with optimal space/time tradeoffs',
          ],
          recommendedProject: {
            title: 'Algorithmic Visualizer Web Application',
            description: 'Build an interactive web application that visualizes pathfinding algorithms (Dijkstra, A*) and sorting.',
            techStack: ['TypeScript', 'React', 'Algorithms'],
          },
          suggestedMilestone: {
            title: 'Solve 60+ LeetCode Easy & Medium DSA Problems',
            category: 'Skill',
            priority: 'High',
            estimatedTime: '4 weeks',
            actionType: 'Skill Milestone',
          },
        },
        {
          number: '02',
          title: 'Modern Full-Stack Architecture & React',
          tech: 'React 18/19 · TypeScript · Hooks · Component State',
          tag: 'Frontend Engineering',
          icon: 'Code',
          description: 'Construct robust single-page applications with React, TypeScript type safety, custom hooks, and modular UI components.',
          keyCompetencies: [
            'React component lifecycle, useState, useEffect, useMemo, useCallback',
            'TypeScript interfaces, generics & type-safe component props',
            'Client-side routing with React Router & navigation state',
            'Form handling, validation with Zod, and asynchronous data fetching',
          ],
          recommendedProject: {
            title: 'Full-Featured SaaS Dashboard with TypeScript & React',
            description: 'Develop a responsive admin and productivity dashboard with mock data, analytics charts, and search filters.',
            techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Lucide'],
          },
          suggestedMilestone: {
            title: 'Build and Deploy Full-Featured TypeScript React Application',
            category: 'Project',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '03',
          title: 'Backend API Engineering & Node.js/Express',
          tech: 'Node.js · Express · RESTful APIs · JWT Authentication',
          tag: 'Backend Engineering',
          icon: 'Database',
          description: 'Build secure, scalable RESTful backend APIs with middleware, JWT authentication, and request validation.',
          keyCompetencies: [
            'RESTful API design principles & HTTP status codes',
            'Express routing, custom middleware & centralized error handling',
            'Password hashing with bcrypt & stateless JWT token auth',
            'API testing with Postman and automated supertest suites',
          ],
          recommendedProject: {
            title: 'Secure Authentication & Content Management REST API',
            description: 'Construct a multi-role backend with registration, JWT login, role middleware, and rate limiting.',
            techStack: ['Node.js', 'Express', 'JWT', 'PostgreSQL'],
          },
          suggestedMilestone: {
            title: 'Architect and Document Production REST API with Swagger/Postman',
            category: 'Project',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '04',
          title: 'Relational Database Design & SQL with PostgreSQL',
          tech: 'PostgreSQL · Relational Modeling · Normalization · Migrations',
          tag: 'Data Persistence',
          icon: 'FolderGit2',
          description: 'Design normalized database schemas, write complex JOIN queries, and integrate ORMs/query builders.',
          keyCompetencies: [
            'Entity-Relationship (ER) diagrams & 3NF database normalization',
            'PostgreSQL indexing, foreign keys & cascade constraints',
            'Writing complex multi-table JOINs, aggregations & subqueries',
            'Database migrations and schema evolution practices',
          ],
          recommendedProject: {
            title: 'E-Commerce Database Schema & Query Optimization Suite',
            description: 'Design an e-commerce database with users, products, orders, and review tables, plus analytical queries.',
            techStack: ['PostgreSQL', 'SQL', 'Docker'],
          },
          suggestedMilestone: {
            title: 'Design 3NF Relational Schema with 5+ Related Tables',
            category: 'Skill',
            priority: 'Medium',
            estimatedTime: '2 weeks',
            actionType: 'Skill Milestone',
          },
        },
      ];
    }

    // Default Sophomore Core Systems (Cloud, Cyber, Data, General)
    return [
      {
        number: '01',
        title: 'Data Structures & Algorithmic Problem Solving',
        tech: 'Data Structures · Trees · Graphs · Complexity Analysis · LeetCode',
        tag: 'Computer Science Core',
        icon: 'Binary',
        description: `Master fundamental data structures, graph search, dynamic programming intuition, and algorithmic complexity for ${goalLabel}.`,
        keyCompetencies: [
          'Linear vs non-linear data structures: Trees, Heaps, Graphs',
          'BFS, DFS, Dijkstra, and topological sort implementations',
          'Rigorous asymptotic time and space complexity evaluation',
          'Structured problem-solving methodology for technical coding',
        ],
        recommendedProject: {
          title: 'Algorithmic Benchmark & Data Structure Suite',
          description: 'Implement and benchmark core data structures comparing memory and runtime profiles.',
          techStack: ['Python', 'C++', 'Algorithms'],
        },
        suggestedMilestone: {
          title: 'Solve 60+ LeetCode DSA Problems Across Key Patterns',
          category: 'Skill',
          priority: 'High',
          estimatedTime: '4 weeks',
          actionType: 'Skill Milestone',
        },
      },
      {
        number: '02',
        title: 'Object-Oriented Design & Clean Architecture',
        tech: 'OOP · SOLID Principles · Modular Design · Design Patterns',
        tag: 'Software Engineering',
        icon: 'Code',
        description: 'Implement production-grade software using object-oriented principles, design patterns, and decoupled architectures.',
        keyCompetencies: [
          'Encapsulation, inheritance, polymorphism, and abstraction',
          'Applying SOLID principles to avoid code smells and rigidity',
          'Creational, structural, and behavioral design patterns',
          'Unit testing and automated regression verification',
        ],
        recommendedProject: {
          title: 'Enterprise Management System with Design Patterns',
          description: 'Develop a modular system utilizing design patterns with comprehensive unit test coverage.',
          techStack: ['Java/C++/Python', 'Unit Testing', 'OOP'],
        },
        suggestedMilestone: {
          title: 'Build Test-Driven Object-Oriented Project with 80%+ Coverage',
          category: 'Project',
          priority: 'High',
          estimatedTime: '3 weeks',
          actionType: 'Build Project',
        },
      },
      {
        number: '03',
        title: 'Relational Database Engineering & SQL',
        tech: 'PostgreSQL · SQL Normalization · Transactions · Indexing',
        tag: 'Database Systems',
        icon: 'Database',
        description: 'Design resilient relational schemas, enforce referential integrity, and execute high-performance analytical SQL queries.',
        keyCompetencies: [
          'Relational schema design, primary/foreign keys & normalization',
          'Advanced SQL: window functions, aggregations & subqueries',
          'Transaction management, ACID properties & row locking',
          'Query optimization and indexing fundamentals',
        ],
        recommendedProject: {
          title: 'Scalable Relational Database for Enterprise Domain',
          description: 'Construct and optimize a PostgreSQL database with sample data, indexes, and automated test queries.',
          techStack: ['PostgreSQL', 'SQL', 'Docker'],
        },
        suggestedMilestone: {
          title: 'Master Advanced SQL Querying & Relational Schema Design',
          category: 'Skill',
          priority: 'Medium',
          estimatedTime: '2 weeks',
          actionType: 'Skill Milestone',
        },
      },
      {
        number: '04',
        title: 'Computer Systems, OS & Networking Foundations',
        tech: 'Linux OS · Processes & Threads · TCP/IP · Memory Layout',
        tag: 'Systems Architecture',
        icon: 'Terminal',
        description: 'Understand low-level computer architecture, process scheduling, concurrency, virtual memory, and socket networking.',
        keyCompetencies: [
          'Process lifecycle, multithreading, concurrency & race conditions',
          'Virtual memory, paging, cache hierarchies & stack vs heap',
          'TCP/IP stack, sockets, HTTP/HTTPS protocols & DNS mechanics',
          'Linux system monitoring using top, htop, ps, netstat & lsof',
        ],
        recommendedProject: {
          title: 'Multi-Threaded Network Socket Server',
          description: 'Implement a concurrent TCP client-server application handling simultaneous connections with thread pools.',
          techStack: ['C/C++ or Python', 'Sockets', 'Multithreading'],
        },
        suggestedMilestone: {
          title: 'Build Concurrent Client-Server Socket System',
          category: 'Project',
          priority: 'Medium',
          estimatedTime: '3 weeks',
          actionType: 'Build Project',
        },
      },
    ];
  }

  // =========================================================================
  // STAGE 3: SEMESTERS 5 & 6 (Junior Track Specialization & Internships)
  // =========================================================================
  if (stage === 3) {
    if (track === 'ai') {
      return [
        {
          number: '01',
          title: 'Applied Deep Learning & Vision',
          tech: 'PyTorch · CNNs · YOLOv8 · Transfer Learning',
          tag: 'Core AI Track',
          icon: 'Eye',
          description: `Master neural network architectures, computer vision representation, and transfer learning pipelines tailored for ${goalLabel}.`,
          keyCompetencies: [
            'Convolutional Neural Networks & Feature Pyramids',
            'Image Segmentation & Object Detection with YOLO',
            'Transfer Learning using Pretrained PyTorch models',
            'Inference optimization with ONNX / TensorRT runtime',
          ],
          recommendedProject: {
            title: 'Real-Time Object Detection & Tracking System',
            description: 'Construct an end-to-end multi-stream camera detection pipeline using YOLOv8 with FastAPI inference endpoints.',
            techStack: ['Python', 'PyTorch', 'OpenCV', 'FastAPI'],
          },
          suggestedMilestone: {
            title: 'Build a Real-Time Object Detection System',
            category: 'Project',
            priority: 'High',
            estimatedTime: '4 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '02',
          title: 'Algorithms & Mathematical Optimization',
          tech: 'Gradient Descent · Dynamic Programming · Graph Search',
          tag: 'Technical Coding',
          icon: 'Binary',
          description: 'Bridge computational complexity with linear algebra, automatic differentiation, and loss optimization for AI pipelines.',
          keyCompetencies: [
            'Matrix calculus, Jacobian tensors & autograd graph construction',
            'Dynamic programming and tree traversal algorithms',
            'Vectorized computing with NumPy & Tensor math',
            'LeetCode Mediums: Graph search, BFS/DFS, Topo sort',
          ],
          recommendedProject: {
            title: 'Custom Autograd & Neural Engine from Scratch',
            description: 'Implement a micro-autograd engine with backprop, computational graph visualization, and mini-batch SGD.',
            techStack: ['Python', 'NumPy', 'Graphviz'],
          },
          suggestedMilestone: {
            title: 'Master PyTorch & Neural Architecture Optimization',
            category: 'Skill',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Skill Milestone',
          },
        },
        {
          number: '03',
          title: 'Flagship AI Portfolio & MLOps',
          tech: 'Docker · FastAPI · Weights & Biases · HuggingFace',
          tag: 'Flagship Systems',
          icon: 'FolderGit2',
          description: 'Package, deploy, and benchmark production machine learning services with automated Docker containerization and caching.',
          keyCompetencies: [
            'Containerized model deployment using Docker & compose',
            'Low-latency asynchronous REST inference endpoints',
            'Experiment tracking & model artifact versioning',
            'CI/CD automated regression tests for inference latency',
          ],
          recommendedProject: {
            title: 'Production AI Inference Microservice',
            description: 'Deploy a resilient model inference service on cloud/Docker with caching, rate limiting, and health checks.',
            techStack: ['FastAPI', 'Docker', 'Redis', 'PyTorch'],
          },
          suggestedMilestone: {
            title: 'Deploy Production AI Microservice on Docker',
            category: 'Project',
            priority: 'Medium',
            estimatedTime: '3 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '04',
          title: 'Industry Networking & Internship Prep',
          tech: 'GitHub Portfolio · Open Source AI · Technical Interview Prep',
          tag: 'Career Readiness',
          icon: 'Users',
          description: `Position yourself for premier ${goalLabel} internships through verifiable open-source contributions and technical CV refinement.`,
          keyCompetencies: [
            'Contributing code to open-source ML/CV repositories',
            'Technical blogging on model architectures & benchmark results',
            'Refining ATS-optimized CV targeting AI engineering internships',
            'Mock technical coding and machine learning interviews',
          ],
          recommendedProject: {
            title: 'Open Source AI Library Contribution',
            description: 'Submit verified pull requests, bug fixes, and documentation improvements to active open-source AI projects.',
            techStack: ['Git', 'GitHub', 'Python', 'CI/CD'],
          },
          suggestedMilestone: {
            title: 'Apply to 15+ Target Machine Learning Summer Internships',
            category: 'Career',
            priority: 'High',
            estimatedTime: '2 weeks',
            actionType: 'Apply Opportunity',
          },
        },
      ];
    }

    if (track === 'fullstack') {
      return [
        {
          number: '01',
          title: 'Modern Web Architecture & Next.js',
          tech: 'Next.js 15 · TypeScript · React Server Components · Tailwind',
          tag: 'Frontend Architecture',
          icon: 'Code',
          description: `Architect scalable web user interfaces with Next.js App Router, streaming SSR, and type-safe state for ${goalLabel}.`,
          keyCompetencies: [
            'React Server Components & streaming architectures',
            'Zustand & TanStack Query for state synchronization',
            'Accessible design tokens & Tailwind CSS styling',
            'Core Web Vitals & performance optimization',
          ],
          recommendedProject: {
            title: 'Real-Time Collaborative Web Workspace',
            description: 'Build a Next.js application with optimistic UI updates, WebSocket collaboration, and type-safe APIs.',
            techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'WebSockets'],
          },
          suggestedMilestone: {
            title: 'Build a Real-Time Collaborative Next.js App',
            category: 'Project',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '02',
          title: 'Distributed Backends & Caching',
          tech: 'PostgreSQL · Node.js · Redis · REST / GraphQL',
          tag: 'Backend Engineering',
          icon: 'Database',
          description: 'Design robust relational schemas, complex SQL queries, index optimization, and Redis caching layers.',
          keyCompetencies: [
            'PostgreSQL relational schema modeling & indexing',
            'Redis distributed caching, token bucket rate limiting',
            'JWT authentication & role-based access control',
            'RESTful API contracts with Zod validation',
          ],
          recommendedProject: {
            title: 'High-Throughput Backend Microservice',
            description: 'Construct a secure Node.js backend with PostgreSQL pooler, Redis caching, and automated integration tests.',
            techStack: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
          },
          suggestedMilestone: {
            title: 'Architect Scalable Backend with PostgreSQL & Redis',
            category: 'Skill',
            priority: 'High',
            estimatedTime: '2 weeks',
            actionType: 'Skill Milestone',
          },
        },
        {
          number: '03',
          title: 'Flagship Full-Stack SaaS Portfolio',
          tech: 'Next.js · Stripe · Docker · CI/CD Pipelines',
          tag: 'Flagship Systems',
          icon: 'FolderGit2',
          description: 'Ship an end-to-end commercial-grade web product complete with user authentication, Stripe billing, and cloud deployment.',
          keyCompetencies: [
            'Stripe subscription checkout & webhook handling',
            'Automated CI/CD build & test workflows with GitHub Actions',
            'Containerized production deployments on Vercel / Railway / AWS',
            'Database migrations & zero-downtime releases',
          ],
          recommendedProject: {
            title: 'Commercial Full-Stack SaaS with Live Payments',
            description: 'Deploy a live SaaS platform with auth, tenant isolation, and automated payment fulfillment.',
            techStack: ['Next.js', 'PostgreSQL', 'Stripe', 'Docker'],
          },
          suggestedMilestone: {
            title: 'Deploy Full-Stack SaaS with Stripe Integration',
            category: 'Project',
            priority: 'Medium',
            estimatedTime: '4 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '04',
          title: 'System Design & Technical Interviews',
          tech: 'DSA Patterns · Distributed Systems · Technical CV',
          tag: 'Career Readiness',
          icon: 'Users',
          description: 'Master medium-hard algorithm problem patterns, distributed system design primers, and technical portfolio presentation.',
          keyCompetencies: [
            '75+ LeetCode DSA patterns: Trees, DP, Sliding Window, Graphs',
            'System design fundamentals: Load balancers, CDNs, DB sharding',
            'Production GitHub showcase with live demo links & documentation',
            'Mock technical coding interviews & architectural whiteboard practice',
          ],
          recommendedProject: {
            title: 'Distributed System Prototype: Rate Limiter & URL Engine',
            description: 'Build and document a distributed URL shortening service with Redis caching and analytic counters.',
            techStack: ['TypeScript', 'Redis', 'PostgreSQL'],
          },
          suggestedMilestone: {
            title: 'Apply to 15+ Full-Stack Software Engineering Internships',
            category: 'Career',
            priority: 'High',
            estimatedTime: '2 weeks',
            actionType: 'Apply Opportunity',
          },
        },
      ];
    }

    if (track === 'cloud') {
      return [
        {
          number: '01',
          title: 'Cloud Architecture & AWS Services',
          tech: 'AWS (EC2, S3, VPC, IAM) · Linux · Networking',
          tag: 'Cloud Infrastructure',
          icon: 'Cloud',
          description: 'Design resilient multi-tier cloud architectures following AWS Well-Architected Framework best practices.',
          keyCompetencies: [
            'VPC networking: subnets, route tables, internet gateways & NAT',
            'IAM least-privilege security policies, roles & MFA',
            'Compute & storage: EC2 auto-scaling groups, S3 lifecycle policies',
            'Cloud security group configuration and network ACLs',
          ],
          recommendedProject: {
            title: 'High-Availability Multi-Tier Cloud Deployment',
            description: 'Deploy a resilient web application behind an Application Load Balancer with auto-scaling across two Availability Zones.',
            techStack: ['AWS', 'Terraform', 'Linux'],
          },
          suggestedMilestone: {
            title: 'Complete AWS Cloud Practitioner or SAA Milestones',
            category: 'Skill',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Skill Milestone',
          },
        },
        {
          number: '02',
          title: 'Containerization & Kubernetes',
          tech: 'Docker · Docker Compose · Kubernetes · Helm',
          tag: 'Containers & Orchestration',
          icon: 'FolderGit2',
          description: 'Package applications into optimized multi-stage Docker images and orchestrate multi-service deployments with Kubernetes.',
          keyCompetencies: [
            'Writing multi-stage Dockerfiles with minimal attack surface',
            'Docker Compose multi-container local environments',
            'Kubernetes Pods, Deployments, Services, and Ingress rules',
            'ConfigMaps, Secrets management & resource limits',
          ],
          recommendedProject: {
            title: 'Production Kubernetes Microservices Cluster',
            description: 'Deploy an auto-scaling microservices cluster with Helm charts and zero-downtime rolling updates.',
            techStack: ['Docker', 'Kubernetes', 'Helm'],
          },
          suggestedMilestone: {
            title: 'Deploy Production Kubernetes Microservices Cluster',
            category: 'Project',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '03',
          title: 'Infrastructure as Code & CI/CD',
          tech: 'Terraform · GitHub Actions · GitOps · ArgoCD',
          tag: 'DevOps Automation',
          icon: 'Terminal',
          description: 'Provision cloud environments deterministically with Terraform and automate testing and continuous delivery.',
          keyCompetencies: [
            'Terraform modular architecture and state management',
            'GitHub Actions automated build, test & security linting',
            'GitOps deployment automation with ArgoCD',
            'Secrets management with Vault / AWS Secrets Manager',
          ],
          recommendedProject: {
            title: 'End-to-End GitOps Deployment Pipeline',
            description: 'Build an automated pipeline that triggers Terraform plans and pushes container updates to Kubernetes.',
            techStack: ['Terraform', 'GitHub Actions', 'ArgoCD'],
          },
          suggestedMilestone: {
            title: 'Build Automated GitOps CI/CD Pipeline',
            category: 'Project',
            priority: 'Medium',
            estimatedTime: '4 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '04',
          title: 'Observability & SRE Production Readiness',
          tech: 'Prometheus · Grafana · Distributed Tracing · SLIs/SLOs',
          tag: 'Career Readiness',
          icon: 'Users',
          description: 'Monitor cloud reliability, define error budgets, and gain hands-on site reliability engineering experience.',
          keyCompetencies: [
            'Prometheus metric collection and PromQL alerts',
            'Grafana dashboard visualization for golden signals',
            'Distributed tracing with OpenTelemetry',
            'Site Reliability Engineering principles & incident post-mortems',
          ],
          recommendedProject: {
            title: 'Full-Stack Observability Suite with Grafana',
            description: 'Instrument application metrics with Prometheus, export distributed traces, and craft live dashboards.',
            techStack: ['Prometheus', 'Grafana', 'OpenTelemetry'],
          },
          suggestedMilestone: {
            title: 'Apply to Cloud & DevOps Engineering Summer Internships',
            category: 'Career',
            priority: 'High',
            estimatedTime: '2 weeks',
            actionType: 'Apply Opportunity',
          },
        },
      ];
    }

    if (track === 'cybersecurity') {
      return [
        {
          number: '01',
          title: 'Network Defense & Protocol Analysis',
          tech: 'Wireshark · Nmap · TCP/IP · Firewalls · Suricata',
          tag: 'Network Security',
          icon: 'Shield',
          description: 'Analyze network packets, identify reconnaissance attempts, configure firewalls, and detect anomalies.',
          keyCompetencies: [
            'Packet inspection & protocol analysis with Wireshark',
            'Network discovery & vulnerability scanning with Nmap',
            'Configuring Linux iptables, UFW, and pfSense rules',
            'Intrusion Detection/Prevention with Snort or Suricata',
          ],
          recommendedProject: {
            title: 'Home Network Intrusion Detection Lab',
            description: 'Set up an isolated virtual lab with Suricata IDS analyzing simulated network attacks.',
            techStack: ['Wireshark', 'Suricata', 'Linux', 'pfSense'],
          },
          suggestedMilestone: {
            title: 'Complete 25+ Network Defense Labs on TryHackMe',
            category: 'Skill',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Skill Milestone',
          },
        },
        {
          number: '02',
          title: 'Web Application Security & OWASP Top 10',
          tech: 'Burp Suite · SQLi · XSS · CSRF · IDOR · Auth Bypass',
          tag: 'AppSec Engineering',
          icon: 'Code',
          description: 'Perform web application security assessments, exploit common vulnerabilities ethically, and implement mitigations.',
          keyCompetencies: [
            'Intercepting and modifying HTTP requests with Burp Suite',
            'SQL Injection and Cross-Site Scripting (XSS) defense',
            'Insecure Direct Object References (IDOR) & Broken Access Control',
            'Secure coding practices and automated SAST/DAST pipelines',
          ],
          recommendedProject: {
            title: 'Vulnerable App Penetration Test & Remediation Report',
            description: 'Audit a vulnerable web application (DVWA/Juice Shop) and document findings in an industry-standard pentest report.',
            techStack: ['Burp Suite', 'OWASP ZAP', 'Python', 'Markdown'],
          },
          suggestedMilestone: {
            title: 'Publish Comprehensive Web Penetration Testing Report',
            category: 'Project',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '03',
          title: 'Linux Hardening & SOC Operations',
          tech: 'SIEM · Splunk · ELK Stack · Linux Hardening · Bash',
          tag: 'SOC & Defensive Security',
          icon: 'Terminal',
          description: 'Deploy centralized log analytics, configure SIEM dashboards, and harden Linux operating systems against privilege escalation.',
          keyCompetencies: [
            'Centralized log parsing and rule creation in Splunk / ELK',
            'Linux privilege escalation vectors and mitigation',
            'CIS benchmarks for OS and SSH hardening',
            'Incident response workflows and forensic timeline analysis',
          ],
          recommendedProject: {
            title: 'Automated SOC Log Analysis & Alerting Pipeline',
            description: 'Configure an ELK or Splunk instance ingesting auth logs with automated alerts for brute-force attacks.',
            techStack: ['Splunk', 'ELK', 'Linux', 'Bash'],
          },
          suggestedMilestone: {
            title: 'Build Live SOC SIEM Monitoring Lab on AWS/Local',
            category: 'Project',
            priority: 'Medium',
            estimatedTime: '3 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '04',
          title: 'Industry Certifications & Bug Bounty',
          tech: 'CompTIA Security+ · CEH · HackerOne · Technical Portfolio',
          tag: 'Career Readiness',
          icon: 'Users',
          description: 'Prepare for industry-recognized security credentials, participate in CTFs, and pursue cybersecurity internships.',
          keyCompetencies: [
            'CompTIA Security+ / eJPT core domain preparation',
            'Participation in capture-the-flag (CTF) team competitions',
            'Writing technical vulnerability writeups on Medium or personal blog',
            'Resume preparation for Security Analyst & Junior Pentester roles',
          ],
          recommendedProject: {
            title: 'Public Cybersecurity Technical Knowledge Base',
            description: 'Curate a published GitHub GitBook detailing CTF solutions, pentest methodologies, and defense strategies.',
            techStack: ['Git', 'Markdown', 'CTF Writeups'],
          },
          suggestedMilestone: {
            title: 'Apply to 15+ Cybersecurity Analyst & Pentest Internships',
            category: 'Career',
            priority: 'High',
            estimatedTime: '2 weeks',
            actionType: 'Apply Opportunity',
          },
        },
      ];
    }

    // Default Junior Track
    return [
      {
        number: '01',
        title: 'Advanced Domain Specialization & Frameworks',
        tech: 'Production Frameworks · Domain Architecture · APIs',
        tag: 'Core Domain Track',
        icon: 'Code',
        description: `Deep dive into advanced tooling and architectural patterns required for ${goalLabel}.`,
        keyCompetencies: [
          'Production-grade framework mastery and state management',
          'Scalable component and service separation',
          'API integration, error recovery, and caching strategies',
          'Unit, integration, and end-to-end automated testing',
        ],
        recommendedProject: {
          title: 'Flagship Domain Architecture Implementation',
          description: 'Build and document a full-scale application showcasing your primary technical specialization.',
          techStack: ['TypeScript/Python', 'Docker', 'PostgreSQL'],
        },
        suggestedMilestone: {
          title: 'Complete and Deploy Flagship Technical System',
          category: 'Project',
          priority: 'High',
          estimatedTime: '4 weeks',
          actionType: 'Build Project',
        },
      },
      {
        number: '02',
        title: 'Algorithms & Technical Interview Preparation',
        tech: 'Graph Algorithms · Dynamic Programming · LeetCode 75',
        tag: 'Technical Coding',
        icon: 'Binary',
        description: 'Prepare for competitive technical interviews by mastering high-frequency algorithmic problem patterns.',
        keyCompetencies: [
          'Graph search, BFS/DFS, topological sorting, and shortest path',
          'Dynamic programming memoization and bottom-up tabulations',
          'Time and space complexity tradeoffs during live coding',
          'Communication and whiteboard presentation skills',
        ],
        recommendedProject: {
          title: 'Curated Algorithmic Problem Solutions Repository',
          description: 'Document 75+ optimal algorithmic solutions with time/space complexity notes and edge cases.',
          techStack: ['Python/C++', 'GitHub', 'Algorithms'],
        },
        suggestedMilestone: {
          title: 'Complete 75+ Blind/Grind LeetCode Problems',
          category: 'Skill',
          priority: 'High',
          estimatedTime: '3 weeks',
          actionType: 'Skill Milestone',
        },
      },
      {
        number: '03',
        title: 'Production Deployment & Cloud Tooling',
        tech: 'Docker · CI/CD · Cloud Hosting · Monitoring',
        tag: 'Flagship Systems',
        icon: 'FolderGit2',
        description: 'Automate build pipelines, containerize backend microservices, and deploy projects live.',
        keyCompetencies: [
          'Multi-stage Docker builds and minimal images',
          'GitHub Actions CI/CD pipelines for automated testing and deploy',
          'Environment variables, secret management, and cloud config',
          'Application logging, health checks, and basic metrics',
        ],
        recommendedProject: {
          title: 'Automated CI/CD & Container Deployment Pipeline',
          description: 'Configure automated testing and continuous deployment on cloud infrastructure with zero downtime.',
          techStack: ['Docker', 'GitHub Actions', 'Cloud'],
        },
        suggestedMilestone: {
          title: 'Deploy Production Application with CI/CD Automation',
          category: 'Project',
          priority: 'Medium',
          estimatedTime: '3 weeks',
          actionType: 'Build Project',
        },
      },
      {
        number: '04',
        title: 'Internship Applications & Technical Resume',
        tech: 'ATS Resume · GitHub Showcase · LinkedIn · Networking',
        tag: 'Career Readiness',
        icon: 'Users',
        description: `Target high-impact summer internships in ${goalLabel} with a tailored resume and portfolio.`,
        keyCompetencies: [
          'ATS-optimized resume highlighting verifiable projects and metrics',
          'Polished GitHub profile with clean READMEs and live links',
          'Reaching out to engineering alumni and recruiters on LinkedIn',
          'Mock behavioral and STAR method interview preparation',
        ],
        recommendedProject: {
          title: 'Technical Portfolio & ATS Resume Overhaul',
          description: 'Audit and polish your online presence, technical resume, and project documentation for recruiter outreach.',
          techStack: ['Markdown', 'LaTeX', 'GitHub'],
        },
        suggestedMilestone: {
          title: 'Apply to 20+ Targeted Summer Engineering Internships',
          category: 'Career',
          priority: 'High',
          estimatedTime: '2 weeks',
          actionType: 'Apply Opportunity',
        },
      },
    ];
  }

  // =========================================================================
  // STAGE 4: SEMESTERS 7 & 8 (Senior Capstone / FYP & Career Placement)
  // =========================================================================
  return [
    {
      number: '01',
      title: 'Final Year Project (FYP) & Capstone Architecture',
      tech: 'Distributed Architecture · High Availability · Microservices · Research',
      tag: 'Senior Capstone',
      icon: 'FolderGit2',
      description: `Architect, build, and deliver your university Final Year Project (FYP) to enterprise standards for ${goalLabel}.`,
      keyCompetencies: [
        'End-to-end software architecture design and modularity',
        'High-availability data pipelines and fault tolerance',
        'Writing comprehensive academic & engineering project documentation',
        'Defending system design decisions before faculty and industry juries',
      ],
      recommendedProject: {
        title: 'Enterprise-Grade Capstone Platform (FYP)',
        description: 'Complete a full-scale capstone project solving a real-world enterprise or research problem with live demonstration.',
        techStack: ['Full Stack/AI', 'Docker', 'PostgreSQL', 'Cloud'],
      },
      suggestedMilestone: {
        title: 'Complete Final Year Project (FYP) Defense & Live Deployment',
        category: 'Project',
        priority: 'High',
        estimatedTime: '6 weeks',
        actionType: 'Build Project',
      },
    },
    {
      number: '02',
      title: 'System Design & Distributed Scalability',
      tech: 'Load Balancers · Caching · Sharding · Message Queues (Kafka/RabbitMQ)',
      tag: 'System Design',
      icon: 'Binary',
      description: 'Master large-scale system design concepts required for senior and mid-level engineering interviews.',
      keyCompetencies: [
        'Horizontal vs vertical scaling, load balancing algorithms',
        'Database sharding, read replicas, CAP theorem & consistency models',
        'Message brokers, event-driven architectures & Kafka/RabbitMQ',
        'Designing real-world systems: URL Shortener, Twitter Feed, Video Streaming',
      ],
      recommendedProject: {
        title: 'Distributed Event-Driven Microservices Prototype',
        description: 'Build a distributed architecture utilizing a message queue for asynchronous event processing.',
        techStack: ['Node.js/Go/Python', 'Redis', 'Kafka', 'Docker'],
      },
      suggestedMilestone: {
        title: 'Master 10+ Classic System Design Architectures',
        category: 'Skill',
        priority: 'High',
        estimatedTime: '3 weeks',
        actionType: 'Skill Milestone',
      },
    },
    {
      number: '03',
      title: 'Production Reliability, MLOps / DevOps & Scaling',
      tech: 'Kubernetes · Terraform · Prometheus · CI/CD · Security Hardening',
      tag: 'Production Readiness',
      icon: 'Terminal',
      description: 'Ensure software systems run reliably in production with automated telemetry, security audits, and zero-downtime releases.',
      keyCompetencies: [
        'Production logging, metric alerts, and incident triage',
        'Zero-downtime blue/green or canary deployment strategies',
        'Secrets rotation and OWASP security vulnerability auditing',
        'Cost optimization and resource rightsizing on cloud',
      ],
      recommendedProject: {
        title: 'Production Hardening & Automated Deployment Suite',
        description: 'Instrument an enterprise application with distributed tracing, automated load tests, and security scans.',
        techStack: ['Docker', 'Prometheus', 'Grafana', 'GitHub Actions'],
      },
      suggestedMilestone: {
        title: 'Audit and Harden Capstone Application for Production Scale',
        category: 'Project',
        priority: 'Medium',
        estimatedTime: '3 weeks',
        actionType: 'Build Project',
      },
    },
    {
      number: '04',
      title: 'Full-Time Placement & Technical Interview Mastery',
      tech: 'Mock Interviews · LeetCode Medium/Hard · Offer Negotiation · Alumni',
      tag: 'Career Placement',
      icon: 'Users',
      description: `Secure top-tier graduate placement in ${goalLabel} through technical interview mastery and salary negotiation.`,
      keyCompetencies: [
        'Solving LeetCode Medium and Hard problems under timed conditions',
        'Whiteboard architecture and live technical design presentations',
        'Connecting with senior tech alumni for employee referrals',
        'Navigating technical take-home assignments and offer evaluation',
      ],
      recommendedProject: {
        title: 'Graduate Engineering Placement Campaign',
        description: 'Execute a structured application and networking pipeline across top target tech companies.',
        techStack: ['Career Portfolio', 'Technical Interview Prep', 'GitHub'],
      },
      suggestedMilestone: {
        title: 'Secure Full-Time Graduate Software / AI Engineering Offer',
        category: 'Career',
        priority: 'High',
        estimatedTime: '4 weeks',
        actionType: 'Apply Opportunity',
      },
    },
  ];
}

/**
 * Generate Authentic, Dynamic Semester-Aware Focus Pillars using AI (Groq/Gemini/OpenAI)
 * with graceful fallback to our rich 24-combination academic deterministic matrix.
 */
export async function generateSemesterAwareFocusPillars(
  context: StudentFocusPillarsContext
): Promise<{ pillars: FocusPillar[]; stageLabel: string; source: 'ai' | 'curriculum_engine' }> {
  const { name, degree, semester, gpa, careerGoal, university, skills, projects, relevantCoursework } = context;
  const stage = getSemesterStage(semester);
  const stageLabel = getStageLabel(semester);
  const trackKey = detectTrackKey(careerGoal, degree);

  const skillsList = skills?.map((s) => s.name).join(', ') || 'Core fundamentals';
  const courseworkList = relevantCoursework?.join(', ') || 'Standard Computer Science Curriculum';
  const projectsList = projects?.map((p) => p.title).join(', ') || 'Academic coursework';

  // 1. Attempt AI Generation via multi-provider if key is configured
  const rawGroq = (process.env.GROQ_API_KEY || '').trim();
  if (isValidApiKey(rawGroq)) {
    const prompt = `You are the Campus OS Elite Academic & Career AI Recommendation Engine.
The student is currently in Semester ${semester} of 8 pursuing ${degree} at ${university}.
Their Cumulative GPA is ${gpa.toFixed(2)}.
Target Career Goal: ${careerGoal}.
Academic Stage: ${stageLabel} (Stage ${stage} of 4).
Student Skills: ${skillsList}.
Student Coursework: ${courseworkList}.
Student Projects: ${projectsList}.

ACADEMIC REALITY CONSTRAINTS FOR SEMESTER ${semester}:
${
  stage === 1
    ? 'The student is a FRESHMAN (Semester 1-2). They need fundamental programming syntax, discrete math/linear algebra, developer tooling (Git/Linux CLI), and basic CLI projects. DO NOT assign advanced deep learning, microservices, or complex cloud architectures.'
    : stage === 2
    ? 'The student is a SOPHOMORE (Semester 3-4). They are taking Data Structures & Algorithms, Object-Oriented Design, Relational Databases (SQL), and Computer Systems/OS. Focus on DSA problem-solving, OOP patterns, and full-stack/database foundations.'
    : stage === 3
    ? 'The student is a JUNIOR (Semester 5-6). They are ready for specialized domain engineering (their target career track), flagship portfolio builds, and technical interview preparation for Summer Internships.'
    : 'The student is a SENIOR (Semester 7-8). Focus on their university Final Year Project (FYP) / Capstone system architecture, production scaling/DevOps, system design interviews, and securing full-time graduate placement.'
}

Generate EXACTLY 4 Focus Pillars for Semester ${semester}.
Return ONLY a valid JSON array of 4 objects matching this exact schema:
[
  {
    "number": "01",
    "title": "Pillar Title (tailored to Semester ${semester} and ${careerGoal})",
    "tech": "Key technologies separated by middot, e.g. Python · Git · Math",
    "tag": "Short tag e.g. Foundational Coding, Core Systems, Domain Track, etc.",
    "icon": "One of: Code, Binary, FolderGit2, Users, Database, Shield, Cloud, Eye, LineChart, Terminal",
    "description": "2-3 sentence strategic rationale for this student in Semester ${semester}",
    "keyCompetencies": [
      "Concrete competency 1",
      "Concrete competency 2",
      "Concrete competency 3",
      "Concrete competency 4"
    ],
    "recommendedProject": {
      "title": "Specific project title tailored to Semester ${semester}",
      "description": "Project description",
      "techStack": ["Tech1", "Tech2", "Tech3"]
    },
    "suggestedMilestone": {
      "title": "Actionable milestone title",
      "category": "Project",
      "priority": "High",
      "estimatedTime": "e.g. 3 weeks",
      "actionType": "Build Project"
    }
  }
]`;

    const groqModels = ['qwen/qwen3.8-27b', 'groq/compound-mini'];
    for (const model of groqModels) {
      try {
        const groq = new Groq({ apiKey: rawGroq, timeout: 8000 });
        const completion = await groq.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are the Campus OS Curriculum Engine. Output ONLY valid JSON array with 4 objects.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.25,
          max_tokens: 800,
        });

        const content = completion.choices[0]?.message?.content || '[]';
        const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length === 4) {
          const validatedPillars: FocusPillar[] = parsed.map((item: any, idx: number) => ({
            number: item.number || `0${idx + 1}`,
            title: String(item.title || `Focus Pillar ${idx + 1}`),
            tech: String(item.tech || 'Core Engineering'),
            tag: String(item.tag || 'Academic Priority'),
            icon: String(item.icon || 'Code'),
            description: String(item.description || ''),
            keyCompetencies: Array.isArray(item.keyCompetencies) ? item.keyCompetencies.map(String) : [],
            recommendedProject: {
              title: String(item.recommendedProject?.title || 'Hands-On Project'),
              description: String(item.recommendedProject?.description || 'Build and implement solution'),
              techStack: Array.isArray(item.recommendedProject?.techStack) ? item.recommendedProject.techStack.map(String) : ['Python'],
            },
            suggestedMilestone: {
              title: String(item.suggestedMilestone?.title || 'Action Milestone'),
              category: item.suggestedMilestone?.category || 'Project',
              priority: item.suggestedMilestone?.priority || 'High',
              estimatedTime: String(item.suggestedMilestone?.estimatedTime || '3 weeks'),
              actionType: String(item.suggestedMilestone?.actionType || 'Build Project'),
            },
          }));

          return {
            pillars: validatedPillars,
            stageLabel,
            source: 'ai',
          };
        }
      } catch (err: any) {
        // Continue to next model or curriculum matrix
      }
    }
  }

  // 2. Deterministic Expert Curriculum Matrix (Fast, reliable, 100% semester-accurate)
  const pillars = getDeterministicSemesterPillars(trackKey, semester, careerGoal, degree);
  return {
    pillars,
    stageLabel,
    source: 'curriculum_engine',
  };
}
