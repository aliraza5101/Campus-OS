// Centralized API Client for Campus OS

const BASE_URL = '/api';

export function getToken(): string | null {
  return localStorage.getItem('campus_os_token');
}

export function setToken(token: string) {
  localStorage.setItem('campus_os_token', token);
}

export function removeToken() {
  localStorage.removeItem('campus_os_token');
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

// -------------------------------------------------------------
// Authentication API
// -------------------------------------------------------------
export const authApi = {
  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: any) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  googleLogin: (payload?: { email?: string; name?: string; avatar?: string }) =>
    request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),

  getMe: () => request('/auth/me'),


  changePassword: (currentPassword: string, newPassword: string) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  logout: () => {
    removeToken();
    return request('/auth/logout', { method: 'POST' }).catch(() => {});
  },
};

// -------------------------------------------------------------
// Student API
// -------------------------------------------------------------
export const studentApi = {
  getProfile: () => request('/student/profile'),

  updateProfile: (profileData: any) =>
    request('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  getSkills: () => request('/student/skills'),
  addSkill: (skill: any) =>
    request('/student/skills', {
      method: 'POST',
      body: JSON.stringify(skill),
    }),
  updateSkill: (id: string, skill: any) =>
    request(`/student/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skill),
    }),
  deleteSkill: (id: string) =>
    request(`/student/skills/${id}`, {
      method: 'DELETE',
    }),

  getProjects: () => request('/student/projects'),
  addProject: (project: any) =>
    request('/student/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    }),
  updateProject: (id: string, project: any) =>
    request(`/student/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    }),
  deleteProject: (id: string) =>
    request(`/student/projects/${id}`, {
      method: 'DELETE',
    }),

  getExperiences: () => request('/student/experiences'),
  addExperience: (experience: any) =>
    request('/student/experiences', {
      method: 'POST',
      body: JSON.stringify(experience),
    }),
  deleteExperience: (id: string) =>
    request(`/student/experiences/${id}`, {
      method: 'DELETE',
    }),

  getCertifications: () => request('/student/certifications'),
  addCertification: (cert: any) =>
    request('/student/certifications', {
      method: 'POST',
      body: JSON.stringify(cert),
    }),
  updateCertification: (id: string, cert: any) =>
    request(`/student/certifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cert),
    }),
  deleteCertification: (id: string) =>
    request(`/student/certifications/${id}`, {
      method: 'DELETE',
    }),

  updatePreferences: (preferences: any) =>
    request('/student/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }),

  uploadAvatar: (imageBase64: string, fileName?: string) =>
    request('/upload/avatar', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, fileName }),
    }),

  updateSemester: (semester: number, data: any) =>
    request(`/student/semesters/${semester}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  saveOnboarding: (onboardingData: any) =>
    request('/student/onboarding', {
      method: 'POST',
      body: JSON.stringify(onboardingData),
    }),

  getActivities: () => request('/student/activities'),
  addActivity: (activity: { type: string; title: string; target: string }) =>
    request('/student/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    }),

  getAchievements: () => request('/student/achievements'),
  unlockAchievement: (key: string) =>
    request('/student/achievements/unlock', {
      method: 'POST',
      body: JSON.stringify({ key }),
    }),

  getSkillGrowth: () => request('/student/skill-growth'),
  addSkillGrowth: (data: { month: string; year?: number; points: number }) =>
    request('/student/skill-growth', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getRoadmap: () => request('/student/roadmap'),
  addRoadmapTask: (task: any) =>
    request('/student/roadmap', {
      method: 'POST',
      body: JSON.stringify(task),
    }),
  updateRoadmapTask: (id: string, data: any) =>
    request(`/student/roadmap/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteRoadmapTask: (id: string) =>
    request(`/student/roadmap/${id}`, {
      method: 'DELETE',
    }),
  regenerateRoadmap: () =>
    request('/student/roadmap/regenerate', {
      method: 'POST',
    }),
  getFocusPillars: () => request('/student/roadmap/focus-pillars'),
  regenerateFocusPillars: () =>
    request('/student/roadmap/focus-pillars/regenerate', {
      method: 'POST',
    }),
};


// -------------------------------------------------------------
// Admin API
// -------------------------------------------------------------
export const adminApi = {
  getStudents: (params?: { search?: string; status?: string; program?: string; semester?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/admin/students${query ? `?${query}` : ''}`);
  },

  getStudentById: (id: string) => request(`/admin/students/${id}`),

  updateStudent: (id: string, data: any) =>
    request(`/admin/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getStats: () => request('/admin/stats'),

  getPlatformAnalytics: () => request('/admin/analytics'),

  getActivityLogs: () => request('/admin/activity-logs'),

  getSettings: () => request('/admin/settings'),

  updateSettings: (settings: any) =>
    request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  updateProfile: (data: any) =>
    request('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    request('/admin/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getStudentDiagnostic: (studentId: string) =>
    request(`/admin/students/${studentId}/ai-diagnostic`, {
      method: 'POST',
    }),

  getApplications: () => request('/opportunities/admin/applications'),

  updateApplicationStatus: (id: string, status: string, notes?: string) =>
    request(`/opportunities/admin/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),
};

// -------------------------------------------------------------
// Opportunities API
// -------------------------------------------------------------
export const opportunitiesApi = {
  getAll: (params?: { type?: string; search?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/opportunities${query ? `?${query}` : ''}`);
  },

  create: (data: any) =>
    request('/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/opportunities/${id}`, {
      method: 'DELETE',
    }),

  apply: (id: string, notes?: string, title?: string) =>
    request(`/opportunities/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify({ notes, title }),
    }),
};

// -------------------------------------------------------------
// Announcements API
// -------------------------------------------------------------
export const announcementsApi = {
  getAll: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/announcements${query ? `?${query}` : ''}`);
  },

  create: (data: any) =>
    request('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/announcements/${id}`, {
      method: 'DELETE',
    }),
};

// -------------------------------------------------------------
// Notifications API
// -------------------------------------------------------------
export const notificationsApi = {
  getAll: () => request('/notifications'),

  markAsRead: (id: string) =>
    request(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: () =>
    request('/notifications/read-all', {
      method: 'PUT',
    }),

  broadcast: (data: { title: string; message: string; type?: string; targetAudience?: string }) =>
    request('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// -------------------------------------------------------------
// Reports API
// -------------------------------------------------------------
export const reportsApi = {
  getAll: () => request('/reports'),
  exportStudentsUrl: '/api/reports/export/students',
};

// -------------------------------------------------------------
// Upload API
// -------------------------------------------------------------
export const uploadApi = {
  uploadAvatar: (imageBase64: string, fileName?: string) =>
    request('/upload/avatar', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, fileName }),
    }),
};

// -------------------------------------------------------------
// AI Engine API
// -------------------------------------------------------------
export const aiApi = {
  analyzeOnboarding: (data: {
    name: string;
    degree: string;
    semester: number;
    university: string;
    careerGoal: string;
    gpa: number | string;
    skills: any[];
    projects: any[];
    experiences: any[];
    relevantCoursework: string[];
  }) =>
    request('/ai/onboarding-analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};


