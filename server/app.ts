import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import OpenAI from 'openai';

import authRoutes from './routes/auth';
import studentRoutes from './routes/student';
import adminRoutes from './routes/admin';
import opportunitiesRoutes from './routes/opportunities';
import announcementsRoutes from './routes/announcements';
import notificationsRoutes from './routes/notifications';
import reportsRoutes from './routes/reports';
import uploadRoutes from './routes/upload';
import aiRoutes from './routes/ai';
import { query } from './db/pg';
import { requireAuth, optionalAuth } from './middleware/auth';

dotenv.config();

// =========================================================
// Environment Validation
// =========================================================
const REQUIRED_ENV_VARS = ['DATABASE_URL', 'JWT_SECRET'];
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Warning: Required environment variable ${envVar} is not set.`);
  }
}

if (
  process.env.JWT_SECRET === 'campus_os_fallback_jwt_secret_key_2025' ||
  process.env.JWT_SECRET === 'campus_os_jwt_super_secret_key_2025_prod'
) {
  console.warn('⚠️  WARNING: JWT_SECRET appears to be a default/predictable value. Use a strong random secret in production.');
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// URL normalization for serverless environments (e.g. Vercel rewrites)
app.use((req, _res, next) => {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  next();
});

// Mount Modular API Routes backed by Supabase / Postgres
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

// =========================================================
// API Key Validation Helper
// =========================================================
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUuid(val: unknown): val is string {
  return typeof val === 'string' && UUID_REGEX.test(val);
}

// =========================================================
// AI Provider Clients (Lazy Initialization)
// =========================================================
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const rawKey = process.env.GEMINI_API_KEY;
    if (!isValidApiKey(rawKey)) {
      throw new Error('Valid GEMINI_API_KEY is not configured');
    }
    aiClient = new GoogleGenAI({
      apiKey: rawKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  }
  return aiClient;
}

let groqClient: Groq | null = null;
function getGroqClient(customKey?: string): Groq {
  const apiKey = customKey || (isValidApiKey(process.env.GROQ_API_KEY) ? process.env.GROQ_API_KEY : '');
  if (!apiKey) {
    throw new Error('Valid GROQ_API_KEY is not configured');
  }
  if (!groqClient || customKey) {
    const client = new Groq({ apiKey, timeout: 15000 });
    if (!customKey) groqClient = client;
    return client;
  }
  return groqClient;
}

let xaiGrokClient: OpenAI | null = null;
function getGrokClient(customKey?: string): OpenAI {
  const apiKey =
    customKey ||
    (isValidApiKey(process.env.GROK_API_KEY) ? process.env.GROK_API_KEY : '') ||
    (isValidApiKey(process.env.XAI_API_KEY) ? process.env.XAI_API_KEY : '');
  if (!apiKey) {
    throw new Error('Valid GROK_API_KEY or XAI_API_KEY is not configured');
  }
  if (!xaiGrokClient || customKey) {
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
      timeout: 15000,
    });
    if (!customKey) xaiGrokClient = client;
    return client;
  }
  return xaiGrokClient;
}

// Active models for Groq in tested order of priority
const GROQ_CANDIDATE_MODELS = [
  'qwen/qwen3.8-27b',
  'groq/compound-mini',
  'groq/compound',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
];

// Key format detector & provider resolver
function resolveAIProvider(): {
  provider: 'groq' | 'grok' | 'gemini' | 'none';
  key: string;
  name: string;
} {
  const rawGroq = (process.env.GROQ_API_KEY || '').trim();
  const rawGrok = (process.env.GROK_API_KEY || process.env.XAI_API_KEY || '').trim();
  const rawGemini = (process.env.GEMINI_API_KEY || '').trim();

  const groqKey = isValidApiKey(rawGroq) ? rawGroq : '';
  const grokKey = isValidApiKey(rawGrok) ? rawGrok : '';
  const geminiKey = isValidApiKey(rawGemini) ? rawGemini : '';

  if (groqKey && !groqKey.startsWith('xai-')) {
    return { provider: 'groq', key: groqKey, name: 'Groq (LPU Engine)' };
  }
  if (grokKey && grokKey.startsWith('gsk_')) {
    return { provider: 'groq', key: grokKey, name: 'Groq (LPU Engine)' };
  }
  if (grokKey && !grokKey.startsWith('gsk_')) {
    return { provider: 'grok', key: grokKey, name: 'Grok AI (xAI)' };
  }
  if (groqKey && groqKey.startsWith('xai-')) {
    return { provider: 'grok', key: grokKey, name: 'Grok AI (xAI)' };
  }
  if (geminiKey) {
    return { provider: 'gemini', key: geminiKey, name: 'Google Gemini' };
  }
  return { provider: 'none', key: '', name: 'No API Key' };
}

// =========================================================
// Health & Status Endpoints
// =========================================================
app.get('/api/health', (_req, res) => {
  const resolved = resolveAIProvider();
  res.json({
    status: 'ok',
    activeProvider: resolved.provider,
    primaryProvider: resolved.name,
    hasGrokKey: isValidApiKey(process.env.GROK_API_KEY) || isValidApiKey(process.env.XAI_API_KEY),
    hasGroqKey: isValidApiKey(process.env.GROQ_API_KEY),
    hasGeminiKey: isValidApiKey(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/mentor/status', (_req, res) => {
  const resolved = resolveAIProvider();
  res.json({
    activeProvider: resolved.provider,
    providerName: resolved.name,
    model:
      resolved.provider === 'grok'
        ? 'grok-2-latest'
        : resolved.provider === 'groq'
        ? 'qwen/qwen3.8-27b'
        : 'gemini-3.7-flash',
    hasGrokKey: isValidApiKey(process.env.GROK_API_KEY) || isValidApiKey(process.env.XAI_API_KEY),
    hasGroqKey: isValidApiKey(process.env.GROQ_API_KEY),
    hasGeminiKey: isValidApiKey(process.env.GEMINI_API_KEY),
    isReady: resolved.provider !== 'none',
  });
});

// =========================================================
// AI Context Builder — Fetches REAL student data from DB
// =========================================================
async function buildStudentContextFromDB(userId: string) {
  try {
    const [profileRes, skillsRes, projectsRes, experiencesRes, certsRes, semestersRes, activitiesRes, tasksRes] = await Promise.all([
      query('SELECT * FROM student_profiles WHERE id = $1', [userId]),
      query('SELECT name, level, percentage, category FROM skills WHERE student_id = $1 ORDER BY percentage DESC LIMIT 15', [userId]),
      query('SELECT title, category, status, progress, tech_stack, github_url FROM projects WHERE student_id = $1 ORDER BY created_at DESC LIMIT 8', [userId]),
      query('SELECT title, company, employment_type, period FROM experiences WHERE student_id = $1 ORDER BY created_at DESC LIMIT 6', [userId]),
      query('SELECT title, organization, date FROM certifications WHERE student_id = $1 ORDER BY created_at DESC LIMIT 6', [userId]),
      query('SELECT semester, status, gpa FROM semester_details WHERE student_id = $1 ORDER BY semester ASC', [userId]),
      query('SELECT title, target, type, created_at FROM student_activities WHERE student_id = $1 ORDER BY created_at DESC LIMIT 6', [userId]),
      query('SELECT title, category, status, priority FROM roadmap_tasks WHERE student_id = $1 ORDER BY created_at ASC', [userId]),
    ]);

    const p = profileRes.rows[0];
    if (!p) return null;

    return {
      name: p.name || 'Student',
      degree: p.degree || 'Undeclared',
      semester: Number(p.semester) || 1,
      university: p.university || 'University',
      careerGoal: p.career_goal || 'Undeclared',
      gpa: Number(p.gpa) || 0,
      creditsCompleted: p.credits_completed || 0,
      totalCredits: p.total_credits || 0,
      academicStanding: p.academic_standing || 'N/A',
      careerReadiness: p.career_readiness || 0,
      skills: skillsRes.rows.map((s: any) => `${s.name} (${s.level})`),
      projects: projectsRes.rows.map((pr: any) => `${pr.title} [${pr.category}] - ${pr.status}`),
      experiences: experiencesRes.rows.map((e: any) => `${e.title} at ${e.company} (${e.employment_type})`),
      certifications: certsRes.rows.map((c: any) => `${c.title} - ${c.organization}`),
      recentActivities: activitiesRes.rows.map((a: any) => `${a.title}: ${a.target}`),
      completedMilestones: tasksRes.rows.filter((t: any) => t.status === 'completed').map((t: any) => t.title),
      pendingMilestones: tasksRes.rows.filter((t: any) => t.status !== 'completed').map((t: any) => `${t.title} (${t.priority} Priority)`),
      semesterHistory: semestersRes.rows.map((s: any) => `Sem ${s.semester}: ${s.status} (GPA: ${s.gpa || 'N/A'})`),
    };
  } catch (err) {
    console.error('Error building student context from DB:', err);
    return null;
  }
}

// =========================================================
// AI Prompt Builders
// =========================================================
function buildPromptAndContents(studentCtx: any, reqBody: any) {
  const { message, query: q, messages, history, studentContext: bodyCtx } = reqBody;
  const userPrompt = message || q || (messages && messages[messages.length - 1]?.content) || '';

  const studentName = studentCtx?.name || bodyCtx?.name || 'Student';
  const careerGoal = studentCtx?.careerGoal || bodyCtx?.careerGoal || 'Undeclared';
  const degree = studentCtx?.degree || bodyCtx?.degree || 'Undeclared';
  const university = studentCtx?.university || bodyCtx?.university || 'University';
  const semester = studentCtx?.semester || bodyCtx?.semester || 1;
  const gpa = studentCtx?.gpa ? (typeof studentCtx.gpa === 'number' ? studentCtx.gpa.toFixed(2) : studentCtx.gpa) : (bodyCtx?.gpa || 'N/A');
  const credits = `${studentCtx?.creditsCompleted ?? bodyCtx?.creditsCompleted ?? 0} / ${studentCtx?.totalCredits ?? bodyCtx?.totalCredits ?? 0}`;
  const readiness = studentCtx?.careerReadiness ?? bodyCtx?.careerReadiness ?? 0;

  const rawSkills = (Array.isArray(studentCtx?.skills) && studentCtx.skills.length > 0)
    ? studentCtx.skills
    : (Array.isArray(bodyCtx?.skills) && bodyCtx.skills.length > 0)
    ? bodyCtx.skills
    : [];
  const skillsList = rawSkills.length > 0 ? rawSkills.join(', ') : 'No skills recorded yet';

  const rawProjects = (Array.isArray(studentCtx?.projects) && studentCtx.projects.length > 0)
    ? studentCtx.projects
    : (Array.isArray(bodyCtx?.projects) && bodyCtx.projects.length > 0)
    ? bodyCtx.projects
    : [];
  const projectsList = rawProjects.length > 0 ? rawProjects.map((p: string) => `• ${p}`).join('\n') : '• No projects recorded yet';

  const rawExp = (Array.isArray(studentCtx?.experiences) && studentCtx.experiences.length > 0)
    ? studentCtx.experiences
    : (Array.isArray(bodyCtx?.experiences) && bodyCtx.experiences.length > 0)
    ? bodyCtx.experiences
    : [];
  const experiencesList = rawExp.length > 0 ? rawExp.map((e: string) => `• ${e}`).join('\n') : '• No experience recorded yet';

  const rawCerts = (Array.isArray(studentCtx?.certifications) && studentCtx.certifications.length > 0)
    ? studentCtx.certifications
    : (Array.isArray(bodyCtx?.certifications) && bodyCtx.certifications.length > 0)
    ? bodyCtx.certifications
    : [];
  const certsList = rawCerts.length > 0 ? rawCerts.map((c: string) => `• ${c}`).join('\n') : '• None recorded yet';

  const rawActivities = (Array.isArray(studentCtx?.recentActivities) && studentCtx.recentActivities.length > 0)
    ? studentCtx.recentActivities
    : (Array.isArray(bodyCtx?.recentActivities) && bodyCtx.recentActivities.length > 0)
    ? bodyCtx.recentActivities
    : [];
  const activitiesList = rawActivities.length > 0 ? rawActivities.slice(0, 5).map((a: string) => `• ${a}`).join('\n') : '• Just started session';

  const rawCompleted = (Array.isArray(studentCtx?.completedMilestones) && studentCtx.completedMilestones.length > 0)
    ? studentCtx.completedMilestones
    : (Array.isArray(bodyCtx?.completedMilestones) && bodyCtx.completedMilestones.length > 0)
    ? bodyCtx.completedMilestones
    : [];
  const completedList = rawCompleted.length > 0 ? rawCompleted.map((m: string) => `• ${m}`).join('\n') : '• Working on first milestone';

  const isConcise = Boolean(reqBody.isConcise || reqBody.isMiniCard);

  const systemInstruction = `You are "Campus GPT", the warm, friendly, supportive, and exceptionally intelligent AI Academic & Career Mentor inside CampusOS.

ZERO-TO-HERO MENTORING PHILOSOPHY:
- You have 100% REAL-TIME LIVE AWARENESS of this student's actions, added skills, verified projects, certificates, and achievements.
- When the student adds projects, skills, or certifications, warmly praise and celebrate their proactive initiative!
- Your mission is to coach the student step-by-step from their current stage to elite industry excellence ("Zero to Hero") for their dream role: ${careerGoal}.
- If they ask what to do next or how to improve their readiness (currently ${readiness}%), give them specific, actionable project ideas and next skill milestones tailored to their current stack.

CRITICAL CONVERSATION & PERSONALITY RULES:
1. **WARM & FRIENDLY TONE**:
   - Talk like an inspiring, approachable senior mentor and supportive peer who genuinely wants the student to win.
   - Use natural phrasing (e.g., "Hey ${studentName}! 👋", "That's fantastic progress! 🚀", "Here is your Zero-to-Hero game plan:").
   - Add friendly emojis naturally (e.g. 💡, 🚀, 🎯, ✨, 📚, 😊).

2. **CLEAN & BEAUTIFUL FORMATTING**:
   - Structure responses cleanly using Markdown:
     - Use **bold text** for important skills, frameworks, and milestones.
     - Use neat bullet points (•) or numbered steps for actionable advice.
     - Keep paragraphs short and comfortable to read (2-3 sentences max).
     - If sharing code, commands, or technical syntax, use proper code blocks with language tags.

3. **USER-FRIENDLY & CONCISE**:
   - Direct, high-value advice without robotic filler or repetitive disclaimers.
   - For simple greetings ("hi", "hello", "hey", "salam"): Respond with a warm, cheerful 1-2 sentence greeting (e.g., "Hey ${studentName}! 👋 Great to see you! How's your semester going, and what are we building today? 😊").

4. **NO ROBOTIC BOILERPLATE**:
   - Never say "As an AI..." or give dry robotic disclaimers. Speak directly and authentically as Campus GPT.

STUDENT LIVE PASSPORT & PORTFOLIO:
- Name: ${studentName}
- Target Career Role: ${careerGoal} (Readiness Index: ${readiness}%)
- Degree: ${degree} (Semester ${semester}, CGPA ${gpa})
- University: ${university} | Credits: ${credits}
- Current Skills: ${skillsList}
- Verified Projects:
${projectsList}
- Professional Experience:
${experiencesList}
- Earned Certifications:
${certsList}
- Completed Milestones:
${completedList}
- Latest Live Activities:
${activitiesList}` + (isConcise ? `\n\nCRITICAL CONSTRAINTS FOR DASHBOARD MINI-CARD:
- The user is viewing this in a compact dashboard widget.
- Keep the response warm, encouraging, friendly, and CONCISE (2-3 short sentences or 2 neat bullets).
- Use clean Markdown with bold highlights and 1-2 friendly emojis.
- If the user greets you, respond with 1 cheerful, friendly sentence!` : '');

  // Prepare contents history for chat
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  const rawHistory = history || messages;
  if (Array.isArray(rawHistory) && rawHistory.length > 0) {
    const recent = rawHistory.slice(-6);
    for (const msg of recent) {
      const textContent = msg.text || msg.content;
      const role = (msg.sender === 'user' || msg.role === 'user') ? 'user' : 'model';
      if (textContent) {
        contents.push({ role, parts: [{ text: textContent }] });
      }
    }
  }

  if (contents.length === 0 || contents[contents.length - 1].role !== 'user' || contents[contents.length - 1].parts[0].text !== userPrompt) {
    contents.push({ role: 'user', parts: [{ text: userPrompt }] });
  }

  return { userPrompt, studentName, semester, careerGoal, systemInstruction, contents };
}

function buildGroqMessages(studentCtx: any, body: any) {
  const { userPrompt, studentName, semester, careerGoal, systemInstruction } = buildPromptAndContents(studentCtx, body);
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemInstruction },
  ];

  const rawHistory = body.messages || body.history;
  if (Array.isArray(rawHistory) && rawHistory.length > 0) {
    const recent = rawHistory.slice(-6);
    for (const msg of recent) {
      const text = msg.text || msg.content;
      if (text) {
        messages.push({
          role: (msg.sender === 'user' || msg.role === 'user') ? 'user' : 'assistant',
          content: text,
        });
      }
    }
  }

  if (messages.length === 1 || messages[messages.length - 1].role !== 'user' || messages[messages.length - 1].content !== userPrompt) {
    messages.push({ role: 'user', content: userPrompt });
  }

  return { messages, studentName, semester, careerGoal, userPrompt };
}

// Smart fallback for academic mentorship if all AI providers fail
function generateAcademicMentorFallback(studentCtx: any, body: any): string {
  const name = studentCtx?.name || 'Student';
  const semester = studentCtx?.semester || 1;
  const career = studentCtx?.careerGoal || 'your target career';
  const queryText = (body.message || body.userPrompt || '').toLowerCase().trim();
  const concise = Boolean(body.isConcise || body.isMiniCard);

  if (/^(hi|hello|hey|salam|assalam|aoa|greetings|good\s*(morning|afternoon|evening)|howdy|sup|hola)\b/i.test(queryText)) {
    return `Hello **${name}**! 👋 How can I help you today?`;
  }

  if (concise) {
    return `### 🎯 Ready to Help\nHello ${name}! I'm your Campus GPT mentor. Ask me about courses, skills, projects, or career guidance for **${career}**.`;
  }

  return `### Campus GPT Mentorship for ${name}\n\nHello ${name}! As a Semester ${semester} student targeting **${career}**, I'm here to help with:\n\n1. **Academic Planning**: Course selection, GPA optimization\n2. **Skills Development**: Technical stack recommendations\n3. **Career Guidance**: Internship preparation, interview tips\n4. **Project Ideas**: Portfolio-building suggestions\n\nFeel free to ask about anything!`;
}

// =========================================================
// AI Streaming Helpers
// =========================================================
async function executeGroqStream(groq: Groq, messages: any[], res: any, maxTokens: number = 650): Promise<boolean> {
  for (const model of GROQ_CANDIDATE_MODELS) {
    try {
      const stream = await groq.chat.completions.create({ model, messages, temperature: 0.6, max_tokens: maxTokens, stream: true });
      let hasSentChunk = false;
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) { hasSentChunk = true; res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`); }
      }
      if (hasSentChunk) { res.write(`data: ${JSON.stringify({ done: true, modelUsed: `Groq (${model})` })}\n\n`); return true; }
    } catch (err: any) { console.warn(`Groq stream with model ${model} failed:`, err?.message || err); continue; }
  }
  return false;
}

async function executeGroqCompletion(groq: Groq, messages: any[], maxTokens: number = 650): Promise<{ text: string; modelUsed: string } | null> {
  for (const model of GROQ_CANDIDATE_MODELS) {
    try {
      const completion = await groq.chat.completions.create({ model, messages, temperature: 0.6, max_tokens: maxTokens });
      const replyText = completion.choices[0]?.message?.content;
      if (replyText) { return { text: replyText, modelUsed: `Groq (${model})` }; }
    } catch (err: any) { console.warn(`Groq completion with model ${model} failed:`, err?.message || err); continue; }
  }
  return null;
}

async function executeGrokStream(grok: OpenAI, messages: any[], preferredModel: string, res: any): Promise<boolean> {
  const models = [preferredModel, 'grok-2-latest', 'grok-beta'];
  for (const model of models) {
    try {
      const stream = await grok.chat.completions.create({ model, messages, temperature: 0.6, max_tokens: 1024, stream: true });
      let hasSentChunk = false;
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) { hasSentChunk = true; res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`); }
      }
      if (hasSentChunk) { res.write(`data: ${JSON.stringify({ done: true, modelUsed: `Grok (${model})` })}\n\n`); return true; }
    } catch (err: any) { console.warn(`Grok stream with model ${model} failed:`, err?.message || err); continue; }
  }
  return false;
}

async function executeGrokCompletion(grok: OpenAI, messages: any[], preferredModel: string): Promise<{ text: string; modelUsed: string } | null> {
  const models = [preferredModel, 'grok-2-latest', 'grok-beta'];
  for (const model of models) {
    try {
      const completion = await grok.chat.completions.create({ model, messages, temperature: 0.6, max_tokens: 1024 });
      const replyText = completion.choices[0]?.message?.content;
      if (replyText) { return { text: replyText, modelUsed: `Grok (${model})` }; }
    } catch (err: any) { console.warn(`Grok completion with model ${model} failed:`, err?.message || err); continue; }
  }
  return null;
}

// =========================================================
// Chat Sessions — Database-Backed (Persistent)
// =========================================================

// GET chat sessions for authenticated user
app.get('/api/chat/sessions', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || (typeof req.query.userId === 'string' ? req.query.userId : null);
    if (!userId) {
      return res.json({ success: true, sessions: [] });
    }
    const dbSessions = await query(
      `SELECT s.id, s.title, s.updated_at 
       FROM chat_sessions s 
       WHERE s.student_id = $1 
         AND EXISTS (SELECT 1 FROM chat_messages m WHERE m.session_id = s.id)
       ORDER BY s.updated_at DESC`,
      [userId]
    );

    const fullSessions = await Promise.all(
      dbSessions.rows.map(async (s: any) => {
        const msgs = await query(
          `SELECT id, 
                  (CASE WHEN role IN ('assistant', 'model', 'bot') THEN 'ai' ELSE 'user' END) as sender, 
                  role, 
                  content as text, 
                  created_at as timestamp 
           FROM chat_messages 
           WHERE session_id = $1 
           ORDER BY created_at ASC`,
          [s.id]
        );
        return {
          id: s.id,
          title: s.title,
          preview: msgs.rows[msgs.rows.length - 1]?.text?.substring(0, 50) || 'New Conversation',
          updatedAt: new Date(s.updated_at).toLocaleDateString(),
          timestamp: new Date(s.updated_at).getTime(),
          messages: msgs.rows,
        };
      })
    );

    return res.json({ success: true, sessions: fullSessions });
  } catch (error: any) {
    console.error('Chat sessions fetch error:', error);
    return res.json({ success: true, sessions: [] });
  }
});

// CREATE a new chat session
app.post('/api/chat/sessions', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { title = 'New Conversation', messages: initialMessages, sessionId } = req.body;

    // If no initial messages provided, return client-side placeholder without creating ghost DB row
    if (!initialMessages || !Array.isArray(initialMessages) || initialMessages.length === 0) {
      return res.json({
        success: true,
        session: {
          id: sessionId || `session-${Date.now()}`,
          title,
          preview: 'New Conversation',
          updatedAt: 'Just now',
          timestamp: Date.now(),
          messages: [],
        },
      });
    }

    if (!userId) {
      return res.json({
        success: true,
        session: {
          id: sessionId || `session-${Date.now()}`,
          title,
          preview: 'New Conversation',
          updatedAt: 'Just now',
          timestamp: Date.now(),
          messages: initialMessages,
        },
      });
    }

    const sessionRes = await query(
      `INSERT INTO chat_sessions (student_id, title) VALUES ($1, $2) RETURNING id, title, created_at, updated_at`,
      [userId, title]
    );
    const session = sessionRes.rows[0];

    // If initial messages provided, insert them
    for (const msg of initialMessages) {
      const role = msg.sender === 'user' || msg.role === 'user' ? 'user' : 'assistant';
      const content = msg.text || msg.content;
      if (content) {
        await query(
          `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)`,
          [session.id, role, content]
        );
      }
    }

    return res.json({
      success: true,
      session: {
        id: session.id,
        title: session.title,
        preview: initialMessages[initialMessages.length - 1]?.text?.substring(0, 50) || 'New Conversation',
        updatedAt: new Date(session.updated_at).toLocaleDateString(),
        timestamp: new Date(session.updated_at).getTime(),
        messages: initialMessages,
      },
    });
  } catch (error: any) {
    console.error('Create chat session error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// SAVE a message to a session
app.post('/api/chat/messages', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { sessionId, role = 'user', content } = req.body;

    if (!sessionId || !content) {
      return res.status(400).json({ success: false, error: 'sessionId and content are required.' });
    }

    if (!userId || !isValidUuid(sessionId)) {
      return res.json({ success: true, data: { id: `msg-${Date.now()}`, session_id: sessionId, role, content } });
    }

    // Verify session belongs to user
    const sessionCheck = await query(
      `SELECT id FROM chat_sessions WHERE id = $1 AND student_id = $2`,
      [sessionId, userId]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(403).json({ success: false, error: 'Session not found or access denied.' });
    }

    const msgRes = await query(
      `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3) RETURNING *`,
      [sessionId, role, content]
    );

    // Update session updated_at
    await query(`UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1`, [sessionId]);

    return res.json({ success: true, data: msgRes.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE session title
app.put('/api/chat/sessions/:id', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;
    const { title } = req.body;

    if (!userId || !isValidUuid(id)) {
      return res.json({ success: true, data: { id, title } });
    }

    const result = await query(
      `UPDATE chat_sessions SET title = COALESCE($1, title), updated_at = NOW() WHERE id = $2 AND student_id = $3 RETURNING *`,
      [title, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE a specific session for authenticated user
app.delete('/api/chat/sessions/:id', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || (typeof req.query.userId === 'string' ? req.query.userId : null);
    const { id } = req.params;

    if (!userId || !isValidUuid(id)) {
      return res.json({ success: true, message: 'Session deleted' });
    }

    const result = await query(
      `DELETE FROM chat_sessions WHERE id = $1 AND student_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    return res.json({ success: true, message: 'Session deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// =========================================================
// AI Chat — Real-Time SSE Streaming Endpoint
// =========================================================
app.post(['/api/chat/stream', '/api/mentor-chat/stream'], optionalAuth, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  try {
    const userId = req.user?.id || (typeof req.query.userId === 'string' ? req.query.userId : null) || req.body.userId || null;
    const validSessionId = userId && req.body.sessionId && isValidUuid(req.body.sessionId) ? req.body.sessionId : null;

    // Build real student context from DB if user is authenticated
    const studentCtx = userId ? await buildStudentContextFromDB(userId) : null;

    const rawGrok = (process.env.GROK_API_KEY || process.env.XAI_API_KEY || '').trim();
    const rawGroq = (process.env.GROQ_API_KEY || '').trim();
    const rawGemini = (process.env.GEMINI_API_KEY || '').trim();

    const grokKey = isValidApiKey(rawGrok) ? rawGrok : '';
    const groqKey = isValidApiKey(rawGroq) ? rawGroq : '';
    const geminiKey = isValidApiKey(rawGemini) ? rawGemini : '';

    const preferredGrokModel = req.body.model || 'grok-2-latest';
    const isConcise = Boolean(req.body.isConcise || req.body.isMiniCard);
    const targetTokens = isConcise ? 200 : 650;
    const { messages } = buildGroqMessages(studentCtx, req.body);

    // Collect full response for chat persistence
    let fullResponse = '';
    const originalWrite = res.write.bind(res);
    res.write = function(chunk: any, ...args: any[]) {
      try {
        const str = typeof chunk === 'string' ? chunk : chunk.toString();
        const match = str.match(/data: (.+)/);
        if (match) {
          const parsed = JSON.parse(match[1]);
          if (parsed.chunk) fullResponse += parsed.chunk;
        }
      } catch {}
      return originalWrite(chunk, ...args);
    } as any;

    const persistChatToDb = async () => {
      if (validSessionId && fullResponse) {
        try {
          const studentId = req.user?.id || (typeof req.body.userId === 'string' ? req.body.userId : null);
          if (studentId && isValidUuid(validSessionId)) {
            const chatTitle = req.body.message ? String(req.body.message).trim().substring(0, 45) : 'Conversation';
            await query(
              `INSERT INTO chat_sessions (id, student_id, title)
               VALUES ($1, $2, $3)
               ON CONFLICT (id) DO UPDATE SET updated_at = NOW()`,
              [validSessionId, studentId, chatTitle]
            ).catch(() => {});
          }
          if (req.body.message) {
            await query(`INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'user', $2)`, [validSessionId, String(req.body.message)]).catch(() => {});
          }
          await query(`INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'assistant', $2)`, [validSessionId, fullResponse]).catch(() => {});
          await query(`UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1`, [validSessionId]).catch(() => {});
        } catch (dbErr) {
          console.error('persistChatToDb error:', dbErr);
        }
      }
    };

    // 1. PRIMARY: Groq LPU Engine
    const effectiveGroqKey = groqKey || (grokKey.startsWith('gsk_') ? grokKey : '');
    if (effectiveGroqKey) {
      try {
        const groq = getGroqClient(effectiveGroqKey);
        const streamed = await executeGroqStream(groq, messages, res, targetTokens);
        if (streamed) {
          await persistChatToDb();
          return res.end();
        }
      } catch (groqErr: any) { console.error('Groq streaming exception:', groqErr?.message || groqErr); }
    }

    // 2. SECONDARY: xAI Grok
    if (grokKey && !grokKey.startsWith('gsk_')) {
      try {
        const grok = getGrokClient(grokKey);
        const streamed = await executeGrokStream(grok, messages, preferredGrokModel, res);
        if (streamed) {
          await persistChatToDb();
          return res.end();
        }
      } catch (grokErr: any) { console.error('Grok streaming exception:', grokErr?.message || grokErr); }
    }

    // 3. TERTIARY: Gemini Provider
    if (geminiKey) {
      try {
        const { userPrompt, systemInstruction, contents } = buildPromptAndContents(studentCtx, req.body);
        if (userPrompt) {
          const ai = getAIClient();
          const isThinkMode = req.body.isThinkMode;
          const config: any = { systemInstruction, temperature: 0.6, maxOutputTokens: isConcise ? 220 : 1000 };
          if (isThinkMode) config.thinkingConfig = { thinkingBudget: 2048 };

          const responseStream = await ai.models.generateContentStream({
            model: 'gemini-3.7-flash', contents, config,
          });

          let hasSentChunk = false;
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) { hasSentChunk = true; res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`); }
          }
          if (hasSentChunk) {
            res.write(`data: ${JSON.stringify({ done: true, modelUsed: 'Gemini 3.7 Flash' })}\n\n`);
            await persistChatToDb();
            return res.end();
          }
        }
      } catch (geminiErr: any) { console.warn('Gemini stream failed:', geminiErr?.message || geminiErr); }
    }

    // 4. Fallback
    const fallbackText = generateAcademicMentorFallback(studentCtx, req.body);
    res.write(`data: ${JSON.stringify({ chunk: fallbackText })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, modelUsed: 'CampusOS AI Mentor (Resilient Mode)' })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error handling streaming chat:', error);
    const fallbackText = generateAcademicMentorFallback(null, req.body);
    res.write(`data: ${JSON.stringify({ chunk: fallbackText })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, modelUsed: 'CampusOS AI Mentor (Offline Mode)' })}\n\n`);
    res.end();
  }
});

// =========================================================
// AI Chat — Standard JSON Endpoint
// =========================================================
app.post(['/api/chat', '/api/mentor-chat'], optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || (typeof req.query.userId === 'string' ? req.query.userId : null) || null;
    const studentCtx = userId ? await buildStudentContextFromDB(userId) : null;

    const rawGrok = (process.env.GROK_API_KEY || process.env.XAI_API_KEY || '').trim();
    const rawGroq = (process.env.GROQ_API_KEY || '').trim();
    const rawGemini = (process.env.GEMINI_API_KEY || '').trim();

    const grokKey = isValidApiKey(rawGrok) ? rawGrok : '';
    const groqKey = isValidApiKey(rawGroq) ? rawGroq : '';
    const geminiKey = isValidApiKey(rawGemini) ? rawGemini : '';

    const preferredGrokModel = req.body.model || 'grok-2-latest';
    const isConcise = Boolean(req.body.isConcise || req.body.isMiniCard);
    const targetTokens = isConcise ? 200 : 650;
    const { messages, studentName, semester, careerGoal } = buildGroqMessages(studentCtx, req.body);

    // Auto-create or resolve chat session if userId exists
    let sessionId = req.body.sessionId && isValidUuid(req.body.sessionId) ? req.body.sessionId : null;
    if (userId && !sessionId) {
      const userMsg = req.body.message || 'Academic & Career Guidance';
      const title = typeof userMsg === 'string' && userMsg.length > 3
        ? userMsg.slice(0, 40) + '...'
        : 'Academic & Career Guidance';
      const newSession = await query(
        `INSERT INTO chat_sessions (student_id, title) VALUES ($1, $2) RETURNING id`,
        [userId, title]
      ).catch(() => ({ rows: [] }));
      sessionId = newSession.rows[0]?.id || null;
    }

    if (userId && sessionId && isValidUuid(sessionId) && req.body.message) {
      await query(
        `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'user', $2)`,
        [sessionId, String(req.body.message)]
      ).catch(() => {});
    }

    const saveAssistantReply = async (text: string) => {
      if (userId && sessionId && isValidUuid(sessionId) && text) {
        await query(
          `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'assistant', $2)`,
          [sessionId, text]
        ).catch(() => {});
        await query(`UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1`, [sessionId]).catch(() => {});
      }
    };

    // 1. PRIMARY: Groq
    const effectiveGroqKey = groqKey || (grokKey.startsWith('gsk_') ? grokKey : '');
    if (effectiveGroqKey) {
      try {
        const groq = getGroqClient(effectiveGroqKey);
        const result = await executeGroqCompletion(groq, messages, targetTokens);
        if (result) {
          await saveAssistantReply(result.text);
          return res.json({ text: result.text, modelUsed: result.modelUsed, sessionId, thoughtProcess: `Processed with Groq LPU engine for student ${studentName} (${semester}, ${careerGoal}).` });
        }
      } catch (groqErr: any) { console.error('Groq non-streaming error:', groqErr?.message || groqErr); }
    }

    // 2. SECONDARY: xAI Grok
    if (grokKey && !grokKey.startsWith('gsk_')) {
      try {
        const grok = getGrokClient(grokKey);
        const result = await executeGrokCompletion(grok, messages, preferredGrokModel);
        if (result) {
          await saveAssistantReply(result.text);
          return res.json({ text: result.text, modelUsed: result.modelUsed, sessionId, thoughtProcess: `Reasoned with Grok AI for student ${studentName} (${semester}, ${careerGoal}).` });
        }
      } catch (grokErr: any) { console.error('Grok non-streaming error:', grokErr?.message || grokErr); }
    }

    // 3. TERTIARY: Gemini
    if (geminiKey) {
      try {
        const { userPrompt, systemInstruction, contents } = buildPromptAndContents(studentCtx, req.body);
        if (userPrompt) {
          const ai = getAIClient();
          const isThinkMode = req.body.isThinkMode;
          const config: any = { systemInstruction, temperature: 0.6, maxOutputTokens: isConcise ? 220 : 1000 };
          if (isThinkMode) config.thinkingConfig = { thinkingBudget: 2048 };

          const response = await ai.models.generateContent({ model: 'gemini-3.7-flash', contents, config });
          const replyText = response.text;
          if (replyText) {
            await saveAssistantReply(replyText);
            return res.json({ text: replyText, modelUsed: 'Gemini 3.7 Flash', sessionId, thoughtProcess: isThinkMode ? `Reasoned for student ${studentName} (Semester ${semester}, ${careerGoal}) using Gemini 3.7 Flash.` : undefined });
          }
        }
      } catch (geminiErr: any) { console.warn('Gemini non-streaming failed:', geminiErr?.message || geminiErr); }
    }

    // 4. Fallback
    const fallbackText = generateAcademicMentorFallback(studentCtx, req.body);
    await saveAssistantReply(fallbackText);
    return res.json({ text: fallbackText, modelUsed: 'CampusOS AI Mentor (Resilient Mode)', sessionId, thoughtProcess: `Generated guidance for student ${studentName} (${semester}, ${careerGoal}).` });
  } catch (error: any) {
    console.error('Error handling /api/chat:', error);
    const fallbackText = generateAcademicMentorFallback(null, req.body);
    return res.json({ text: fallbackText, modelUsed: 'CampusOS AI Mentor (Fallback Mode)' });
  }
});

export { app };
export default app;
