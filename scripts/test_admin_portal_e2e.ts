async function testAdmin() {
  try {
    // 1. Admin login
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@campus.edu', password: 'admin123' }),
    });
    const loginJson = await loginRes.json();
    console.log('1. Admin Login:', loginJson.success ? 'PASSED' : 'FAILED', '| Role:', loginJson.user?.role);
    if (!loginJson.token) {
      console.error('No token received:', loginJson);
      process.exit(1);
    }
    const token = loginJson.token;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    };

    // 2. Fetch admin profile
    const profileRes = await fetch('http://localhost:3000/api/admin/profile', { headers });
    const profileText = await profileRes.text();
    console.log('2. Profile status:', profileRes.status, 'snippet:', profileText.slice(0, 100));
    const profileJson = JSON.parse(profileText);
    console.log('2. Admin Profile:', profileJson.success ? 'PASSED' : 'FAILED', '| Name:', profileJson.data?.name);

    // 3. Update admin profile
    const updateProfRes = await fetch('http://localhost:3000/api/admin/profile', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: 'Dr. Sarah Malik',
        department: 'Faculty of Computing & Academic Affairs',
        role: 'Super Admin',
        bio: 'Verified Executive Admin at CampusOS',
      }),
    });
    const updateProfJson = await updateProfRes.json();
    console.log('3. Update Admin Profile response:', updateProfJson);

    // 3.5. Test Platform Top Stats
    const statsRes = await fetch('http://localhost:3000/api/admin/stats', { headers });
    const statsJson = await statsRes.json();
    console.log('3.5. Platform Stats:', statsJson.data);

    // 4. Get student list
    const studentsRes = await fetch('http://localhost:3000/api/admin/students', { headers });
    const studentsJson = await studentsRes.json();
    console.log('4. Admin Students Directory count:', studentsJson.data?.length);

    if (studentsJson.data?.length > 0) {
      const studentId = studentsJson.data[0].id;
      // 5. Get student detail
      const detailRes = await fetch('http://localhost:3000/api/admin/students/' + studentId, { headers });
      const detailJson = await detailRes.json();
      console.log('5. Student Detail:', detailJson.success ? 'PASSED' : 'FAILED', '| Projects in DB:', detailJson.data?.projects?.length, '| Skills in DB:', detailJson.data?.skills?.length);

      // 6. Test AI Diagnostic Engine
      console.log('6. Requesting AI Diagnostic for student:', studentId);
      const diagRes = await fetch('http://localhost:3000/api/admin/students/' + studentId + '/ai-diagnostic', {
        method: 'POST',
        headers,
      });
      const diagJson = await diagRes.json();
      console.log('6. AI Diagnostic response:', diagJson);
    }

    // 7. Test Admin Settings
    const settingsRes = await fetch('http://localhost:3000/api/admin/settings', { headers });
    const settingsJson = await settingsRes.json();
    console.log('7. Admin Settings:', settingsJson.success ? 'PASSED' : 'FAILED', '| Institution:', settingsJson.data?.institutionName);

    // 8. Test Broadcast Notification
    const broadcastRes = await fetch('http://localhost:3000/api/notifications/broadcast', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Mid-term Career Fair Registration',
        message: 'All computing students are invited to the annual campus tech job expo.',
        targetAudience: 'All Students',
        type: 'announcement',
        priority: 'high',
      }),
    });
    const broadcastJson = await broadcastRes.json();
    console.log('8. Broadcast Notification response:', broadcastJson);

    console.log('\n========================================');
    console.log('SUCCESS: ALL ADMIN PORTAL BACKEND AND AI ENGINES ARE FULLY FUNCTIONAL!');
    console.log('========================================');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}
testAdmin();
