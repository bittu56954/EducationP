import mongoose from 'mongoose';
import { User } from './Model/User.js';
import { Course } from './Model/Course.js';
import { Enrollment } from './Model/Enrollment.js';
import { Class } from './Model/Class.js';
import { Notification } from './Model/Notification.js';
import { Note } from './Model/Note.js';
import { Video } from './Model/Video.js';
import { hashPassword } from './utils/password.js';

let isSeedingInProgress = false;

export async function seedDatabase() {
  if (isSeedingInProgress) return;
  isSeedingInProgress = true;

  try {
    if (mongoose.connection.readyState !== 1) {
      isSeedingInProgress = false;
      return;
    }

    const adminPasswordHash = hashPassword('AdminPassword2026!');
    const defaultPasswordHash = hashPassword('123456');

    // Always ensure Admin User exists with real, verified email & updated credentials
    await User.findOneAndUpdate(
      { email: 'admin@bkteachingcenter.com' },
      {
        name: 'BK Teaching Center Admin',
        email: 'admin@bkteachingcenter.com',
        password: adminPasswordHash,
        role: 'admin',
        status: 'active',
        isVerified: true,
        profile: {
          bio: 'System Administrator & Content Operations Director',
          qualification: 'Ph.D. Educational Technology',
          phone: '9998887770',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        },
      },
      { upsert: true, new: true }
    );

    // Also clean up any extra admin accounts
    await User.deleteMany({ role: 'admin', email: { $ne: 'admin@bkteachingcenter.com' } });
    await User.deleteMany({ email: 'admin@learn.com' });

    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();

    if (userCount >= 5 && courseCount >= 50) {
      isSeedingInProgress = false;
      return;
    }

    console.log('⚡ Populating database with Admin, 30 Teachers, 200 Courses, Students, Classes, Notes & Videos (Fast Bulk Batch)...');

    // Clear existing partial collections
    await User.deleteMany({ email: { $ne: 'admin@bkteachingcenter.com' } });
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await Class.deleteMany({});
    await Notification.deleteMany({});
    await Note.deleteMany({});
    await Video.deleteMany({});

    // 1. 30 TEACHERS
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

    const sampleAvatars = [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
    ];

    const teacherData = teacherNames.map((name, idx) => {
      const title = teacherTitles[idx % teacherTitles.length];
      const exp = 5 + (idx % 14);
      const email = idx === 0 ? 'teacher@learn.com' : idx === 1 ? 'alex.teacher@learn.com' : `teacher${idx + 1}@learn.com`;

      return {
        name,
        email,
        password: defaultPasswordHash,
        role: 'teacher',
        status: 'active',
        profile: {
          bio: `${title} with over ${exp} years of industry experience teaching thousands of professionals worldwide.`,
          qualification: `${title}, ${exp}+ Yrs Experience`,
          phone: `98765432${(10 + idx).toString().padStart(2, '0')}`,
          avatar: sampleAvatars[idx % sampleAvatars.length],
        },
      };
    });

    const teacherDocs = await User.insertMany(teacherData);

    // 2. STUDENTS
    const studentData = [
      {
        name: 'John Doe',
        email: 'student@learn.com',
        password: defaultPasswordHash,
        role: 'student',
        status: 'active',
        profile: {
          bio: 'Aspiring Web Developer working hard on MERN stack apps.',
          phone: '9876543290',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        },
      },
      {
        name: 'Emily Chen',
        email: 'emily.student@learn.com',
        password: defaultPasswordHash,
        role: 'student',
        status: 'active',
        profile: {
          bio: 'Computer Science sophomore exploring React and Machine Learning.',
          phone: '9876543291',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        },
      },
    ];

    const studentDocs = await User.insertMany(studentData);
    const student1 = studentDocs[0];

    // 3. 200 COURSES
    const courseTemplates = [
      { title: 'Full-Stack Web Development Mastery (MERN)', category: 'Web Development', topics: ['React 19', 'Node.js', 'Express.js', 'MongoDB', 'JWT Auth'] },
      { title: 'Next.js 15 & React Server Components Masterclass', category: 'Web Development', topics: ['App Router', 'Server Actions', 'Prisma', 'Tailwind', 'Vercel Deployment'] },
      { title: 'Modern TypeScript & Enterprise Frontend Architecture', category: 'Web Development', topics: ['Generics', 'Utility Types', 'Zod', 'State Management', 'Testing'] },
      { title: 'Vue.js 3 & Pinia Full-Stack Ecosystem', category: 'Web Development', topics: ['Composition API', 'Pinia', 'Vue Router', 'Vite', 'Nuxt.js'] },
      { title: 'GraphQL & Apollo Client Masterclass', category: 'Web Development', topics: ['Schema Design', 'Mutations', 'Subscriptions', 'Caching', 'Apollo Server'] },
      { title: 'Python for Data Science & Machine Learning Bootcamp', category: 'Data Science', topics: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-Learn', 'Feature Engineering'] },
      { title: 'Deep Learning & Neural Networks with PyTorch 2.0', category: 'Data Science', topics: ['CNNs', 'RNNs', 'Transformers', 'Model Deployment', 'PyTorch Lightning'] },
      { title: 'Large Language Models (LLMs) & LangChain Engineering', category: 'Data Science', topics: ['RAG Systems', 'Vector DBs', 'OpenAI API', 'Llama 3', 'Prompt Tuning'] },
      { title: 'Data Analytics & SQL Database Querying Masterclass', category: 'Data Science', topics: ['Complex Joins', 'Window Functions', 'PowerBI', 'BigQuery', 'ETL Pipelines'] },
      { title: 'Advanced Microservices Architecture with Node.js & Docker', category: 'Backend Development', topics: ['Docker', 'Kubernetes', 'gRPC', 'RabbitMQ', 'Event-Driven Arch'] },
      { title: 'Go (Golang) High Performance Backend Systems', category: 'Backend Development', topics: ['Goroutines', 'Channels', 'Gin Framework', 'PostgreSQL', 'Redis Caching'] },
      { title: 'AWS Cloud Solutions Architect Certification Course', category: 'Backend Development', topics: ['EC2', 'S3', 'Lambda', 'DynamoDB', 'VPC Architecture'] },
      { title: 'Java Spring Boot 3 & Hibernate Microservices', category: 'Backend Development', topics: ['Spring Cloud', 'REST API', 'Security', 'Kafka', 'PostgreSQL'] },
      { title: 'React Native & Expo Cross-Platform App Development', category: 'Mobile Development', topics: ['Native Navigation', 'Reanimated 3', 'Push Notifications', 'App Store Deploy'] },
      { title: 'Flutter & Dart Masterclass: Build iOS & Android Apps', category: 'Mobile Development', topics: ['State Management (Bloc)', 'Firebase', 'Custom Animations', 'REST APIs'] },
      { title: 'UI/UX Design Systems & Figma Prototyping Masterclass', category: 'Design', topics: ['Auto-Layout', 'Design Tokens', 'User Research', 'Wireframing', 'Figma Variants'] },
      { title: 'Modern Motion Design & Interactive UI Animations', category: 'Design', topics: ['Framer Motion', 'Lottie', 'Principle', 'UI Transitions', 'Micro-interactions'] },
      { title: 'Ethical Hacking & Penetration Testing Bootcamp', category: 'Cybersecurity', topics: ['Kali Linux', 'Metasploit', 'Nmap', 'Web Vulnerabilities (OWASP)', 'Network Hacking'] }
    ];

    const courseThumbnails = [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80'
    ];

    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    const courseData = [];

    for (let i = 0; i < 200; i++) {
      const template = courseTemplates[i % courseTemplates.length];
      const teacherDoc = teacherDocs[i % teacherDocs.length];
      const title = i < courseTemplates.length ? template.title : `${template.title} - Series ${Math.floor(i / courseTemplates.length) + 1}`;
      const level = levels[i % levels.length];
      const price = (29 + (i % 12) * 10) * 80;
      const duration = `${10 + (i % 25)} hours`;

      courseData.push({
        title,
        description: `Comprehensive industry course covering ${template.topics.join(', ')}. Includes hands-on projects, real-world case studies, and certificate of completion.`,
        category: template.category,
        level,
        price,
        duration,
        image: courseThumbnails[i % courseThumbnails.length],
        teacher: teacherDoc._id,
        rating: Number((4.5 + (i % 5) * 0.1).toFixed(1)),
        studentsCount: 150 + (i * 23) % 3500,
        syllabus: [
          'Module 1: Foundations & Architecture Setup',
          'Module 2: Advanced Topics & State Management',
          'Module 3: Real-World Industry Projects',
        ],
      });
    }

    const courseDocs = await Course.insertMany(courseData);

    // 4. INITIAL ENROLLMENTS
    if (courseDocs.length >= 2) {
      await Enrollment.insertMany([
        {
          student: student1._id,
          course: courseDocs[0]._id,
          status: 'active',
          enrolledAt: new Date(),
        },
        {
          student: student1._id,
          course: courseDocs[1]._id,
          status: 'active',
          enrolledAt: new Date(),
        },
      ]);
    }

    // 5. CLASSES
    await Class.insertMany([
      {
        title: 'Live Q&A: Building RESTful APIs with Express & Mongo',
        description: 'Interactive live session covering JWT authentication, MongoDB schemas, and CORS handling.',
        course: courseDocs[0]._id,
        teacher: teacherDocs[0]._id,
        joinUrl: 'https://meet.google.com/abc-defg-hij',
        startTime: new Date(Date.now() + 86400000),
        durationMinutes: 60,
        status: 'upcoming',
      },
      {
        title: 'Python Data Science Live Workshop & Q&A',
        description: 'Hands-on live coding of classification models using Scikit-Learn.',
        course: courseDocs[5]._id,
        teacher: teacherDocs[1]._id,
        joinUrl: 'https://zoom.us/j/9876543210',
        startTime: new Date(Date.now() + 172800000),
        durationMinutes: 90,
        status: 'upcoming',
      },
    ]);

    // 6. NOTIFICATIONS
    await Notification.insertMany([
      {
        user: student1._id,
        title: 'Welcome to BK TEACHING CENTER! 🚀',
        message: 'Explore 200+ top rated courses taught by 30+ expert instructors.',
        type: 'info',
        isRead: false,
      },
    ]);

    // 7. CLASS NOTES
    await Note.insertMany([
      {
        title: 'REST API Design & Authentication Cheat Sheet',
        description: 'Comprehensive PDF guide on JWT authentication, security best practices, and status codes.',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        subject: 'Full-Stack Web Development',
        course: courseDocs[0]._id,
        teacher: teacherDocs[0]._id,
      },
      {
        title: 'Python Data Science NumPy & Pandas Essentials',
        description: 'Handwritten instructor notes on data frames, indexing, and linear algebra routines.',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        subject: 'Data Science & Machine Learning',
        course: courseDocs[5]._id,
        teacher: teacherDocs[1]._id,
      },
    ]);

    // 8. RECORDED VIDEOS
    await Video.insertMany([
      {
        title: 'Complete RESTful API Architecture & Authentication',
        description: 'Full lecture recording covering Express middleware, JWT tokens, and Mongo database operations.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '1h 25m',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
        subject: 'Full-Stack Web Development',
        course: courseDocs[0]._id,
        teacher: teacherDocs[0]._id,
      },
      {
        title: 'Machine Learning Models Deep Dive with Python',
        description: 'Detailed recorded workshop on decision trees, random forests, and hyperparameter tuning.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '1h 45m',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
        subject: 'Data Science & Machine Learning',
        course: courseDocs[5]._id,
        teacher: teacherDocs[1]._id,
      },
    ]);

    console.log('✅ Database seeded successfully with Admin, Teachers, Students, Courses, Classes, Notes, and Recorded Videos!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    isSeedingInProgress = false;
  }
}

