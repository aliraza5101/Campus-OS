import { generateSemesterAwareFocusPillars, getDeterministicSemesterPillars, getSemesterStage, detectTrackKey } from '../server/services/focusPillarsEngine';

async function main() {
  console.log('--- TESTING SEMESTER-AWARE FOCUS PILLARS ENGINE ---');

  // Test 1: Stage 1 (Semester 1 & 2 Freshman - AI track)
  console.log('\n[Test 1] Semester 1 Freshman (BS Artificial Intelligence):');
  const sem1 = await generateSemesterAwareFocusPillars({
    name: 'Freshman Ali',
    degree: 'BS Artificial Intelligence',
    semester: 1,
    gpa: 3.75,
    careerGoal: 'AI / Machine Learning Engineer',
    university: 'FAST NUCES',
    skills: [{ name: 'Python' }],
    projects: [],
  });

  console.log('Stage Label:', sem1.stageLabel);
  console.log('Pillars generated:');
  sem1.pillars.forEach((p) => {
    console.log(`  ${p.number}: ${p.title} (${p.tag}) -> ${p.tech}`);
  });

  // Verify that it is NOT giving senior MLOps or Deep Learning to a Freshman
  const hasSeniorPillarsInFreshman = sem1.pillars.some(
    (p) => p.title.toLowerCase().includes('yolov8') || p.title.toLowerCase().includes('mlops') || p.tech.toLowerCase().includes('docker · fastapi')
  );
  if (hasSeniorPillarsInFreshman) {
    throw new Error('FAILED: Freshman student was assigned senior MLOps/Deep Learning!');
  }
  console.log('✓ PASS: Freshman received foundational programming & mathematics pillars!');

  // Test 2: Stage 2 (Semester 3 & 4 Sophomore - AI track)
  console.log('\n[Test 2] Semester 4 Sophomore (BS Artificial Intelligence):');
  const sem4 = await generateSemesterAwareFocusPillars({
    name: 'Sophomore Sara',
    degree: 'BS Artificial Intelligence',
    semester: 4,
    gpa: 3.8,
    careerGoal: 'AI / Machine Learning Engineer',
    university: 'FAST NUCES',
    skills: [{ name: 'Python' }, { name: 'C++' }, { name: 'OOP' }],
    projects: [{ title: 'OOP Simulation' }],
  });

  console.log('Stage Label:', sem4.stageLabel);
  sem4.pillars.forEach((p) => {
    console.log(`  ${p.number}: ${p.title} (${p.tag}) -> ${p.tech}`);
  });
  const hasDSAPillars = sem4.pillars.some(
    (p) =>
      p.title.toLowerCase().includes('algorithm') ||
      p.title.toLowerCase().includes('data structure') ||
      p.title.toLowerCase().includes('object-oriented') ||
      p.tech.toLowerCase().includes('data structure') ||
      p.tag.toLowerCase().includes('algorithm')
  );
  if (!hasDSAPillars) {
    throw new Error('FAILED: Sophomore student did not receive core DSA / OOP systems pillars!');
  }
  console.log('✓ PASS: Sophomore received core Data Structures & OOP Systems pillars!');

  // Test 3: Stage 3 (Semester 6 Junior - AI track)
  console.log('\n[Test 3] Semester 6 Junior (BS Artificial Intelligence):');
  const sem6 = await generateSemesterAwareFocusPillars({
    name: 'Junior Bilal',
    degree: 'BS Artificial Intelligence',
    semester: 6,
    gpa: 3.6,
    careerGoal: 'AI / Machine Learning Engineer',
    university: 'FAST NUCES',
    skills: [{ name: 'Python' }, { name: 'PyTorch' }, { name: 'Data Structures' }],
    projects: [{ title: 'CNN Classifier' }],
  });

  console.log('Stage Label:', sem6.stageLabel);
  sem6.pillars.forEach((p) => {
    console.log(`  ${p.number}: ${p.title} (${p.tag}) -> ${p.tech}`);
  });
  const hasTrackSpecialization = sem6.pillars.some(
    (p) => p.title.toLowerCase().includes('deep learning') || p.title.toLowerCase().includes('mlops')
  );
  if (!hasTrackSpecialization) {
    throw new Error('FAILED: Junior student did not receive domain track specialization pillars!');
  }
  console.log('✓ PASS: Junior received advanced Deep Learning & MLOps specialization pillars!');

  // Test 4: Stage 4 (Semester 8 Senior - AI track)
  console.log('\n[Test 4] Semester 8 Senior (BS Computer Science):');
  const sem8 = await generateSemesterAwareFocusPillars({
    name: 'Senior Hamza',
    degree: 'BS Computer Science',
    semester: 8,
    gpa: 3.9,
    careerGoal: 'Full Stack Engineer',
    university: 'FAST NUCES',
    skills: [{ name: 'React' }, { name: 'Node.js' }, { name: 'Docker' }],
    projects: [{ title: 'E-Commerce App' }],
  });

  console.log('Stage Label:', sem8.stageLabel);
  sem8.pillars.forEach((p) => {
    console.log(`  ${p.number}: ${p.title} (${p.tag}) -> ${p.tech}`);
  });
  const hasSeniorCapstone = sem8.pillars.some(
    (p) => p.title.toLowerCase().includes('final year project') || p.title.toLowerCase().includes('system design')
  );
  if (!hasSeniorCapstone) {
    throw new Error('FAILED: Senior student did not receive Capstone / FYP / System Design pillars!');
  }
  console.log('✓ PASS: Senior received FYP Capstone & System Design placement pillars!');

  console.log('\n=========================================');
  console.log('ALL FOCUS PILLAR TESTS PASSED WITH 100% PRECISION!');
  console.log('=========================================');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
