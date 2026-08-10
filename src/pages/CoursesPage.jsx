import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CourseCard } from '../components/CourseCard';
import { CourseDetailModal } from '../components/CourseDetailModal';
import { CourseStudyHubModal } from '../components/CourseStudyHubModal';
import { Search, Filter, BookOpen, Sparkles } from '../components/Icons';

export function CoursesPage({ onOpenAuth, onEnrollCourse, user }) {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [priceSort, setPriceSort] = useState('default');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studyHubCourse, setStudyHubCourse] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const loadPageData = async () => {
    try {
      const coursesRes = await api.getCourses();
      setCourses(coursesRes.courses || []);

      if (user) {
        const enrolledRes = await api.getMyEnrolledCourses();
        const enrollments = enrolledRes.enrolledCourses || enrolledRes.enrollments || [];
        const ids = enrollments.map(e => e.course?._id || e.courseId || e._id || (typeof e.course === 'string' ? e.course : null)).filter(Boolean);
        setEnrolledCourseIds(ids);
      } else {
        setEnrolledCourseIds([]);
      }
    } catch (err) {
      console.error('Error fetching courses page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [user]);

  // Filter & Sort Logic
  const filteredCourses = courses.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(search.toLowerCase()) || 
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      (c.topics && c.topics.some(t => t.toLowerCase().includes(search.toLowerCase())));

    const matchesCategory = category === 'all' || c.category.toLowerCase() === category.toLowerCase();
    const matchesLevel = level === 'all' || c.level.toLowerCase() === level.toLowerCase();

    return matchesSearch && matchesCategory && matchesLevel;
  }).sort((a, b) => {
    if (priceSort === 'low-high') return a.price - b.price;
    if (priceSort === 'high-low') return b.price - a.price;
    if (priceSort === 'rating') return b.rating - a.rating;
    return 0;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEnrollClick = (course) => {
    if (user) {
      if (enrolledCourseIds.includes(course._id)) {
        setStudyHubCourse(course);
      } else if (onEnrollCourse) {
        onEnrollCourse(course);
      }
    } else {
      if (onOpenAuth) onOpenAuth('login');
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Header Banner */}
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--primary-glow)',
          border: '1px solid var(--border-glow)',
          padding: '0.35rem 0.9rem',
          borderRadius: 'var(--radius-full)',
          color: 'var(--primary)',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          <BookOpen size={16} /> COMPREHENSIVE CURRICULUM CATALOG
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: 'var(--text-main)', fontWeight: 800 }}>
          Explore 200+ Dynamic Courses
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Master full-stack web development, AI engineering, cloud microservices, mobile app development, and cybersecurity with structured syllabi and capstone projects.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input 
            type="text" 
            placeholder="Search 200+ courses by title, topic, or tech stack..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{ paddingLeft: '2.3rem' }}
          />
        </div>

        {/* Dropdowns */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select 
            value={category} 
            onChange={e => { setCategory(e.target.value); setCurrentPage(1); }}
            style={{ width: '170px' }}
          >
            <option value="all">All Categories</option>
            <option value="Web Development">Web Development</option>
            <option value="Data Science">Data Science</option>
            <option value="Backend Development">Backend Dev</option>
            <option value="Mobile Development">Mobile Dev</option>
            <option value="Design">UI/UX Design</option>
            <option value="Cybersecurity">Cybersecurity</option>
          </select>

          <select 
            value={level} 
            onChange={e => { setLevel(e.target.value); setCurrentPage(1); }}
            style={{ width: '150px' }}
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select 
            value={priceSort} 
            onChange={e => setPriceSort(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="default">Featured Sort</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Courses Results Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <span>Showing <strong>{filteredCourses.length}</strong> courses</span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading 200+ dynamic courses...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No courses found matching your criteria. Try adjusting your search query or filters.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {paginatedCourses.map(course => {
              const isPurchased = enrolledCourseIds.includes(course._id);
              return (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                  isEnrolled={isPurchased}
                  user={user}
                  onEnroll={handleEnrollClick}
                  onViewDetails={(c) => {
                    if (isPurchased) setStudyHubCourse(c);
                    else setSelectedCourse(c);
                  }}
                />
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <button 
                className="btn-secondary" 
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, padding: '0.5rem 1rem' }}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                Math.max(0, currentPage - 3), 
                Math.min(totalPages, currentPage + 2)
              ).map(page => (
                <button
                  key={page}
                  onClick={() => { setCurrentPage(page); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    backgroundColor: currentPage === page ? 'var(--primary)' : 'var(--bg-glass)',
                    color: '#fff',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {page}
                </button>
              ))}

              <button 
                className="btn-secondary" 
                disabled={currentPage === totalPages}
                onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1, padding: '0.5rem 1rem' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Course Detail Modal */}
      <CourseDetailModal 
        course={selectedCourse}
        isOpen={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
        onEnroll={handleEnrollClick}
        isEnrolled={selectedCourse ? enrolledCourseIds.includes(selectedCourse._id) : false}
        user={user}
      />

      {/* Interactive Course Study Hub Modal for Purchased Courses */}
      <CourseStudyHubModal 
        course={studyHubCourse}
        isOpen={Boolean(studyHubCourse)}
        onClose={() => setStudyHubCourse(null)}
      />

    </div>
  );
}
