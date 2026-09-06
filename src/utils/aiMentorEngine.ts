import { StudentUser, CareerReadinessBreakdown, SkillProgressItem } from '../types';

export interface AIResponseContext {
  user: StudentUser;
  careerReadiness?: CareerReadinessBreakdown;
  skills?: SkillProgressItem[];
}

export interface AIResponseOptions {
  concise?: boolean;
}

export function generateSmartMentorResponse(
  query: string,
  context: AIResponseContext,
  options?: AIResponseOptions
): string {
  const { user, careerReadiness, skills = [] } = context;
  const isConcise = options?.concise ?? false;
  const q = (query || '').toLowerCase();
  const studentName = user.name || 'Ali Raza';
  const careerGoal = user.careerGoal || 'AI / Machine Learning Engineer';
  const semester = user.semester || 5;
  const currentGPA = user.gpa ? user.gpa.toFixed(2) : '3.42';
  const readinessScore = careerReadiness?.overall || user.careerReadiness || 68;

  // Domain relevance checking
  const irrelevantKeywords = [
    'recipe', 'cook', 'food', 'movie', 'song', 'music', 'singer', 'actor', 'cricket match',
    'football score', 'ipl', 'psl', 'game cheat', 'gossip', 'celebrity', 'politics',
    'president', 'weather in paris', 'horoscope', 'zodiac', 'joke', 'dance'
  ];
  const isIrrelevant = irrelevantKeywords.some((k) => q.includes(k));

  if (isIrrelevant) {
    if (isConcise) {
      return `I'm **Campus GPT**, calibrated for your **${careerGoal}** journey in CampusOS. I only answer academic & career questions!`;
    }
    return `I am **Campus GPT**, your dedicated CampusOS AI Career & Academic Mentor. 

I am calibrated specifically for your academic progress, career goals (**${careerGoal}**), skills, and university milestones within CampusOS. I don't have information on this topic.

*Feel free to ask me about your coursework, roadmap, projects, skill gaps, or internship preparation!*`;
  }

  if (
    /^(hi|hello|hey|salam|assalam|aoa|greetings|good\s*(morning|afternoon|evening)|howdy|sup|hola)\b/i.test(q.trim())
  ) {
    return `Hello **${studentName}**! 👋 How can I help you today?`;
  }

  if (
    q.includes('who are you') ||
    q.includes('who uh are') ||
    q.includes('who u are') ||
    q.includes('who r u') ||
    q.includes('who you are') ||
    q.includes('what can you do') ||
    q.includes('introduction') ||
    q.includes('introduce yourself')
  ) {
    return `I'm **Campus GPT**, your AI mentor for **${careerGoal}**. How can I assist you with your studies or career today?`;
  }

  if (q.includes('skill') || q.includes('gap') || q.includes('learn') || q.includes('tech stack') || q.includes('python') || q.includes('pytorch')) {
    if (isConcise) {
      return `### 📊 Priority Skills for ${careerGoal}
• **MLOps & Deployment**: Docker, FastAPI & model serving
• **Agentic AI & RAG**: Vector DBs, LangChain, embeddings
• **Model Fine-Tuning**: Hugging Face Transformers & LoRA
*Closing these gaps will boost your readiness to 85%+.*`;
    }

    const topSkills = skills.slice(0, 4).map((s) => s.name).join(', ') || 'Python, PyTorch, LangChain, TensorFlow';
    return `### 📊 Skill Gap Analysis for ${studentName}

Target Role: **${careerGoal}**

**Current Strengths:** ${topSkills}

**Priority Skills to Master for Industry Benchmarks:**
1. **MLOps & Deployment**: Docker containerization, FastAPI serving, Triton inference server, ONNX Runtime.
2. **Generative AI & Agentic Systems**: Vector Databases (Qdrant, ChromaDB), LangChain / LangGraph, RAG architecture.
3. **Model Fine-Tuning & Quantization**: Hugging Face Transformers, LoRA/QLoRA, bitsandbytes.
4. **Data Engineering Pipelines**: Apache Spark, Kafka basics, SQL query optimization.

> *Closing these gaps will elevate your career readiness from ${readinessScore}% to 85%+.*`;
  }

  if (q.includes('project') || q.includes('flagship') || q.includes('build') || q.includes('portfolio') || q.includes('github') || q.includes('capstone')) {
    if (isConcise) {
      return `### 🚀 Flagship Projects (Semester ${semester})
• **Agentic RAG Assistant**: FastAPI, Qdrant & React
• **Medical Vision Classifier**: PyTorch & CLIP / ViT
• **Edge Vision Pipeline**: TensorRT & YOLOv8 (60+ FPS)
*Deploy on Cloud Run and link the GitHub repo on your profile!*`;
    }

    return `### 🚀 Recommended Semester ${semester} Flagship Projects for ${careerGoal}

1. **Enterprise Agentic RAG Document Assistant**
   • **Tech Stack**: FastAPI, LangChain, Qdrant Vector DB, React, Docker
   • **Key Deliverable**: High-throughput semantic search across PDF archives with verifiable source citations and streaming responses.

2. **Multimodal Medical Vision & Diagnostics System**
   • **Tech Stack**: PyTorch, CLIP/BioGPT, FastAPI, Tailwind CSS
   • **Key Deliverable**: Chest X-ray anomaly detection with localized attention heatmaps (Grad-CAM) and structured reporting.

3. **High-Efficiency Edge Vision Pipeline**
   • **Tech Stack**: OpenCV, TensorRT, YOLOv8, ONNX, WebSockets
   • **Key Deliverable**: Real-time multi-camera object detection running at 60+ FPS on edge computing boards.

*Recruiter Tip: Host a live demo on HuggingFace Spaces or Cloud Run and link the GitHub repository prominently in your profile.*`;
  }

  if (q.includes('readiness') || q.includes('boost') || q.includes('score') || q.includes('68%') || q.includes('improve')) {
    if (isConcise) {
      return `### 📈 Quick Blueprint: ${readinessScore}% → 85%+
• **Ship 1 Flagship AI Project (+12%)**: Full-stack with live URL
• **Summer Internship (+8%)**: Industry ML or Data Science role
• **Verified Credential (+4%)**: AWS ML Specialty or DeepLearning.AI`;
    }

    return `### 📈 Action Plan: Lift Readiness (${readinessScore}% → 85%+)

Here is your calculated blueprint based on your **GPA (${currentGPA})** and **Semester ${semester}** standing:

• **1. Ship 1 Flagship Production Project (+12%)**: Build and deploy an end-to-end full-stack AI system with live URL and clean GitHub documentation.
• **2. Secure Industry Experience (+8%)**: Land an AI / Data Science summer internship or university research fellowship.
• **3. Earn Verified Cloud / ML Credential (+4%)**: Complete AWS Machine Learning Specialty or DeepLearning.AI Deep Learning Specialization.
• **4. Technical Writing & Open Source (+3%)**: Publish a technical breakdown on Medium/Substack detailing your ML system architecture.`;
  }

  if (q.includes('internship') || q.includes('job') || q.includes('opportunity') || q.includes('summer') || q.includes('hire')) {
    if (isConcise) {
      return `### 💼 Summer Internship Gameplan
• **Target Roles**: ML Engineering & Applied GenAI Intern
• **Strategy**: Feature 2 live GitHub projects with benchmark stats
• **Action**: Reach out directly to Tech Leads on LinkedIn now`;
    }

    return `### 💼 Summer Internship Gameplan for ${careerGoal}

With your **GPA of ${currentGPA}** in **Semester ${semester}**, you are in a prime position for Summer AI/ML roles:

1. **Top Target Roles**:
   • Machine Learning Engineering Intern
   • Applied AI / GenAI Research Intern
   • Data Science Intern

2. **Application Strategy**:
   • **Portfolio Over Resume**: Feature your top 2 GitHub repos with live demo links and quantifiable metrics (*e.g., "Reduced inference latency by 45% using TensorRT"*).
   • **Cold Outreach**: Reach out directly to Engineering Managers and Tech Leads on LinkedIn with tailored 2-sentence value pitches.
   • **Timeline**: Start applying now—tier-1 tech firms finalize summer cohorts 3–4 months in advance.`;
  }

  if (q.includes('gpa') || q.includes('academic') || q.includes('semester') || q.includes('course') || q.includes('credit')) {
    if (isConcise) {
      return `### 🎓 Academic Overview
• **CGPA**: **${currentGPA} / 4.00** *(Semester ${semester})*
• **Core Focus**: Algorithms, Deep Learning & Database Systems
• **Advice**: Keep GPA ≥3.40 while dedicating 8–10 hrs/week to building your AI portfolio.`;
    }

    return `### 🎓 Academic Performance & Semester ${semester} Overview

• **Current CGPA**: **${currentGPA} / 4.00** *(Strong standing for tech & graduate admissions)*
• **Completed Credits**: **${user.creditsCompleted || 78} / ${user.totalCredits || 132}**
• **Core Subjects Recommended for AI Path**:
  1. *Design & Analysis of Algorithms* (Mastering Dynamic Programming & Graph Search)
  2. *Artificial Intelligence & Deep Learning*
  3. *Database Systems & Distributed Storage*
  4. *Linear Algebra & Multivariate Calculus*

*Recommendation: Maintain your GPA above 3.40 while allocating 10–12 hours weekly to building your AI flagship portfolio.*`;
  }

  if (q.includes('interview') || q.includes('resume') || q.includes('leetcode') || q.includes('coding')) {
    if (isConcise) {
      return `### 🎯 Technical Interview Prep
• **Coding**: Solve Top 75 LeetCode patterns (Trees, Graphs, DP)
• **ML Design**: RAG architectures & model latency tradeoffs
• **Portfolio**: Prepare STAR stories on your flagship projects`;
    }

    return `### 🎯 Technical Interview Prep Roadmap for ${careerGoal}

1. **Coding & Data Structures (40%)**:
   • Master Top 75 LeetCode patterns (Arrays, Two Pointers, Trees, Graphs, BFS/DFS, Heaps).
   • Practice implementing ML algorithms from scratch in NumPy (Linear Regression, KNN, Self-Attention).

2. **ML Systems Design (30%)**:
   • Study RAG architectures, feature stores, caching mechanisms, and model latency vs accuracy trade-offs.

3. **Behavioral & Portfolio (30%)**:
   • Prepare STAR-method stories around your CampusOS projects and handling technical bottlenecks.`;
  }

  if (isConcise) {
    return `### 🎯 Recommendations for ${studentName}
• Maintain your **${currentGPA} GPA** and deploy 1 flagship AI project.
• Focus on MLOps & portfolio projects to boost readiness from **${readinessScore}%** to 85%+.`;
  }

  return `### 🎯 Recommendations for ${studentName}

• **Semester ${semester} Priority**: Maintain your strong academic standing (${currentGPA} GPA) and deploy 1 production-grade AI system.
• **GitHub Strategy**: Ensure your repositories have comprehensive READMEs, architectural diagrams, Dockerfiles, and API documentation.
• **Career Milestone**: Your current readiness is **${readinessScore}%**. Focus on MLOps and internship applications to reach **85%+**.

*What specific area would you like to dive into next?*`;
}
