import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { optionalAuth } from '../middleware/auth';

dotenv.config();

const router = Router();

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

// Generate JSON response using multi-provider AI (Groq -> Grok -> Gemini)
async function generateAiJson(prompt: string, systemPrompt: string): Promise<any> {
  const rawGroq = (process.env.GROQ_API_KEY || '').trim();
  const rawGrok = (process.env.GROK_API_KEY || process.env.XAI_API_KEY || '').trim();
  const rawGemini = (process.env.GEMINI_API_KEY || '').trim();

  // 1. Primary: Groq (ultra fast)
  if (isValidApiKey(rawGroq)) {
    const groqModels = ['qwen/qwen3.8-27b', 'groq/compound-mini', 'openai/gpt-oss-120b'];
    for (const model of groqModels) {
      try {
        const groq = new Groq({ apiKey: rawGroq, timeout: 12000 });
        const completion = await groq.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: `${systemPrompt} Output ONLY valid JSON without markdown fences.` },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
        });

        const text = completion.choices[0]?.message?.content || '{}';
        // Clean markdown backticks if returned
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      } catch (err) {
        console.warn(`Groq JSON with model ${model} failed, trying next:`, err);
      }
    }
  }

  // 2. Secondary: Grok (xAI)
  if (isValidApiKey(rawGrok) && !rawGrok.startsWith('gsk_')) {
    try {
      const grok = new OpenAI({ apiKey: rawGrok, baseURL: 'https://api.x.ai/v1', timeout: 15000 });
      const completion = await grok.chat.completions.create({
        model: 'grok-2-latest',
        messages: [
          { role: 'system', content: `${systemPrompt} Output ONLY valid JSON.` },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });
      const text = completion.choices[0]?.message?.content || '{}';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn('Grok JSON generation error:', err);
    }
  }

  // 3. Tertiary: Gemini Flash
  if (isValidApiKey(rawGemini)) {
    try {
      const ai = new GoogleGenAI({ apiKey: rawGemini });
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `${systemPrompt}\n\nTask: ${prompt}\n\nOutput only valid JSON.`,
      });
      if (response.text) {
        const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (err) {
      console.warn('Gemini JSON generation error:', err);
    }
  }

  return null;
}


// ==========================================
// 1. ONBOARDING AI ANALYSIS & DASHBOARD GENERATOR
// ==========================================
router.post('/onboarding-analysis', optionalAuth, async (req: Request, res: Response) => {
  try {
    const {
      name = 'Student',
      degree = 'BS Artificial Intelligence',
      semester = 5,
      university = 'National University of Computer & Emerging Sciences',
      careerGoal = 'AI / Machine Learning Engineer',
      gpa = 3.5,
      skills = [],
      projects = [],
      experiences = [],
      relevantCoursework = [],
    } = req.body;

    const systemPrompt = `You are the Campus OS Elite Academic & Career AI Engine.
Analyze the student's profile, academic status, skills, and projects against their target career goal.
Return a structured JSON object with:
1. "careerReadiness": {
     "skills": number (0-100),
     "projects": number (0-100),
     "experience": number (0-100),
     "profile": number (0-100),
     "networking": number (0-100),
     "overall": number (0-100)
   }
2. "nextSteps": Array of 3-4 actionable items tailored to their semester and goal:
   [
     {
       "id": "action-1",
       "number": "01",
       "title": "Clear action title",
       "category": "Project" | "Skill" | "Career" | "Academic" | "Research",
       "priority": "High" | "Medium" | "Low",
       "estimatedTime": "e.g. 2 weeks",
       "actionType": "Build Project" | "Skill Milestone" | "Apply Opportunity" | "Research Paper",
       "status": "pending"
     }
   ]
3. "strategicAdvice": string (2-3 sentences of sharp, personalized advice)
4. "criticalSkillGaps": string[] (top 3 skills they must learn next)`;

    const prompt = `Student Name: ${name}
Degree: ${degree} (Semester ${semester} of 8, CGPA: ${gpa})
University: ${university}
Career Goal: ${careerGoal}
Current Skills: ${JSON.stringify(skills)}
Current Projects: ${JSON.stringify(projects)}
Current Experiences: ${JSON.stringify(experiences)}
Completed Coursework: ${JSON.stringify(relevantCoursework)}

Evaluate readiness and generate personalized next steps.`;

    const aiResult = await generateAiJson(prompt, systemPrompt);

    if (aiResult && aiResult.careerReadiness && aiResult.nextSteps) {
      return res.json({
        success: true,
        source: 'ai_engine',
        data: aiResult,
      });
    }

    // Fallback intelligent computation if AI provider is rate-limited
    const skillsScore = Math.min(95, Math.max(50, (skills.length || 3) * 16));
    const projectsScore = Math.min(95, Math.max(40, (projects.length || 2) * 22));
    const expScore = experiences.length > 0 ? 85 : 45;
    const profileScore = 88;
    const netScore = 70;
    const overall = Math.round((skillsScore + projectsScore + expScore + profileScore + netScore) / 5);

    const defaultNextSteps = [
      {
        id: 'action-1',
        number: '01',
        title: `Build a flagship ${careerGoal.split('/')[0].trim()} production project with live URL`,
        category: 'Project',
        priority: 'High',
        estimatedTime: '2 weeks',
        actionType: 'Build Flagship',
        status: 'pending',
      },
      {
        id: 'action-2',
        number: '02',
        title: `Complete advanced certification in ${skills[0]?.name || 'Core Stack'}`,
        category: 'Skill',
        priority: 'High',
        estimatedTime: '10 days',
        actionType: 'Skill Milestone',
        status: 'pending',
      },
      {
        id: 'action-3',
        number: '03',
        title: `Target Summer 2025 ${careerGoal} internship applications`,
        category: 'Career',
        priority: 'Medium',
        estimatedTime: '3 weeks',
        actionType: 'Apply Opportunities',
        status: 'pending',
      },
    ];

    return res.json({
      success: true,
      source: 'rule_engine',
      data: {
        careerReadiness: {
          skills: skillsScore,
          projects: projectsScore,
          experience: expScore,
          profile: profileScore,
          networking: netScore,
          overall,
        },
        nextSteps: defaultNextSteps,
        strategicAdvice: `Maintain your strong academic standing in Semester ${semester} while focusing on deploying full-stack portfolio repositories.`,
        criticalSkillGaps: ['Docker & Containerization', 'Cloud Deployment (AWS/GCP)', 'Distributed Systems'],
      },
    });
  } catch (error: any) {
    console.error('Onboarding AI analysis error:', error);
    return res.status(500).json({ success: false, error: error.message || 'AI analysis failed' });
  }
});

export default router;
