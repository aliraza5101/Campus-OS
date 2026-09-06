import {
  StudentUser,
  CareerReadinessBreakdown,
  SkillProgressItem,
  ProjectItem,
  ExperienceItem,
  CertificationItem,
  NextActionItem,
} from '../types';

/**
 * Domain-specific keyword dictionary for evaluating career goal relevance.
 */
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  ai: [
    'python',
    'pytorch',
    'tensorflow',
    'machine learning',
    'deep learning',
    'computer vision',
    'nlp',
    'opencv',
    'yolo',
    'keras',
    'neural',
    'data science',
    'scikit',
    'llm',
    'huggingface',
    'fastapi',
    'transformers',
    'pandas',
    'numpy',
  ],
  fullstack: [
    'react',
    'typescript',
    'javascript',
    'node',
    'next.js',
    'next',
    'express',
    'tailwind',
    'html',
    'css',
    'postgresql',
    'mongodb',
    'sql',
    'redux',
    'rest',
    'graphql',
    'vue',
    'angular',
    'web',
  ],
  cloud: [
    'aws',
    'docker',
    'kubernetes',
    'linux',
    'bash',
    'terraform',
    'gcp',
    'azure',
    'ci/cd',
    'devops',
    'helm',
    'prometheus',
    'grafana',
    'git',
    'cloud',
    'sre',
    'ansible',
  ],
  cybersecurity: [
    'security',
    'linux',
    'network',
    'penetration',
    'ctf',
    'cryptography',
    'wireshark',
    'siem',
    'ethical hacking',
    'soc',
    'firewall',
    'vulnerability',
    'burp',
    'bash',
    'splunk',
  ],
  data: [
    'python',
    'sql',
    'pandas',
    'numpy',
    'tableau',
    'power bi',
    'scikit-learn',
    'statistics',
    'spark',
    'dbt',
    'analytics',
    'etl',
    'data warehouse',
    'big data',
  ],
};

function detectDomain(goal?: string, degree?: string): string {
  const combined = `${goal || ''} ${degree || ''}`.toLowerCase();
  if (combined.includes('ai') || combined.includes('machine learning') || combined.includes('deep learning') || combined.includes('vision') || combined.includes('nlp')) {
    return 'ai';
  }
  if (combined.includes('cloud') || combined.includes('devops') || combined.includes('sre') || combined.includes('infrastructure')) {
    return 'cloud';
  }
  if (combined.includes('cyber') || combined.includes('security') || combined.includes('infosec')) {
    return 'cybersecurity';
  }
  if (combined.includes('data') || combined.includes('analytics') || combined.includes('bi')) {
    return 'data';
  }
  if (combined.includes('web') || combined.includes('full stack') || combined.includes('frontend') || combined.includes('backend') || combined.includes('software')) {
    return 'fullstack';
  }
  return 'general';
}

function matchesDomain(text: string, domain: string): boolean {
  const keywords = DOMAIN_KEYWORDS[domain] || [];
  if (keywords.length === 0) return true;
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

/**
 * Calculates a dynamic, realistic Zero-to-Hero Career Readiness Breakdown.
 *
 * Scoring dynamics:
 * - Starter baseline (0 projects, minimal skills): ~20-30%
 * - Foundation (1-2 skills + 1 project): ~45-55%
 * - Competent (3-4 skills + 2 projects aligned with goal): ~65-75%
 * - Hero level (5+ skills + 3+ projects + certs + role): ~85-98%
 */
export function calculateCareerReadiness(
  user?: Partial<StudentUser>,
  skills: SkillProgressItem[] = [],
  projects: ProjectItem[] = [],
  experiences: ExperienceItem[] = [],
  certifications: CertificationItem[] = [],
  nextSteps: NextActionItem[] = []
): CareerReadinessBreakdown {
  const domain = detectDomain(user?.careerGoal, user?.degree);

  // 1. SKILLS SCORE (0 - 100)
  let skillsScore = 0;
  const skillCount = skills.length;
  if (skillCount === 0) {
    skillsScore = 15;
  } else {
    const countScore = Math.min(80, 25 + skillCount * 11);
    const avgProficiency =
      skills.reduce((sum, s) => sum + (Number(s.percentage) || 60), 0) / skillCount;

    const relevantSkills = skills.filter((s) => matchesDomain(s.name, domain));
    const relevanceBonus = Math.min(15, relevantSkills.length * 4);
    const verifiedBonus = Math.min(10, skills.filter((s) => s.verified).length * 2.5);

    skillsScore = Math.min(100, Math.round(countScore * 0.5 + avgProficiency * 0.35 + relevanceBonus + verifiedBonus));
  }

  // 2. PROJECTS SCORE (0 - 100)
  let projectsScore = 0;
  const projectCount = projects.length;
  if (projectCount === 0) {
    projectsScore = 15;
  } else {
    let baseProjectScore = 0;
    if (projectCount === 1) baseProjectScore = 45;
    else if (projectCount === 2) baseProjectScore = 70;
    else if (projectCount === 3) baseProjectScore = 88;
    else baseProjectScore = Math.min(96, 88 + (projectCount - 3) * 3);

    let domainAlignedProjects = 0;
    let completedCount = 0;
    let withRepoCount = 0;

    for (const pr of projects) {
      const techJoined = Array.isArray(pr.techStack) ? pr.techStack.join(' ') : '';
      const content = `${pr.title} ${pr.category || ''} ${techJoined}`;
      if (matchesDomain(content, domain)) {
        domainAlignedProjects += 1;
      }
      if (pr.status === 'Completed' || (pr.progress && pr.progress >= 90)) {
        completedCount += 1;
      }
      if (pr.githubUrl && pr.githubUrl.trim().length > 0) {
        withRepoCount += 1;
      }
    }

    const alignmentBonus = Math.min(12, domainAlignedProjects * 4);
    const completionBonus = Math.min(8, completedCount * 3);
    const proofBonus = Math.min(6, withRepoCount * 2);

    projectsScore = Math.min(100, Math.round(baseProjectScore + alignmentBonus + completionBonus + proofBonus));
  }

  // 3. EXPERIENCE SCORE (0 - 100)
  let experienceScore = 0;
  const expCount = experiences.length;
  if (expCount === 0) {
    experienceScore = 20;
  } else if (expCount === 1) {
    experienceScore = 65;
  } else {
    experienceScore = Math.min(98, 75 + expCount * 10);
  }

  // 4. PROFILE COMPLETION SCORE (0 - 100)
  let profileScore = 30;
  if (user?.name && user?.degree && user?.university) profileScore += 25;
  if (user?.gpa && Number(user.gpa) > 0) profileScore += 10;
  if (user?.headline && user.headline.trim().length > 0) profileScore += 10;
  if (user?.aboutMe && user.aboutMe.trim().length > 0) profileScore += 10;
  if (user?.relevantCoursework && user.relevantCoursework.length > 0) profileScore += 10;
  if (user?.avatar && user.avatar.trim().length > 0) profileScore += 5;
  profileScore = Math.min(100, profileScore);

  // 5. NETWORKING & CREDIBILITY SCORE (0 - 100)
  const certCount = certifications.length;
  const completedMilestones = nextSteps.filter((s) => s.status === 'completed').length;
  const baseNetworking = 25;
  const certPoints = Math.min(45, certCount * 22);
  const milestonePoints = Math.min(30, completedMilestones * 8);
  const networkingScore = Math.min(100, baseNetworking + certPoints + milestonePoints);

  // 6. COMPOSITE OVERALL SCORE (0 - 100)
  const overall = Math.min(
    100,
    Math.round(
      skillsScore * 0.3 +
        projectsScore * 0.25 +
        experienceScore * 0.2 +
        profileScore * 0.15 +
        networkingScore * 0.1
    )
  );

  return {
    skills: skillsScore,
    projects: projectsScore,
    experience: experienceScore,
    profile: profileScore,
    networking: networkingScore,
    overall,
  };
}
