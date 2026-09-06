import { query } from '../server/db/pg';
import { generateSemesterAwareFocusPillars } from '../server/services/focusPillarsEngine';

async function testEndpointLogic() {
  console.log('--- TESTING REAL DB STUDENTS WITH FOCUS PILLARS ---');

  // Query actual students in DB
  const studentsRes = await query(`
    SELECT u.email, sp.id, sp.name, sp.degree, sp.semester, sp.career_goal, sp.gpa
    FROM student_profiles sp
    JOIN users u ON sp.id = u.id
    LIMIT 5
  `);

  console.log(`Found ${studentsRes.rows.length} real students in DB:`);
  for (const s of studentsRes.rows) {
    console.log(`\nEvaluating: ${s.name} (${s.email})`);
    console.log(`Degree: ${s.degree}, Semester: ${s.semester}, Target Goal: ${s.career_goal}`);

    const result = await generateSemesterAwareFocusPillars({
      name: s.name,
      degree: s.degree || 'BS Computer Science',
      semester: Number(s.semester) || 1,
      gpa: Number(s.gpa) || 3.5,
      careerGoal: s.career_goal || 'Software Engineering',
      university: 'FAST NUCES',
      skills: [],
      projects: [],
    });

    console.log(`-> Academic Stage: "${result.stageLabel}" (Source: ${result.source})`);
    console.log('-> Tailored Pillars:');
    result.pillars.forEach((p) => {
      console.log(`     [${p.number}] ${p.title} (${p.tech})`);
    });
  }

  console.log('\n✓ All student profiles successfully evaluated and received personalized pillars!');
  process.exit(0);
}

testEndpointLogic().catch((err) => {
  console.error(err);
  process.exit(1);
});
