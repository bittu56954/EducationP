import { generateFallbackTeachers, generateFallbackCourses } from './fallbackData.js';

const API_BASE = 'http://localhost:5000/api';

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({ success: false, message: 'Invalid JSON response from server' }));
    if (!response.ok) {
      if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/admin/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Backend server is currently unreachable. Please check connection.');
    }
    throw err;
  }
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
      return { success: false, user: null };
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
      return await fetchWithAuth('/teachers');
    } catch (err) {
      const teachers = generateFallbackTeachers();
      return { success: true, count: teachers.length, teachers };
    }
  },

  getOnlineTeachers: async () => {
    try {
      return await fetchWithAuth('/teachers');
    } catch (err) {
      const teachers = generateFallbackTeachers();
      return { success: true, teachers };
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
      return await fetchWithAuth(`/courses${query ? `?${query}` : ''}`);
    } catch (err) {
      const teachers = generateFallbackTeachers();
      const courses = generateFallbackCourses(teachers);
      return { success: true, count: courses.length, courses };
    }
  },

  getCourse: async (id) => {
    return fetchWithAuth(`/courses/${id}`);
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
      return await fetchWithAuth(`/classes${query ? `?${query}` : ''}`);
    } catch (err) {
      return { success: true, classes: [] };
    }
  },

  getMyClasses: async () => {
    try {
      return await fetchWithAuth('/classes/my-classes');
    } catch (err) {
      return { success: true, classes: [] };
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
      return await fetchWithAuth(`/notes${query ? `?${query}` : ''}`);
    } catch (err) {
      return { success: true, notes: [] };
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
      return await fetchWithAuth(`/videos${query ? `?${query}` : ''}`);
    } catch (err) {
      return { success: true, videos: [] };
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
