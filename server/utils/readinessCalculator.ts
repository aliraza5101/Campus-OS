import { query } from '../db/pg';

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

export async function recalculateAndPersistReadiness(studentId: string): Promise<number> {
  try {
    const [profileRes, skillsRes, projectsRes, expRes, certsRes, tasksRes] = await Promise.all([
      query(`SELECT career_goal, degree, gpa, headline, about_me, relevant_coursework, avatar, name, university FROM student_profiles WHERE id = $1`, [studentId]),
      query(`SELECT name, percentage, level, verified FROM skills WHERE student_id = $1`, [studentId]),
      query(`SELECT title, category, status, progress, tech_stack, github_url FROM projects WHERE student_id = $1`, [studentId]),
      query(`SELECT id FROM experiences WHERE student_id = $1`, [studentId]),
      query(`SELECT id FROM certifications WHERE student_id = $1`, [studentId]),
      query(`SELECT id FROM roadmap_tasks WHERE student_id = $1 AND status = 'completed'`, [studentId]),
    ]);

    const p = profileRes.rows[0] || {};
    const domain = detectDomain(p.career_goal, p.degree);

    // 1. Skills (0-100)
    const skills = skillsRes.rows;
    let skillsScore = 15;
    if (skills.length > 0) {
      const countScore = Math.min(80, 25 + skills.length * 11);
      const avgProf = skills.reduce((s: number, sk: any) => s + (Number(sk.percentage) || 60), 0) / skills.length;
      const relevant = skills.filter((sk: any) => matchesDomain(sk.name || '', domain));
      const relBonus = Math.min(15, relevant.length * 4);
      const verBonus = Math.min(10, skills.filter((sk: any) => sk.verified).length * 2.5);
      skillsScore = Math.min(100, Math.round(countScore * 0.5 + avgProf * 0.35 + relBonus + verBonus));
    }

    // 2. Projects (0-100)
    const projects = projectsRes.rows;
    let projectsScore = 15;
    if (projects.length === 1) projectsScore = 45;
    else if (projects.length === 2) projectsScore = 70;
    else if (projects.length === 3) projectsScore = 88;
    else if (projects.length > 3) projectsScore = Math.min(96, 88 + (projects.length - 3) * 3);

    if (projects.length > 0) {
      let aligned = 0;
      let completed = 0;
      let withRepo = 0;
      for (const pr of projects) {
        const techJoined = Array.isArray(pr.tech_stack) ? pr.tech_stack.join(' ') : '';
        if (matchesDomain(`${pr.title} ${pr.category} ${techJoined}`, domain)) aligned += 1;
        if (pr.status === 'Completed' || Number(pr.progress) >= 90) completed += 1;
        if (pr.github_url && pr.github_url.trim()) withRepo += 1;
      }
      projectsScore = Math.min(100, Math.round(projectsScore + Math.min(12, aligned * 4) + Math.min(8, completed * 3) + Math.min(6, withRepo * 2)));
    }

    // 3. Experience (0-100)
    const expCount = expRes.rows.length;
    const experienceScore = expCount === 0 ? 20 : expCount === 1 ? 65 : Math.min(98, 75 + expCount * 10);

    // 4. Profile (0-100)
    let profileScore = 30;
    if (p.name && p.degree && p.university) profileScore += 25;
    if (p.gpa && Number(p.gpa) > 0) profileScore += 10;
    if (p.headline && p.headline.trim()) profileScore += 10;
    if (p.about_me && p.about_me.trim()) profileScore += 10;
    if (p.relevant_coursework && p.relevant_coursework.length > 0) profileScore += 10;
    if (p.avatar && p.avatar.trim()) profileScore += 5;
    profileScore = Math.min(100, profileScore);

    // 5. Networking (0-100)
    const certCount = certsRes.rows.length;
    const completedTasks = tasksRes.rows.length;
    const networkingScore = Math.min(100, 25 + Math.min(45, certCount * 22) + Math.min(30, completedTasks * 8));

    // Composite
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

    // Persist to student_profiles
    await query(`UPDATE student_profiles SET career_readiness = $1, updated_at = NOW() WHERE id = $2`, [overall, studentId]);

    // Check if readiness >= 80% to unlock achievement automatically
    if (overall >= 80) {
      await query(
        `UPDATE achievements
         SET status = 'Completed', earned_date = TO_CHAR(NOW(), 'Mon YYYY')
         WHERE student_id = $1 AND achievement_key = 'high_readiness'`,
        [studentId]
      ).catch(() => {});
    }

    return overall;
  } catch (err) {
    console.warn('Error recalculating readiness:', err);
    return 75;
  }
}
