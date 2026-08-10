import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CourseCard } from '../components/CourseCard';
import { ClassCard } from '../components/ClassCard';
import { TeacherCard } from '../components/TeacherCard';
import { CourseDetailModal } from '../components/CourseDetailModal';
import { TeacherDetailModal } from '../components/TeacherDetailModal';

// Components
import { CuriousJrHero } from '../components/CuriousJrHero';
import { KeyHighlightsBar } from '../components/KeyHighlightsBar';
import { ProgramCatalog } from '../components/ProgramCatalog';
import { InteractiveSandbox } from '../components/InteractiveSandbox';
import { FeatureShowcase } from '../components/FeatureShowcase';
import { OlympiadRankers } from '../components/OlympiadRankers';
import { CurriculumBreakdown } from '../components/CurriculumBreakdown';
import { BookDemoModal } from '../components/BookDemoModal';

export function LandingPage({ onOpenAuth, setCurrentView, user, onEnrollCourse }) {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Demo Modal State
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoGrade, setDemoGrade] = useState('Class 10');
  const [demoProgram, setDemoProgram] = useState('Board Tuition');

  // Course Details Modals
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    async function loadPublicData() {
      try {
        const [coursesRes, classesRes, teachersRes] = await Promise.all([
          api.getCourses(),
          api.getClasses({ status: 'upcoming' }),
          api.getTeachers()
        ]);
        setCourses(coursesRes.courses || []);
        setClasses(classesRes.classes || []);
        setTeachers(teachersRes.users || []);
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicData();
  }, []);

  const handleOpenDemoModal = (grade = 'Class 10', program = 'Board Tuition') => {
    if (!user) {
      if (onOpenAuth) onOpenAuth('register');
      return;
    }
    setDemoGrade(grade);
    setDemoProgram(program);
    setIsDemoModalOpen(true);
  };

  const scrollToPrograms = () => {
    const el = document.getElementById('learning-programs');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEnrollClick = (course) => {
    if (user) {
      if (onEnrollCourse) onEnrollCourse(course);
    } else {
      if (onOpenAuth) onOpenAuth('login');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem', paddingTop: '4.8rem' }}>
      
      {/* 1. Hero Section */}
      <CuriousJrHero 
        onOpenDemoModal={handleOpenDemoModal} 
        onScrollToPrograms={scrollToPrograms} 
        setCurrentView={setCurrentView}
      />

      {/* 2. Key Highlights Bar */}
      <KeyHighlightsBar />

      {/* 3. Program Catalog Filterable by Grade */}
      <ProgramCatalog onOpenDemoModal={handleOpenDemoModal} />

      {/* 4. Interactive Live Sandbox (Block Coding & Math Sandbox) */}
      <InteractiveSandbox onOpenDemoModal={handleOpenDemoModal} />

      {/* 5. Features Showcase (Two-Teacher Model, 24x7 Mentors) */}
      <FeatureShowcase />

      {/* 6. Olympiad Rankers & Hall of Fame */}
      <OlympiadRankers />

      {/* 7. Live Upcoming Classes & Dynamic Courses */}
      <section style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            padding: '0.35rem 0.9rem',
            borderRadius: '50px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            color: '#3b82f6',
            fontSize: '0.85rem',
            fontWeight: 800,
            marginBottom: '0.6rem'
          }}>
            Live Batches & Classroom Sessions
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--text-main)' }}>
            Upcoming Live <span style={{ color: '#3b82f6' }}>Interactive Classes 🎥</span>
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            Loading BK Teaching Center live batches...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {classes.slice(0, 3).map((cls) => (
              <ClassCard 
                key={cls._id} 
                classItem={cls} 
                onJoin={() => setCurrentView ? setCurrentView('online-class') : handleOpenDemoModal(cls.grade || 'Class 10', cls.title)} 
              />
            ))}

            {courses.slice(0, 3).map((c) => (
              <CourseCard
                key={c._id}
                course={c}
                user={user}
                onViewDetails={setSelectedCourse}
                onEnroll={handleEnrollClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* 8. Curriculum Breakdown & FAQ Section */}
      <CurriculumBreakdown onOpenDemoModal={handleOpenDemoModal} />

      {/* 9. Book Free Demo Class Modal */}
      <BookDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        initialGrade={demoGrade}
        initialProgram={demoProgram}
        user={user}
      />

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEnroll={handleEnrollClick}
        />
      )}

      {/* Teacher Detail Modal */}
      {selectedTeacher && (
        <TeacherDetailModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
        />
      )}
    </div>
  );
}
