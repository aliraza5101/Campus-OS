import { query } from '../db/pg';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

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

export interface GeneratedActionItem {
  number: string;
  title: string;
  category: 'Project' | 'Skill' | 'Career' | 'Academic' | 'Research';
  priority: 'High' | 'Medium' | 'Low';
  estimatedTime: string;
  actionType: string;
  status: 'pending';
  source: 'ai';
}

// Track Knowledge Base for intelligent fallback recommendations
const TRACK_KNOWLEDGE_BASE: Record<
  string,
  {
    coreSkills: string[];
    flagshipProjectIdea: string;
    certOrMilestone: string;
  }
> = {
  ai: {
    coreSkills: ['PyTorch', 'FastAPI', 'Docker', 'LangChain', 'Computer Vision', 'MLOps', 'Transformers'],
    flagshipProjectIdea: 'Build & deploy an End-to-End RAG or Vision Pipeline with live API and Docker container',
    certOrMilestone: 'Complete Deep Learning Specialization or Deploy a model to HuggingFace / AWS SageMaker',
  },
  fullstack: {
    coreSkills: ['Next.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'GraphQL', 'Prisma / Drizzle'],
    flagshipProjectIdea: 'Architect and deploy a multi-tenant SaaS application with real-time sync and Stripe payments',
    certOrMilestone: 'Deploy production application to Vercel/Railway with automated CI/CD GitHub Actions',
  },
  cloud: {
    coreSkills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD Pipelines', 'Linux', 'Prometheus'],
    flagshipProjectIdea: 'Provision a production Kubernetes cluster with automated GitOps deployment & Prometheus metrics',
    certOrMilestone: 'Achieve AWS Certified Solutions Architect Associate or CKA (Certified Kubernetes Administrator)',
  },
  cybersecurity: {
    coreSkills: ['Network Security', 'OWASP Top 10', 'Penetration Testing', 'Linux Hardening', 'Cryptography', 'SIEM'],
    flagshipProjectIdea: 'Set up an automated vulnerability scanner & penetration testing lab with comprehensive incident reporting',
    certOrMilestone: 'CompTIA Security+ / CEH preparation and active participation in TryHackMe / HackTheBox',
  },
  data: {
    coreSkills: ['Python', 'SQL', 'Pandas', 'Power BI / Tableau', 'Scikit-learn', 'Data Warehousing', 'Apache Spark'],
    flagshipProjectIdea: 'Construct an automated ETL pipeline with a public interactive Streamlit analytics dashboard',
    certOrMilestone: 'Complete Advanced SQL & Data Engineering track with verifiable portfolio case studies',
  },
  mobile: {
    coreSkills: ['React Native', 'Flutter', 'TypeScript', 'Mobile UX', 'SQLite', 'Firebase', 'State Management'],
    flagshipProjectIdea: 'Publish a cross-platform mobile application to App Store or Google Play test track',
    certOrMilestone: 'Implement offline-first architecture with biometric authentication and push notifications',
  },
  general: {
    coreSkills: ['Data Structures & Algorithms', 'System Design', 'Git & GitHub', 'REST APIs', 'PostgreSQL', 'Docker'],
    flagshipProjectIdea: 'Develop a high-performance backend microservice with Redis caching and complete test coverage',
    certOrMilestone: 'Solve 150+ LeetCode DSA patterns and publish verified open-source repository contributions',
  },
};

function detectTrackKey(goal: string, degree: string): string {
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
  if (combined.includes('mobile') || combined.includes('android') || combined.includes('ios') || combined.includes('flutter')) {
    return 'mobile';
  }
  if (combined.includes('full stack') || combined.includes('web') || combined.includes('frontend') || combined.includes('backend') || combined.includes('software')) {
    return 'fullstack';
  }
  return 'general';
}

/**
 * Generate authentic, customized next steps by querying AI models (Groq/Grok/Gemini)
 * or applying the deterministic expert academic engine.
 */
export async function generateAuthenticRecommendations(studentContext: {
  name: string;
  degree: string;
  semester: number;
  gpa: number;
  careerGoal: string;
  university: string;
  skills: Array<{ name: string; level?: string; percentage?: number }>;
  projects: Array<{ title: string; category?: string; status?: string }>;
  experiences: Array<{ title: string; company?: string }>;
}): Promise<GeneratedActionItem[]> {
  const { name, degree, semester, gpa, careerGoal, university, skills, projects, experiences } = studentContext;

  const currentSkillsList = skills.map((s) => s.name).join(', ') || 'General fundamentals';
  const currentProjectsList = projects.map((p) => `${p.title} (${p.status || 'In Progress'})`).join(', ') || 'None yet';

  // 1. Attempt AI Generation via multi-provider
  const systemPrompt = `You are the Campus OS Elite Academic & Career AI Recommendation Engine.
Based on the student's exact university degree, semester, cumulative GPA, current skills, projects, and target career goal, generate 3 or 4 authentic, highly personalized, actionable next steps.
Every step must be realistic, highly relevant to their career trajectory, and immediately beneficial.

Return ONLY a JSON array of 3 or 4 objects:
[
  {
    "number": "01",
    "title": "Action title (concrete, specific to their stack & goal)",
    "category": "Project" | "Skill" | "Career" | "Academic" | "Research",
    "priority": "High" | "Medium" | "Low",
    "estimatedTime": "e.g. 2 weeks",
    "actionType": "Build Project" | "Skill Milestone" | "Apply Opportunity" | "Research Paper" | "Academic Recovery"
  }
]`;

  const userPrompt = `Student Profile:
- Name: ${name}
- Degree: ${degree} at ${university}
- Current Academic Standing: Semester ${semester} of 8, CGPA: ${gpa.toFixed(2)}
- Target Career Goal: ${careerGoal}
- Existing Skills: ${currentSkillsList}
- Existing Projects: ${currentProjectsList}
- Work / Internship Experience Count: ${experiences.length}

Generate 3-4 tailored next steps. Include at least 1 Project or Flagship build, 1 Skill gap milestone, and 1 Career/Internship/Academic action appropriate for Semester ${semester}.`;

  // Try Groq
  const rawGroq = (process.env.GROQ_API_KEY || '').trim();
  if (isValidApiKey(rawGroq)) {
    try {
      const groq = new Groq({ apiKey: rawGroq, timeout: 10000 });
      const completion = await groq.chat.completions.create({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: `${systemPrompt} Output ONLY valid JSON array.` },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      });
      const text = completion.choices[0]?.message?.content || '[]';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed.slice(0, 4).map((item: any, idx: number) => ({
          number: item.number || `0${idx + 1}`,
          title: item.title,
          category: item.category || (idx === 0 ? 'Project' : idx === 1 ? 'Skill' : 'Career'),
          priority: item.priority || (idx === 0 ? 'High' : 'Medium'),
          estimatedTime: item.estimatedTime || '2 weeks',
          actionType: item.actionType || 'Action Step',
          status: 'pending' as const,
          source: 'ai' as const,
        }));
      }
    } catch (e) {
      console.warn('Groq recommendation error, trying fallback engine:', e);
    }
  }

  // 2. Deterministic Expert Rules Engine
  const trackKey = detectTrackKey(careerGoal, degree);
  const trackInfo = TRACK_KNOWLEDGE_BASE[trackKey] || TRACK_KNOWLEDGE_BASE.general;

  // Identify missing skills
  const studentSkillNames = new Set(skills.map((s) => s.name.toLowerCase().trim()));
  const missingTrackSkills = trackInfo.coreSkills.filter((s) => !studentSkillNames.has(s.toLowerCase().trim()));
  const priorityMissingSkill = missingTrackSkills[0] || trackInfo.coreSkills[0];

  const actions: GeneratedActionItem[] = [];

  // Step 01: Project Milestone tailored to career goal & track
  const hasCompletedProject = projects.some((p) => p.status === 'Completed');
  actions.push({
    number: '01',
    title: hasCompletedProject
      ? `${trackInfo.flagshipProjectIdea} with live CI/CD pipeline`
      : `Build and deploy flagship ${careerGoal.split('/')[0].trim()} repository with live demonstration`,
    category: 'Project',
    priority: 'High',
    estimatedTime: semester <= 3 ? '3 weeks' : '2 weeks',
    actionType: 'Build Project',
    status: 'pending',
    source: 'ai',
  });

  // Step 02: Critical Skill Gap Milestone
  actions.push({
    number: '02',
    title: `Master ${priorityMissingSkill} and complete verified practical implementation for ${careerGoal}`,
    category: 'Skill',
    priority: 'High',
    estimatedTime: '10 days',
    actionType: 'Skill Milestone',
    status: 'pending',
    source: 'ai',
  });

  // Step 03: Semester & Career Stage Action
  if (semester <= 3) {
    actions.push({
      number: '03',
      title: 'Establish foundational Data Structures & Algorithms problem-solving routine (Target 50+ problems)',
      category: 'Academic',
      priority: 'Medium',
      estimatedTime: '4 weeks',
      actionType: 'Skill Milestone',
      status: 'pending',
      source: 'ai',
    });
  } else if (semester <= 5) {
    actions.push({
      number: '03',
      title: `Prepare verified technical resume & portfolio to apply for Summer 2026 ${careerGoal} internships`,
      category: 'Career',
      priority: 'High',
      estimatedTime: '2 weeks',
      actionType: 'Apply Opportunity',
      status: 'pending',
      source: 'ai',
    });
  } else {
    actions.push({
      number: '03',
      title: `Finalize Final Year Project (FYP) architecture & target graduate ${careerGoal} engineering openings`,
      category: 'Career',
      priority: 'High',
      estimatedTime: '3 weeks',
      actionType: 'Apply Opportunity',
      status: 'pending',
      source: 'ai',
    });
  }

  // Step 04: Academic / Honors / Recovery context
  if (gpa < 3.0) {
    actions.push({
      number: '04',
      title: `Schedule academic recovery session with department advisor to elevate Semester ${semester} term GPA above 3.20`,
      category: 'Academic',
      priority: 'High',
      estimatedTime: '1 week',
      actionType: 'Academic Recovery',
      status: 'pending',
      source: 'ai',
    });
  } else if (gpa >= 3.5) {
    actions.push({
      number: '04',
      title: `Collaborate with university faculty on departmental research paper or apply for Undergraduate Teaching Assistantship`,
      category: 'Research',
      priority: 'Medium',
      estimatedTime: '3 weeks',
      actionType: 'Research Paper',
      status: 'pending',
      source: 'ai',
    });
  } else {
    actions.push({
      number: '04',
      title: trackInfo.certOrMilestone,
      category: 'Skill',
      priority: 'Medium',
      estimatedTime: '2 weeks',
      actionType: 'Skill Milestone',
      status: 'pending',
      source: 'ai',
    });
  }

  return actions;
}

/**
 * Generate and save authentic next steps directly to the roadmap_tasks table in database
 */
export async function generateAndSaveNextSteps(
  studentId: string,
  providedSteps?: any[]
): Promise<any[]> {
  try {
    let finalSteps: GeneratedActionItem[] = [];

    if (Array.isArray(providedSteps) && providedSteps.length > 0) {
      finalSteps = providedSteps.map((s, idx) => ({
        number: s.number || `0${idx + 1}`,
        title: s.title,
        category: s.category || 'Project',
        priority: s.priority || 'High',
        estimatedTime: s.estimatedTime || s.estimated_time || '2 weeks',
        actionType: s.actionType || s.action_type || 'Action',
        status: 'pending' as const,
        source: 'ai' as const,
      }));
    } else {
      // Query real student profile, skills, projects from DB
      const [profRes, skillsRes, projRes, expRes] = await Promise.all([
        query(`SELECT * FROM student_profiles WHERE id = $1`, [studentId]),
        query(`SELECT name, level, percentage FROM skills WHERE student_id = $1`, [studentId]),
        query(`SELECT title, category, status FROM projects WHERE student_id = $1`, [studentId]),
        query(`SELECT title, company FROM experiences WHERE student_id = $1`, [studentId]),
      ]);

      const prof = profRes.rows[0];
      if (!prof) return [];

      finalSteps = await generateAuthenticRecommendations({
        name: prof.name || 'Student',
        degree: prof.degree || 'Computer Science',
        semester: Number(prof.semester) || 1,
        gpa: parseFloat(prof.gpa) || 3.5,
        careerGoal: prof.career_goal || 'Software Engineer',
        university: prof.university || 'University',
        skills: skillsRes.rows || [],
        projects: projRes.rows || [],
        experiences: expRes.rows || [],
      });
    }

    if (finalSteps.length === 0) return [];

    // Delete any old pending/skipped AI generated roadmap tasks so we do not clutter
    await query(
      `DELETE FROM roadmap_tasks WHERE student_id = $1 AND (status = 'pending' OR status = 'skipped')`,
      [studentId]
    ).catch(() => {});

    const insertedRows: any[] = [];
    for (const step of finalSteps) {
      const res = await query(
        `INSERT INTO roadmap_tasks (student_id, number, title, category, priority, estimated_time, action_type, status, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          studentId,
          step.number,
          step.title,
          step.category,
          step.priority,
          step.estimatedTime,
          step.actionType,
          step.status,
          step.source,
        ]
      );
      if (res.rows[0]) insertedRows.push(res.rows[0]);
    }

    return insertedRows.map((r: any) => ({
      id: r.id,
      number: r.number,
      title: r.title,
      category: r.category,
      priority: r.priority,
      estimatedTime: r.estimated_time,
      actionType: r.action_type,
      status: r.status,
      source: r.source,
    }));
  } catch (error) {
    console.error('generateAndSaveNextSteps error:', error);
    return [];
  }
}
