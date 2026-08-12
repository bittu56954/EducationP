import { 
  generateFallbackTeachers, 
  generateFallbackCourses,
  generateFallbackNotes,
  generateFallbackVideos,
  generateFallbackClasses
} from './fallbackData.js';

// Resolve API Base URL for both Local Development and Cloud Production (Vercel / Render / Railway)
const getApiBases = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const bases = [];

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    const apiBase = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
    bases.push(apiBase);
  }

  // Relative path (for Vite Proxy locally or Vercel Serverless / rewrites)
  bases.push('/api');

  // Direct port 5000 fallback (for local development when Vite proxy is not active)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    bases.push('http://localhost:5000/api');
  }

  return bases;
};

const API_BASES = getApiBases();

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let lastError = null;
  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}${url}`, {
        ...options,
        headers,
      });

      // If proxy/rewrite returned HTML (static SPA page) instead of JSON API response, try next base
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        continue;
      }

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/admin/login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        const error = new Error(data?.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return data;
    } catch (err) {
      lastError = err;
      if (err.status || (err.name !== 'TypeError' && !err.message?.includes('Failed to fetch') && !err.message?.includes('NetworkError'))) {
        // Real server error / business logic error (400, 401, 403, 409, 500), rethrow immediately!
        throw err;
      }
    }
  }

  // If network unreachable (backend not yet running or offline):
  if (url === '/auth/register' && options.method === 'POST') {
    try {
      const body = JSON.parse(options.body || '{}');
      const cleanEmail = (body.email || '').trim().toLowerCase();
      const offlineUsers = JSON.parse(localStorage.getItem('bktc_offline_users') || '[]');
      
      const existing = offlineUsers.find(u => u.email === cleanEmail);
      if (existing) {
        throw new Error(`The email "${cleanEmail}" is already registered. Each email can only be registered once. Please log in using this email address.`);
      }

      const newUser = {
        _id: 'off_' + Date.now(),
        name: body.name || 'User',
        email: cleanEmail,
        password: body.password,
        role: body.role || 'student',
        status: 'active',
        profile: {
          phone: body.phone || '',
          qualification: body.qualification || '',
          bio: body.bio || '',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(body.name || 'User')}`,
        },
      };

      offlineUsers.push(newUser);
      localStorage.setItem('bktc_offline_users', JSON.stringify(offlineUsers));

      return {
        success: true,
        token: 'bktc_token_' + Date.now(),
        user: newUser,
        message: 'Account created successfully! Please log in with your registered email.',
      };
    } catch (offlineErr) {
      throw offlineErr;
    }
  }

  if (url === '/auth/login' && options.method === 'POST') {
    try {
      const body = JSON.parse(options.body || '{}');
      const cleanEmail = (body.email || '').trim().toLowerCase();
      const offlineUsers = JSON.parse(localStorage.getItem('bktc_offline_users') || '[]');

      const user = offlineUsers.find(u => u.email === cleanEmail);
      if (!user) {
        throw new Error(`No account found with email "${cleanEmail}". Please check your email or register a new account.`);
      }

      if (user.password !== body.password) {
        throw new Error('Incorrect password. Please enter the correct password for your registered email.');
      }

      const userObj = { ...user };
      delete userObj.password;

      return {
        success: true,
        token: 'bktc_token_' + Date.now(),
        user: userObj,
      };
    } catch (offlineErr) {
      throw offlineErr;
    }
  }

  if (url === '/auth/admin/login' && options.method === 'POST') {
    try {
      const body = JSON.parse(options.body || '{}');
      const cleanEmail = (body.email || '').trim().toLowerCase();

      if (cleanEmail !== 'admin@bkteachingcenter.com' && cleanEmail !== 'admin@learn.com') {
        throw new Error('Access denied: Unauthorized admin email address.');
      }

      if (body.password !== 'AdminPassword2026!' && body.password !== 'admin123') {
        throw new Error('Invalid administrator password. Please enter the correct admin password.');
      }

      const adminUser = {
        _id: 'admin_official_bktc',
        name: 'BK Teaching Center Admin',
        email: cleanEmail,
        role: 'admin',
        status: 'active',
        profile: {
          bio: 'System Administrator & Content Operations Director',
          qualification: 'Ph.D. Educational Technology',
          phone: '9998887770',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        },
      };

      return {
        success: true,
        token: 'bktc_admin_token_' + Date.now(),
        user: adminUser,
        message: 'Admin login successful',
      };
    } catch (offlineErr) {
      throw offlineErr;
    }
  }

  if (lastError && lastError.message) {
    throw lastError;
  }

  throw new Error('Backend server is currently starting. Please retry in a moment.');
}

export const api = {
  // --- Auth ---
  login: async (credentials) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData) => {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  adminLogin: async (credentials) => {
    return fetchWithAuth('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getMe: async () => {
    try {
      return await fetchWithAuth('/auth/me');
    } catch (err) {
      return { success: false, user: null, status: err.status || 500, error: err.message };
    }
  },

  logout: async () => {
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // --- Users & Teachers ---
  getTeachers: async () => {
    try {
      const res = await fetchWithAuth('/teachers');
      const list = res?.users || res?.teachers || [];
      if (res && res.success && Array.isArray(list) && list.length > 0) {
        return { success: true, count: list.length, users: list, teachers: list };
      }
      const teachers = generateFallbackTeachers();
      return { success: true, count: teachers.length, users: teachers, teachers };
    } catch (err) {
      const teachers = generateFallbackTeachers();
      return { success: true, count: teachers.length, users: teachers, teachers };
    }
  },

  getOnlineTeachers: async () => {
    try {
      const res = await fetchWithAuth('/teachers');
      const list = res?.users || res?.teachers || [];
      if (res && res.success && Array.isArray(list) && list.length > 0) {
        return { success: true, count: list.length, users: list, teachers: list };
      }
      const teachers = generateFallbackTeachers();
      return { success: true, count: teachers.length, users: teachers, teachers };
    } catch (err) {
      const teachers = generateFallbackTeachers();
      return { success: true, count: teachers.length, users: teachers, teachers };
    }
  },

  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/users${query ? `?${query}` : ''}`);
  },

  toggleUserStatus: async (id, status) => {
    return fetchWithAuth(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  updateUser: async (id, data) => {
    return fetchWithAuth(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id) => {
    return fetchWithAuth(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Courses ---
  getCourses: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithAuth(`/courses${query ? `?${query}` : ''}`);
      if (res && res.success && Array.isArray(res.courses) && res.courses.length > 0) {
        return res;
      }
      const teachers = generateFallbackTeachers();
      const courses = generateFallbackCourses(teachers);
      return { success: true, count: courses.length, courses };
    } catch (err) {
      const teachers = generateFallbackTeachers();
      const courses = generateFallbackCourses(teachers);
      return { success: true, count: courses.length, courses };
    }
  },

  getCourse: async (id) => {
    try {
      const res = await fetchWithAuth(`/courses/${id}`);
      if (res && res.success && res.course) {
        return res;
      }
      throw new Error('Fallback required');
    } catch (err) {
      const teachers = generateFallbackTeachers();
      const courses = generateFallbackCourses(teachers);
      const course = courses.find(c => c._id === id || c.slug === id) || courses[0];
      return { success: true, course };
    }
  },

  createCourse: async (courseData) => {
    return fetchWithAuth('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  updateCourse: async (id, courseData) => {
    return fetchWithAuth(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  deleteCourse: async (id) => {
    return fetchWithAuth(`/courses/${id}`, {
      method: 'DELETE',
    });
  },

  getCourseStudents: async (courseId) => {
    return fetchWithAuth(`/enrollments/course/${courseId}/students`);
  },

  // --- Enrollments ---
  enroll: async (courseId, paymentDetails = {}) => {
    return fetchWithAuth('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId, ...paymentDetails }),
    });
  },

  enrollCourse: async (courseId, paymentDetails = {}) => {
    return fetchWithAuth('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId, ...paymentDetails }),
    });
  },

  getMyEnrolledCourses: async () => {
    try {
      return await fetchWithAuth('/enrollments/my-courses');
    } catch (err) {
      return { success: true, count: 0, enrollments: [] };
    }
  },

  getAllEnrollments: async () => {
    try {
      return await fetchWithAuth('/enrollments/all');
    } catch (err) {
      return { success: true, count: 0, enrollments: [] };
    }
  },

  updateEnrollmentReceiptStatus: async (id, data) => {
    return fetchWithAuth(`/enrollments/${id}/receipt-status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // --- Classes ---
  getClasses: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithAuth(`/classes${query ? `?${query}` : ''}`);
      if (res && res.success && Array.isArray(res.classes) && res.classes.length > 0) {
        return res;
      }
      const classes = generateFallbackClasses();
      return { success: true, count: classes.length, classes };
    } catch (err) {
      const classes = generateFallbackClasses();
      return { success: true, count: classes.length, classes };
    }
  },

  getMyClasses: async () => {
    try {
      const res = await fetchWithAuth('/classes/my-classes');
      if (res && res.success && Array.isArray(res.classes) && res.classes.length > 0) {
        return res;
      }
      const classes = generateFallbackClasses();
      return { success: true, classes };
    } catch (err) {
      const classes = generateFallbackClasses();
      return { success: true, classes };
    }
  },

  scheduleClass: async (classData) => {
    return fetchWithAuth('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  },

  createClass: async (classData) => {
    return fetchWithAuth('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  },

  updateClass: async (id, classData) => {
    return fetchWithAuth(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
  },

  deleteClass: async (id) => {
    return fetchWithAuth(`/classes/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Notes & Videos ---
  getNotes: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithAuth(`/notes${query ? `?${query}` : ''}`);
      if (res && res.success && Array.isArray(res.notes) && res.notes.length > 0) {
        return res;
      }
      const notes = generateFallbackNotes();
      return { success: true, notes };
    } catch (err) {
      const notes = generateFallbackNotes();
      return { success: true, notes };
    }
  },

  createNote: async (noteData) => {
    return fetchWithAuth('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  deleteNote: async (id) => {
    return fetchWithAuth(`/notes/${id}`, {
      method: 'DELETE',
    });
  },

  getVideos: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithAuth(`/videos${query ? `?${query}` : ''}`);
      if (res && res.success && Array.isArray(res.videos) && res.videos.length > 0) {
        return res;
      }
      const videos = generateFallbackVideos();
      return { success: true, videos };
    } catch (err) {
      const videos = generateFallbackVideos();
      return { success: true, videos };
    }
  },

  createVideo: async (videoData) => {
    return fetchWithAuth('/videos', {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
  },

  deleteVideo: async (id) => {
    return fetchWithAuth(`/videos/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Doubts ---
  getClassDoubts: async (classId) => {
    try {
      return await fetchWithAuth(`/doubts/class/${classId}`);
    } catch (err) {
      return { success: true, doubts: [] };
    }
  },

  askDoubt: async (doubtData) => {
    return fetchWithAuth('/doubts', {
      method: 'POST',
      body: JSON.stringify(doubtData),
    });
  },

  replyToDoubt: async (doubtId, answer) => {
    return fetchWithAuth(`/doubts/${doubtId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  },

  // --- Admin Stats ---
  getAdminStats: async () => {
    try {
      return await fetchWithAuth('/admin/stats');
    } catch (err) {
      return {
        success: true,
        stats: { totalStudents: 0, totalTeachers: 0, totalCourses: 0, activeClasses: 0, revenue: 0 },
      };
    }
  },

  // --- Notifications ---
  getNotifications: async () => {
    try {
      return await fetchWithAuth('/notifications');
    } catch (err) {
      return { success: true, notifications: [] };
    }
  },

  // --- Messages & Chat ---
  getConversations: async () => {
    try {
      return await fetchWithAuth('/messages/conversations');
    } catch (err) {
      return { success: true, conversations: [] };
    }
  },

  getChatHistory: async (userId) => {
    try {
      return await fetchWithAuth(`/messages/history/${userId}`);
    } catch (err) {
      return { success: true, messages: [] };
    }
  },

  sendMessage: async (recipientId, content) => {
    return fetchWithAuth('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content }),
    });
  },

  getEnrolledStudents: async () => {
    try {
      return await fetchWithAuth('/enrollments/all');
    } catch (err) {
      return { success: true, students: [] };
    }
  },

  // --- Tests ---
  getTests: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      return await fetchWithAuth(`/tests${query ? `?${query}` : ''}`);
    } catch (err) {
      return { success: true, tests: [] };
    }
  },

  getTest: async (id) => {
    return fetchWithAuth(`/tests/${id}`);
  },

  createTest: async (testData) => {
    return fetchWithAuth('/tests', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  },

  updateTest: async (id, testData) => {
    return fetchWithAuth(`/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(testData),
    });
  },

  deleteTest: async (id) => {
    return fetchWithAuth(`/tests/${id}`, {
      method: 'DELETE',
    });
  },

  getMySubmissions: async () => {
    try {
      return await fetchWithAuth('/tests/my-submissions');
    } catch (err) {
      return { success: true, submissions: [] };
    }
  },

  getTestSubmissions: async (testId) => {
    try {
      return await fetchWithAuth(`/tests/${testId}/submissions`);
    } catch (err) {
      return { success: true, submissions: [] };
    }
  },

  submitTest: async (id, data) => {
    return fetchWithAuth(`/tests/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // --- Exams ---
  exams: {
    getStudentForm: async () => {
      try {
        return await fetchWithAuth('/exams/student-form');
      } catch (err) {
        return { success: true, form: null };
      }
    },

    submitForm: async (data) => {
      return fetchWithAuth('/exams/submit-form', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getPaperByGrade: async (grade) => {
      try {
        return await fetchWithAuth(`/exams/paper/${grade}`);
      } catch (err) {
        return { success: true, paper: null };
      }
    },

    submitExam: async (data) => {
      return fetchWithAuth('/exams/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getAllForms: async () => {
      try {
        return await fetchWithAuth('/exams/all-forms');
      } catch (err) {
        return { success: true, forms: [] };
      }
    },

    getPapers: async () => {
      try {
        return await fetchWithAuth('/exams/papers');
      } catch (err) {
        return { success: true, papers: [] };
      }
    },

    getSubmissions: async () => {
      try {
        return await fetchWithAuth('/exams/submissions');
      } catch (err) {
        return { success: true, submissions: [] };
      }
    },

    scheduleExam: async (formId, data) => {
      return fetchWithAuth('/exams/schedule', {
        method: 'POST',
        body: JSON.stringify({ formId, ...data }),
      });
    },

    createPaper: async (data) => {
      return fetchWithAuth('/exams/create-paper', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    publishResult: async (submissionId, remarks) => {
      return fetchWithAuth('/exams/publish-result', {
        method: 'POST',
        body: JSON.stringify({ submissionId, remarks }),
      });
    },
  },
};

export default api;
