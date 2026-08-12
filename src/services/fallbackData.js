// Local fallback data generator for 30 Teachers & 200 Courses with localStorage persistence

const teacherTitles = [
  'Senior Full-Stack Architect', 'Lead AI Research Engineer', 'Principal Cloud Solutions Architect',
  'UI/UX Design Director', 'Senior Mobile Tech Lead', 'Cybersecurity Specialist & Ethical Hacker',
  'Data Science Director', 'DevOps & Kubernetes Specialist', 'Frontend Systems Architect',
  'Backend & Microservices Lead', 'Embedded Systems Lead', 'Blockchain & Web3 Architect',
  'Database Engineering Lead', 'Machine Learning Research Lead', 'Product Design Lead'
];

const teacherNames = [
  'Dr. Sarah Jenkins', 'Prof. Alex Rivera', 'Marcus Vance', 'Elena Rostova', 'David K. Miller',
  'Priya Sharma', 'Lucas Meyer', 'Sophia Chen', 'Jonathan Reed', 'Amara Okafor',
  'Carlos Mendez', 'Hannah Abbott', 'Vikram Patel', 'Chloe Dubois', 'Liam Gallagher',
  'Zoe Takahashi', 'Gabriel Santos', 'Aisha Khan', 'Benjamin Hayes', 'Nadia Petrov',
  'Daniel Kim', 'Maya Lin', 'Christopher Cole', 'Fatima Al-Mansoor', 'Oliver Bennett',
  'Samantha Wright', 'Tariq Hassan', 'Rachel Green', 'Ethan Thorne', 'Jessica Alba'
];

const teacherSkillsPool = [
  ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Next.js'],
  ['Python', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Pandas'],
  ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Go'],
  ['Figma', 'UI/UX', 'Design Systems', 'User Research', 'Prototyping'],
  ['React Native', 'Flutter', 'iOS Swift', 'Android Kotlin'],
  ['Ethical Hacking', 'Penetration Testing', 'Network Security', 'Linux'],
  ['GraphQL', 'PostgreSQL', 'Redis', 'System Design', 'Microservices'],
  ['Vue.js', 'Tailwind CSS', 'WebSockets', 'JavaScript', 'HTML5/CSS3'],
  ['Java', 'Spring Boot', 'Kafka', 'SQL', 'Microservices'],
  ['Rust', 'WebAssembly', 'C++', 'High Performance Computing']
];

const sampleAvatars = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
];

export function generateFallbackTeachers() {
  return teacherNames.map((name, idx) => {
    const title = teacherTitles[idx % teacherTitles.length];
    const skills = teacherSkillsPool[idx % teacherSkillsPool.length];
    const exp = 5 + (idx % 14);
    return {
      _id: `usr_teacher_${idx + 1}`,
      name,
      email: idx === 0 ? 'teacher@learn.com' : `teacher${idx + 1}@bkteaching.com`,
      role: 'teacher',
      status: 'active',
      profile: {
        bio: `${title} at BK TEACHING CENTER with over ${exp} years of industry experience teaching thousands of professionals worldwide.`,
        qualification: `${title}, ${exp}+ Yrs Experience`,
        phone: `+1 (${Math.floor(200 + Math.random() * 800)}) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        avatar: sampleAvatars[idx % sampleAvatars.length],
        skills,
        experienceYears: exp,
        rating: (4.7 + (idx % 4) * 0.1).toFixed(1)
      },
      createdAt: new Date(Date.now() - (idx + 1) * 86400000).toISOString()
    };
  });
}

export function generateFallbackCourses(teachers) {
  const categories = ['Web Development', 'Data Science', 'Backend Development', 'Mobile Development', 'Design', 'Cybersecurity'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  
  const courseTemplates = [
    { title: 'Full-Stack Web Development Mastery (MERN)', category: 'Web Development', topics: ['React 19', 'Node.js', 'Express.js', 'MongoDB', 'JWT Auth'], thumb: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80' },
    { title: 'Next.js 15 & React Server Components Masterclass', category: 'Web Development', topics: ['App Router', 'Server Actions', 'Prisma', 'Tailwind', 'Vercel Deployment'], thumb: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80' },
    { title: 'Modern TypeScript & Enterprise Frontend Architecture', category: 'Web Development', topics: ['Generics', 'Utility Types', 'Zod', 'State Management', 'Testing'], thumb: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80' },
    { title: 'Vue.js 3 & Pinia Full-Stack Ecosystem', category: 'Web Development', topics: ['Composition API', 'Pinia', 'Vue Router', 'Vite', 'Nuxt.js'], thumb: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&auto=format&fit=crop&q=80' },
    { title: 'GraphQL & Apollo Client Masterclass', category: 'Web Development', topics: ['Schema Design', 'Mutations', 'Subscriptions', 'Caching', 'Apollo Server'], thumb: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&auto=format&fit=crop&q=80' },
    { title: 'Python for Data Science & Machine Learning Bootcamp', category: 'Data Science', topics: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-Learn', 'Feature Engineering'], thumb: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80' },
    { title: 'Deep Learning & Neural Networks with PyTorch 2.0', category: 'Data Science', topics: ['CNNs', 'RNNs', 'Transformers', 'Model Deployment', 'PyTorch Lightning'], thumb: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80' },
    { title: 'Large Language Models (LLMs) & LangChain Engineering', category: 'Data Science', topics: ['RAG Systems', 'Vector DBs', 'OpenAI API', 'Llama 3', 'Prompt Tuning'], thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80' },
    { title: 'Data Analytics & SQL Database Querying Masterclass', category: 'Data Science', topics: ['Complex Joins', 'Window Functions', 'PowerBI', 'BigQuery', 'ETL Pipelines'], thumb: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80' },
    { title: 'Advanced Microservices Architecture with Node.js & Docker', category: 'Backend Development', topics: ['Docker', 'Kubernetes', 'gRPC', 'RabbitMQ', 'Event-Driven Arch'], thumb: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=600&auto=format&fit=crop&q=80' },
    { title: 'Go (Golang) High Performance Backend Systems', category: 'Backend Development', topics: ['Goroutines', 'Channels', 'Gin Framework', 'PostgreSQL', 'Redis Caching'], thumb: 'https://images.unsplash.com/photo-1516116211223-4c7141467477?w=600&auto=format&fit=crop&q=80' },
    { title: 'AWS Cloud Solutions Architect Certification Course', category: 'Backend Development', topics: ['EC2', 'S3', 'Lambda', 'DynamoDB', 'VPC Architecture'], thumb: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80' },
    { title: 'Java Spring Boot 3 & Hibernate Microservices', category: 'Backend Development', topics: ['Spring Cloud', 'REST API', 'Security', 'Kafka', 'PostgreSQL'], thumb: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80' },
    { title: 'React Native & Expo Cross-Platform App Development', category: 'Mobile Development', topics: ['Native Navigation', 'Reanimated 3', 'Push Notifications', 'App Store Deploy'], thumb: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80' },
    { title: 'Flutter & Dart Masterclass: Build iOS & Android Apps', category: 'Mobile Development', topics: ['State Management (Bloc)', 'Firebase', 'Custom Animations', 'REST APIs'], thumb: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&auto=format&fit=crop&q=80' },
    { title: 'UI/UX Design Systems & Figma Prototyping Masterclass', category: 'Design', topics: ['Auto-Layout', 'Design Tokens', 'User Research', 'Wireframing', 'Figma Variants'], thumb: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80' },
    { title: 'Modern Motion Design & Interactive UI Animations', category: 'Design', topics: ['Framer Motion', 'Lottie', 'Principle', 'UI Transitions', 'Micro-interactions'], thumb: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop&q=80' },
    { title: 'Ethical Hacking & Penetration Testing Bootcamp', category: 'Cybersecurity', topics: ['Kali Linux', 'Metasploit', 'Nmap', 'Web Vulnerabilities (OWASP)', 'Network Hacking'], thumb: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80' }
  ];

  return Array.from({ length: 200 }, (_, i) => {
    const template = courseTemplates[i % courseTemplates.length];
    const teacher = teachers[i % teachers.length];
    const category = template.category;
    const level = levels[i % levels.length];
    const price = (29 + (i % 14) * 10) * 80;
    const duration = `${12 + (i % 24)} hours`;
    const lessonsCount = 14 + (i % 28);
    const rating = (4.6 + (i % 5) * 0.1).toFixed(1);
    const enrolledCount = 200 + (i * 27) % 3800;

    const syllabus = [
      { 
        moduleTitle: 'Module 1: Fundamentals & Core Architecture', 
        lessons: [
          'Course Orientation & Development Environment Setup (45 mins)',
          'Core Syntax & Essential Programming Concepts (60 mins)',
          'Building Your First Working Application (90 mins)'
        ] 
      },
      { 
        moduleTitle: 'Module 2: Advanced Design Patterns & Performance', 
        lessons: [
          'Deep Dive into Modern Best Practices & Patterns (75 mins)',
          'State Optimization, Caching & Data Flow (60 mins)',
          'Error Handling, Logging & Security Hardening (90 mins)'
        ] 
      },
      { 
        moduleTitle: 'Module 3: Enterprise Capstone Project & Cloud Deployment', 
        lessons: [
          'Designing & Implementing Production REST/GraphQL APIs (120 mins)',
          'Role-Based Authorization & JWT Session Management (90 mins)',
          'Continuous Integration & Cloud Infrastructure Deployment (60 mins)'
        ] 
      }
    ];

    return {
      _id: `crs_${i + 1}`,
      title: i < courseTemplates.length ? template.title : `${template.title} (Level ${Math.floor(i / courseTemplates.length) + 1})`,
      description: `Comprehensive industry course covering ${template.topics.join(', ')}. Taught at BK TEACHING CENTER with real-world capstone projects, hands-on mentorship, and an accredited certificate of completion.`,
      category,
      level,
      price,
      duration,
      lessonsCount,
      thumbnail: template.thumb,
      teacherId: teacher._id,
      teacher: { _id: teacher._id, name: teacher.name, email: teacher.email, avatar: teacher.profile.avatar, qualification: teacher.profile.qualification },
      topics: template.topics,
      syllabus,
      rating,
      enrolledStudentsCount: enrolledCount,
      published: true,
      createdAt: new Date(Date.now() - (i + 1) * 3600000 * 5).toISOString()
    };
  });
}

export function getFallbackData() {
  const teachers = generateFallbackTeachers();
  const courses = generateFallbackCourses(teachers);

  const classes = [
    {
      _id: 'cls_live_01',
      title: 'Full-Stack MERN Architecture: Live Code Review & Debugging',
      subject: 'Web Development',
      description: 'Real-time interactive session on building production MERN APIs, async middleware, and token refresh.',
      courseId: 'crs_1',
      courseTitle: 'Full-Stack Web Development Mastery (MERN)',
      teacherId: 'usr_teacher_1',
      teacherName: 'Dr. Sarah Jenkins',
      joinUrl: 'https://meet.google.com/abc-defg-hij',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      platform: 'Google Meet',
      startTime: new Date(Date.now() - 15 * 60000).toISOString(),
      scheduledAt: new Date(Date.now() - 15 * 60000).toISOString(),
      durationMinutes: 90,
      status: 'live'
    },
    {
      _id: 'cls_up_01',
      title: 'Live Q&A: Building RESTful APIs with Express & Mongo',
      subject: 'Backend Engineering',
      description: 'Interactive live session covering JWT authentication, MongoDB schemas, and CORS handling.',
      courseId: 'crs_1',
      courseTitle: 'Full-Stack Web Development Mastery (MERN)',
      teacherId: 'usr_teacher_1',
      teacherName: 'Dr. Sarah Jenkins',
      joinUrl: 'https://meet.google.com/abc-defg-hij',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      platform: 'Google Meet',
      startTime: new Date(Date.now() + 3600000 * 3).toISOString(),
      scheduledAt: new Date(Date.now() + 3600000 * 3).toISOString(),
      durationMinutes: 60,
      status: 'upcoming'
    },
    {
      _id: 'cls_up_02',
      title: 'Python Data Science Live Workshop & Model Tuning',
      subject: 'Data Science & AI',
      description: 'Hands-on live coding of classification models using Scikit-Learn and hyperparameter optimization.',
      courseId: 'crs_6',
      courseTitle: 'Python for Data Science & Machine Learning Bootcamp',
      teacherId: 'usr_teacher_2',
      teacherName: 'Prof. Alex Rivera',
      joinUrl: 'https://zoom.us/j/9876543210',
      meetingLink: 'https://zoom.us/j/9876543210',
      platform: 'Zoom',
      startTime: new Date(Date.now() + 86400000).toISOString(),
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      durationMinutes: 90,
      status: 'upcoming'
    },
    {
      _id: 'cls_comp_01',
      title: 'React 19 Hooks & Server Components Foundations',
      subject: 'Frontend Engineering',
      description: 'Completed masterclass recording on useActionState, useOptimistic, and Server Actions.',
      courseId: 'crs_2',
      courseTitle: 'Next.js 15 & React Server Components Masterclass',
      teacherId: 'usr_teacher_3',
      teacherName: 'Marcus Vance',
      joinUrl: 'https://meet.google.com/xyz-uvwx-rst',
      meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
      platform: 'Google Meet',
      startTime: new Date(Date.now() - 86400000 * 2).toISOString(),
      scheduledAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      durationMinutes: 75,
      status: 'completed'
    }
  ];

  const notes = [
    {
      _id: 'not_1',
      title: 'Full-Stack MERN Architecture & State Optimization Handbook',
      subject: 'Web Development',
      courseTitle: 'Full-Stack Web Development Mastery (MERN)',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pages: 42,
      fileSize: '4.2 MB',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'not_2',
      title: 'Python for Data Science, Scikit-Learn & Math Foundations',
      subject: 'Data Science & AI',
      courseTitle: 'Python for Data Science & Machine Learning Bootcamp',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pages: 58,
      fileSize: '6.8 MB',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'not_3',
      title: 'Cloud Native Microservices, Kubernetes & CI/CD Pipelines Guide',
      subject: 'Cloud & DevOps',
      courseTitle: 'Cloud Native Microservices Architecture',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pages: 35,
      fileSize: '3.5 MB',
      createdAt: new Date().toISOString()
    }
  ];

  const videos = [
    {
      _id: 'vid_1',
      title: 'Session 1: React 19 Hooks & Concurrent Rendering Deep-Dive',
      subject: 'Web Development',
      courseTitle: 'Full-Stack Web Development Mastery (MERN)',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: '45 mins',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'vid_2',
      title: 'Session 2: Express Serverless Optimization on Vercel & MongoDB Atlas',
      subject: 'Backend Engineering',
      courseTitle: 'Next.js 15 & React Server Components Masterclass',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: '52 mins',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    }
  ];

  return { teachers, courses, classes, notes, videos };
}

export function generateFallbackNotes() {
  return getFallbackData().notes;
}

export function generateFallbackVideos() {
  return getFallbackData().videos;
}

export function generateFallbackClasses() {
  return getFallbackData().classes;
}

