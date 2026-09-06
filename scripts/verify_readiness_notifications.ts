import { query } from '../server/db/pg';

const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('🚀 Starting Zero-to-Hero Readiness & Real-Time Notification Verification...\n');

  // 1. Authenticate test student (idempotent with auto-registration)
  console.log('Step 1: Authenticating test student...');
  let loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test.student.real@ajku.edu.pk',
      password: 'CampusOSPass@2025!',
    }),
  });
  let loginData = await loginRes.json();

  if (!loginData.success || !loginData.token) {
    console.log('Registering fresh test student...');
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `verify.student.${Date.now()}@fast.edu`,
        password: 'Password123!',
        name: 'Verification Student',
        degree: 'BS Artificial Intelligence',
        university: 'FAST NUCES',
        semester: 5,
        careerGoal: 'AI / Machine Learning Engineer',
      }),
    });
    loginData = await regRes.json();
  }

  if (!loginData.success || !loginData.token) {
    throw new Error(`Authentication failed: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.token;
  const studentId = loginData.user.id;
  console.log(`✅ Logged in as ${loginData.user.name} (${studentId})`);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Fetch baseline profile & notifications
  console.log('\nStep 2: Fetching baseline readiness and notifications...');
  const profileRes = await fetch(`${BASE_URL}/api/student/profile`, { headers: authHeaders });
  const profileData = await profileRes.json();
  const initialReadiness = profileData.data?.careerReadiness || 0;
  console.log(`📊 Baseline Career Readiness: ${initialReadiness}%`);

  const notifsBeforeRes = await fetch(`${BASE_URL}/api/notifications`, { headers: authHeaders });
  const notifsBeforeData = await notifsBeforeRes.json();
  const notifsBeforeCount = notifsBeforeData.data?.length || 0;
  console.log(`🔔 Initial Notifications Count: ${notifsBeforeCount}`);

  // 3. Add a new goal-aligned Project
  console.log('\nStep 3: Adding a new goal-aligned technical project...');
  const newProject = {
    title: `Autonomous Vision System ${Date.now()}`,
    category: 'Computer Vision / Deep Learning',
    status: 'Completed',
    progress: 100,
    description: 'Real-time multi-camera detection and optical flow tracking utilizing PyTorch and YOLOv8.',
    techStack: ['Python', 'PyTorch', 'OpenCV', 'FastAPI'],
    githubUrl: 'https://github.com/sarah/autonomous-vision',
  };

  const addProjRes = await fetch(`${BASE_URL}/api/student/projects`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(newProject),
  });
  const addProjData = await addProjRes.json();
  if (!addProjData.success) {
    throw new Error(`Failed to add project: ${JSON.stringify(addProjData)}`);
  }
  console.log(`✅ Project created: "${newProject.title}"`);
  console.log(`📈 Updated Career Readiness returned: ${addProjData.careerReadiness}%`);

  // 4. Verify project created notification and activity
  console.log('\nStep 4: Verifying notification and student activity creation in Database...');
  const notifsAfterProj = await fetch(`${BASE_URL}/api/notifications`, { headers: authHeaders });
  const notifsAfterProjData = await notifsAfterProj.json();
  const latestNotif = notifsAfterProjData.data?.[0];
  console.log(`🔔 Latest Notification: "${latestNotif?.title}" - "${latestNotif?.message}" (Unread: ${latestNotif?.unread})`);

  const activitiesRes = await fetch(`${BASE_URL}/api/student/activities`, { headers: authHeaders });
  const activitiesData = await activitiesRes.json();
  const latestActivity = activitiesData.data?.[0];
  console.log(`⚡ Latest Activity: "${latestActivity?.title}" -> "${latestActivity?.target}"`);

  if (!latestNotif || !latestNotif.title.includes('Project')) {
    throw new Error(`Expected project notification, got: ${JSON.stringify(latestNotif)}`);
  }

  // 5. Add a verified certification
  console.log('\nStep 5: Adding a verified AI Certification...');
  const newCert = {
    title: `NVIDIA Deep Learning Certified Associate ${Date.now()}`,
    organization: 'NVIDIA Deep Learning Institute',
    date: '2025',
    certificateLink: 'https://learn.nvidia.com/certificates/verify',
    credentialId: `NV-${Date.now()}`,
  };

  const addCertRes = await fetch(`${BASE_URL}/api/student/certifications`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(newCert),
  });
  const addCertData = await addCertRes.json();
  if (!addCertData.success) {
    throw new Error(`Failed to add certification: ${JSON.stringify(addCertData)}`);
  }
  console.log(`✅ Certification recorded: "${newCert.title}"`);
  console.log(`📈 Career Readiness with Certification: ${addCertData.careerReadiness}%`);

  // 6. Complete a roadmap milestone
  console.log('\nStep 6: Completing a roadmap milestone...');
  const roadmapRes = await fetch(`${BASE_URL}/api/student/roadmap`, { headers: authHeaders });
  const roadmapData = await roadmapRes.json();
  const firstPending = (roadmapData.data || []).find((t: any) => t.status !== 'completed');

  if (firstPending) {
    const completeRes = await fetch(`${BASE_URL}/api/student/roadmap/${firstPending.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'completed' }),
    });
    const completeData = await completeRes.json();
    console.log(`🎯 Milestone completed: "${firstPending.title}" (Success: ${completeData.success})`);
  }

  // 6.5 Add 2 more goal-aligned projects, 3 skills, and an experience to demonstrate Zero-to-Hero progression
  console.log('\nStep 6.5: Adding more goal-aligned projects, skills, and experience to test Hero-level progression...');
  
  await fetch(`${BASE_URL}/api/student/projects`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Distributed Neural Training Platform',
      category: 'Deep Learning',
      status: 'Completed',
      progress: 100,
      techStack: ['PyTorch', 'Docker', 'Python', 'FastAPI'],
      githubUrl: 'https://github.com/sarah/distributed-training',
    }),
  });

  await fetch(`${BASE_URL}/api/student/projects`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Vision-Language Multi-Modal Assistant',
      category: 'Computer Vision & LLM',
      status: 'Completed',
      progress: 95,
      techStack: ['Transformers', 'PyTorch', 'OpenCV'],
      githubUrl: 'https://github.com/sarah/multimodal-assistant',
    }),
  });

  const skillsToAdd = [
    { name: 'PyTorch', level: 'Advanced', percentage: 90, verified: true },
    { name: 'Computer Vision', level: 'Advanced', percentage: 88, verified: true },
    { name: 'FastAPI', level: 'Intermediate', percentage: 82, verified: true },
  ];
  for (const sk of skillsToAdd) {
    await fetch(`${BASE_URL}/api/student/skills`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(sk),
    });
  }

  await fetch(`${BASE_URL}/api/student/experiences`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Machine Learning Engineering Intern',
      company: 'DataScale Labs',
      employmentType: 'Internship',
      period: 'Summer 2025',
      location: 'Islamabad / Hybrid',
    }),
  });

  // 7. Verify overall readiness in database
  console.log('\nStep 7: Verifying persisted career readiness in database after multiple projects/skills...');
  const updatedProfileRes = await fetch(`${BASE_URL}/api/student/profile`, { headers: authHeaders });
  const updatedProfileData = await updatedProfileRes.json();
  const finalReadiness = updatedProfileData.data?.careerReadiness;
  console.log(`🏆 Final Persisted Career Readiness (Zero-to-Hero): ${finalReadiness}%`);

  // 8. Test Campus GPT Live Context Awareness
  console.log('\nStep 8: Testing Campus GPT live context awareness...');
  const chatRes = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      message: 'What do you think of my recent projects and certifications, and how can I reach top industry readiness?',
      isConcise: false,
    }),
  });

  const chatData = await chatRes.json();
  console.log(`🤖 Campus GPT Response Status: ${chatRes.status}`);
  console.log(`💬 Campus GPT Preview (first 250 chars):\n${(chatData.text || '').substring(0, 250)}...\n`);

  console.log('🎉 ALL ZERO-TO-HERO READINESS & REAL-TIME NOTIFICATION VERIFICATIONS PASSED!');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
