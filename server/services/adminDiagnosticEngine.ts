import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export interface AdminStudentDiagnosticResult {
  overallHealth: 'Optimal' | 'Satisfactory' | 'Needs Attention' | 'Critical Risk';
  healthScore: number;
  executiveSummary: string;
  academicRiskFactors: string[];
  skillGaps: string[];
  portfolioAssessment: string;
  recommendedAdvisorActions: string[];
  suggestedInterventionType: 'Course Tutoring' | 'Career Coaching' | 'Research Mentorship' | 'FYP Preparation' | 'Routine Monitoring';
  generatedAt: string;
  modelUsed?: string;
}

export interface StudentDiagnosticContext {
  id: string;
  name: string;
  degree: string;
  semester: number;
  gpa: number;
  careerGoal: string;
  status: string;
  academicStanding: string;
  creditsCompleted: number;
  totalCredits: number;
  skills: Array<{ name: string; level: string; percentage: number }>;
  projects: Array<{ title: string; status: string; techStack?: string[] }>;
  experiences: Array<{ title: string; company: string; employmentType: string }>;
  certifications?: Array<{ title: string; organization: string }>;
  applications?: Array<{ opportunityTitle: string; company: string; status: string }>;
}

export async function generateStudentDiagnostic(ctx: StudentDiagnosticContext): Promise<AdminStudentDiagnosticResult> {
  const gpa = Number(ctx.gpa) || 0;
  const semester = Number(ctx.semester) || 1;
  const skillsStr = ctx.skills.map((s) => `${s.name} (${s.level || 'Intermediate'})`).slice(0, 10).join(', ') || 'No recorded technical competencies';
  const projectsStr = ctx.projects.map((p) => `${p.title} [${p.status}]`).slice(0, 6).join(', ') || 'No published student repositories';
  const experiencesStr = ctx.experiences.map((e) => `${e.title} at ${e.company} (${e.employmentType})`).slice(0, 4).join(', ') || 'No formal workplace experience recorded';

  // 1. Try Groq AI
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey && groqKey.startsWith('gsk_')) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      const prompt = `You are the CampusOS Chief Academic & Career Diagnostic Engine. Provide an executive, institutional evaluation for a University Dean / Department Chair reviewing the following undergraduate student:

Student Profile:
- Name: ${ctx.name}
- Degree / Department: ${ctx.degree}
- Academic Term: Semester ${semester} of 8
- Cumulative CGPA: ${gpa.toFixed(2)} / 4.00
- Academic Standing: ${ctx.academicStanding || 'Good Standing'}
- Status: ${ctx.status || 'Active'}
- Career Goal: ${ctx.careerGoal || 'Software Engineer'}
- Credits: ${ctx.creditsCompleted} of ${ctx.totalCredits} completed
- Technical Skills: ${skillsStr}
- Portfolio Projects: ${projectsStr}
- Professional Experience: ${experiencesStr}

Respond with ONLY valid, raw JSON (no markdown fences, no explanatory preamble):
{
  "overallHealth": "Optimal" | "Satisfactory" | "Needs Attention" | "Critical Risk",
  "healthScore": <integer between 20 and 99>,
  "executiveSummary": "<2 concise, high-level sentences summarizing student standing, readiness, and trajectory for dean>",
  "academicRiskFactors": ["<risk 1>", "<risk 2>"],
  "skillGaps": ["<specific missing skill for target role>", "<specific tool or framework gap>"],
  "portfolioAssessment": "<1 concise sentence assessing strength of their technical projects and repos>",
  "recommendedAdvisorActions": ["<action item 1>", "<action item 2>", "<action item 3>"],
  "suggestedInterventionType": "Course Tutoring" | "Career Coaching" | "Research Mentorship" | "FYP Preparation" | "Routine Monitoring"
}`;

      const completion = await groq.chat.completions.create({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: 'You are an institutional academic diagnostic engine. Return strictly valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 700,
        response_format: { type: 'json_object' }
      });

      const raw = completion.choices[0]?.message?.content?.trim();
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.overallHealth && parsed.executiveSummary) {
          return {
            overallHealth: parsed.overallHealth,
            healthScore: Number(parsed.healthScore) || (gpa >= 3.5 ? 92 : gpa >= 3.0 ? 80 : 60),
            executiveSummary: parsed.executiveSummary,
            academicRiskFactors: Array.isArray(parsed.academicRiskFactors) ? parsed.academicRiskFactors : [],
            skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [],
            portfolioAssessment: parsed.portfolioAssessment || 'Portfolio meets current term requirements.',
            recommendedAdvisorActions: Array.isArray(parsed.recommendedAdvisorActions) ? parsed.recommendedAdvisorActions : [],
            suggestedInterventionType: parsed.suggestedInterventionType || (gpa < 2.5 ? 'Course Tutoring' : 'Career Coaching'),
            generatedAt: new Date().toISOString(),
            modelUsed: 'Groq Qwen 3.8 27B'
          };
        }
      }
    } catch (groqErr) {
      console.warn('Groq diagnostic fallback:', (groqErr as any)?.message || groqErr);
    }
  }

  // 2. Try Gemini
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey && geminiKey.length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const prompt = `Provide an institutional academic diagnostic for student ${ctx.name} (Semester ${semester}, ${ctx.degree}, CGPA ${gpa.toFixed(2)}, Goal: ${ctx.careerGoal}, Skills: ${skillsStr}, Projects: ${projectsStr}). Return valid JSON only with overallHealth, healthScore, executiveSummary, academicRiskFactors, skillGaps, portfolioAssessment, recommendedAdvisorActions, suggestedInterventionType.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });
      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          ...parsed,
          generatedAt: new Date().toISOString(),
          modelUsed: 'Gemini 3.7 Flash'
        };
      }
    } catch (geminiErr) {
      console.warn('Gemini diagnostic fallback:', (geminiErr as any)?.message || geminiErr);
    }
  }

  // 3. High-Quality Deterministic Diagnostic Fallback
  return generateDeterministicDiagnostic(ctx);
}

function generateDeterministicDiagnostic(ctx: StudentDiagnosticContext): AdminStudentDiagnosticResult {
  const gpa = Number(ctx.gpa) || 0;
  const semester = Number(ctx.semester) || 1;
  const numProjects = ctx.projects.length;
  const numSkills = ctx.skills.length;

  if (gpa >= 3.5) {
    return {
      overallHealth: 'Optimal',
      healthScore: Math.min(98, 88 + Math.round((gpa - 3.5) * 20)),
      executiveSummary: `${ctx.name} is in strong academic standing with a ${gpa.toFixed(2)} CGPA in ${ctx.degree}. Trajectory aligns well with targets for ${ctx.careerGoal}.`,
      academicRiskFactors: [
        semester >= 6 && numProjects < 2 ? 'Senior project portfolio needs acceleration before placement cycle.' : 'No urgent academic deficiencies detected.'
      ],
      skillGaps: [
        'Production Deployment & CI/CD automation',
        'Large-Scale System Architecture benchmarks'
      ],
      portfolioAssessment: numProjects > 0 
        ? `Student has documented ${numProjects} project(s); encourage open-sourcing repositories with live documentation.`
        : 'Student should publish at least one flagship repository showcasing applied domain problem-solving.',
      recommendedAdvisorActions: [
        'Nominate student for University Dean’s Honors list and research fellowship seats.',
        'Encourage participation in upcoming national hackathons and lab research assistantships.',
        'Review final year capstone project proposal early during Semester 6 advising.'
      ],
      suggestedInterventionType: 'Research Mentorship',
      generatedAt: new Date().toISOString(),
      modelUsed: 'CampusOS Institutional Diagnostic Engine'
    };
  } else if (gpa >= 3.0) {
    return {
      overallHealth: 'Satisfactory',
      healthScore: 78,
      executiveSummary: `${ctx.name} maintains a steady ${gpa.toFixed(2)} CGPA in ${ctx.degree} with solid foundational progress toward ${ctx.careerGoal}.`,
      academicRiskFactors: [
        'Ensure elective coursework maintains core GPA above 3.20 to maximize competitive hiring filters.',
        numSkills < 4 ? 'Skill expansion recommended to match industry standards for target role.' : 'Coursework load is balanced.'
      ],
      skillGaps: [
        'Advanced Data Structures & LeetCode medium proficiency',
        'Cloud native tools (Docker, container orchestration)'
      ],
      portfolioAssessment: numProjects > 0
        ? `Currently has ${numProjects} project(s). Focus on completing in-progress items and verifying commit history.`
        : 'Student requires verified portfolio repositories aligned with their engineering track.',
      recommendedAdvisorActions: [
        'Schedule semester progress check-in to identify optimal upper-level electives.',
        'Connect student with on-campus peer study circles and technical workshops.',
        'Recommend applying for summer internship opportunities before final year.'
      ],
      suggestedInterventionType: 'Career Coaching',
      generatedAt: new Date().toISOString(),
      modelUsed: 'CampusOS Institutional Diagnostic Engine'
    };
  } else if (gpa >= 2.5) {
    return {
      overallHealth: 'Needs Attention',
      healthScore: 62,
      executiveSummary: `${ctx.name} has a ${gpa.toFixed(2)} CGPA, signaling academic strain in core courses that requires targeted advising to prevent probation.`,
      academicRiskFactors: [
        'Cumulative CGPA is near the institutional threshold; student needs GPA recovery strategy.',
        'Course credit pace should be monitored to prevent delayed graduation.'
      ],
      skillGaps: [
        'Core algorithmic problem-solving & clean coding fundamentals',
        'Practical frameworks required for entry-level internships'
      ],
      portfolioAssessment: 'Portfolio requires structured guidance; coursework projects need stronger technical depth.',
      recommendedAdvisorActions: [
        'Mandate an academic recovery advising session with department counselor.',
        'Enroll student in faculty-led tutoring for struggling semester subjects.',
        'Set milestone goal of raising term SGPA above 3.0 in current term.'
      ],
      suggestedInterventionType: 'Course Tutoring',
      generatedAt: new Date().toISOString(),
      modelUsed: 'CampusOS Institutional Diagnostic Engine'
    };
  } else {
    return {
      overallHealth: 'Critical Risk',
      healthScore: 44,
      executiveSummary: `${ctx.name} is on academic alert with a ${gpa.toFixed(2)} CGPA. Immediate institutional intervention is required to address course deficiencies.`,
      academicRiskFactors: [
        'CGPA falls below minimum standing criteria (2.50). High risk of probation.',
        'Multiple core course retakes likely necessary to regain degree alignment.'
      ],
      skillGaps: [
        'Foundational programming syntax and problem decomposition',
        'Mathematical foundations (Calculus, Linear Algebra, Discrete Math)'
      ],
      portfolioAssessment: 'Student needs to prioritize passing coursework before undertaking extra portfolio tasks.',
      recommendedAdvisorActions: [
        'Issue formal academic warning notice and assign designated faculty mentor.',
        'Limit semester course load to 12-14 credit hours to enable focused study.',
        'Schedule bi-weekly attendance and homework completion checks with advising office.'
      ],
      suggestedInterventionType: 'Course Tutoring',
      generatedAt: new Date().toISOString(),
      modelUsed: 'CampusOS Institutional Diagnostic Engine'
    };
  }
}
