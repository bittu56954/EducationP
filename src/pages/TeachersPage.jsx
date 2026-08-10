import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TeacherCard } from '../components/TeacherCard';
import { TeacherDetailModal } from '../components/TeacherDetailModal';
import { Search, Filter, Users, Sparkles } from '../components/Icons';

export function TeachersPage({ onViewCourse }) {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [expFilter, setExpFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    async function loadTeachersData() {
      try {
        const [teachersRes, coursesRes] = await Promise.all([
          api.getTeachers(),
          api.getCourses()
        ]);
        setTeachers(teachersRes.users || []);
        setCourses(coursesRes.courses || []);
      } catch (err) {
        console.error('Error loading teachers page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeachersData();
  }, []);

  const filteredTeachers = teachers.filter(t => {
    const prof = t.profile || {};
    const matchesSearch = 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (prof.qualification && prof.qualification.toLowerCase().includes(search.toLowerCase())) ||
      (prof.bio && prof.bio.toLowerCase().includes(search.toLowerCase())) ||
      (prof.skills && prof.skills.some(s => s.toLowerCase().includes(search.toLowerCase())));

    let matchesExp = true;
    const exp = prof.experienceYears || 5;
    if (expFilter === '5-8') matchesExp = exp >= 5 && exp <= 8;
    if (expFilter === '9-12') matchesExp = exp >= 9 && exp <= 12;
    if (expFilter === '13+') matchesExp = exp >= 13;

    let matchesSkill = true;
    if (skillFilter !== 'all') {
      matchesSkill = prof.skills && prof.skills.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
    }

    return matchesSearch && matchesExp && matchesSkill;
  });

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage) || 1;
  const paginatedTeachers = filteredTeachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          <Users size={16} /> CERTIFIED FACULTY & TECH LEADERS
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: 'var(--text-main)', fontWeight: 800 }}>
          Meet Our 30 Expert Instructors
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Learn directly from senior full-stack architects, principal cloud engineers, AI research leads, and UI/UX design directors with 5 to 18+ years of industry experience.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input 
            type="text" 
            placeholder="Search 30 teachers by name, qualification, or skill..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{ paddingLeft: '2.3rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select 
            value={expFilter} 
            onChange={e => { setExpFilter(e.target.value); setCurrentPage(1); }}
            style={{ width: '180px' }}
          >
            <option value="all">All Experience Levels</option>
            <option value="5-8">5 - 8 Years Exp</option>
            <option value="9-12">9 - 12 Years Exp</option>
            <option value="13+">13+ Years Exp</option>
          </select>

          <select 
            value={skillFilter} 
            onChange={e => { setSkillFilter(e.target.value); setCurrentPage(1); }}
            style={{ width: '180px' }}
          >
            <option value="all">All Tech Disciplines</option>
            <option value="React">React & Frontend</option>
            <option value="Node.js">Node.js & Microservices</option>
            <option value="Python">Python & AI/ML</option>
            <option value="AWS">AWS & Cloud</option>
            <option value="Figma">Figma & Design</option>
            <option value="Flutter">Flutter & Mobile</option>
            <option value="Ethical Hacking">Cybersecurity</option>
          </select>
        </div>
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading 30 dynamic instructors...</div>
      ) : filteredTeachers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No teachers match your search filter criteria. Try resetting your search.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {paginatedTeachers.map(teacher => (
              <TeacherCard 
                key={teacher._id} 
                teacher={teacher} 
                onSelectTeacher={(t) => setSelectedTeacher(t)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button 
                className="btn-secondary" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, padding: '0.5rem 1rem' }}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
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
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1, padding: '0.5rem 1rem' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Teacher Detail Modal */}
      <TeacherDetailModal 
        teacher={selectedTeacher}
        isOpen={Boolean(selectedTeacher)}
        onClose={() => setSelectedTeacher(null)}
        courses={courses}
        onViewCourse={onViewCourse}
      />

    </div>
  );
}
