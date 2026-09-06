import fs from 'fs';
import path from 'path';

const MOCK_NAMES = [
  'mockStudent',
  'mockSkillGrowth',
  'mockAchievements',
  'mockRecentActivity',
  'mockNotifications',
  'mockAdminStats',
  'mockAdminStudents',
  'mockAcademicAnalytics',
  'mockSkillsAnalytics',
  'mockProjectsAnalytics',
  'mockExperienceAnalytics',
  'mockRoadmapAnalytics',
  'mockCareerAnalytics',
  'mockOpportunities',
  'mockAnnouncements',
  'mockAdminNotifications',
  'mockReportsList',
];

function walkDir(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file === '.gemini') {
      continue;
    }
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else if (/\.(ts|tsx|js|jsx|json)$/.test(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = walkDir(process.cwd());
console.log(`Auditing ${allFiles.length} files for mock data references...\n`);

const findings: Record<string, { file: string; line: number; content: string }[]> = {};

for (const name of MOCK_NAMES) {
  findings[name] = [];
  for (const file of allFiles) {
    // skip the audit script itself
    if (file.endsWith('audit_mocks.ts')) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes(name)) {
        findings[name].push({
          file: path.relative(process.cwd(), file),
          line: index + 1,
          content: line.trim(),
        });
      }
    });
  }
}

for (const name of MOCK_NAMES) {
  const occ = findings[name];
  console.log(`========================================`);
  console.log(`MOCK: ${name} (${occ.length} occurrences)`);
  console.log(`========================================`);
  if (occ.length === 0) {
    console.log(`  None found.`);
  } else {
    for (const o of occ) {
      console.log(`  ${o.file}:${o.line} -> ${o.content}`);
    }
  }
  console.log('');
}
