import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  Calendar, 
  FileText, 
  Plus, 
  Trash2, 
  Shield, 
  AlertCircle 
} from './Icons';

// Grade syllabus subjects map
const SYLLABUS_MAP = {
  'Nursery': ['English', 'Mathematics', 'General Awareness'],
  'LKG': ['English', 'Mathematics', 'General Awareness'],
  'UKG': ['English', 'Mathematics', 'General Awareness'],
  'Class 1': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 2': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 3': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 4': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 5': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 6': ['English', 'Mathematics', 'General Science', 'Social Science'],
  'Class 7': ['English', 'Mathematics', 'General Science', 'Social Science'],
  'Class 8': ['English', 'Mathematics', 'General Science', 'Social Science'],
  'Class 9': ['English', 'Mathematics', 'Science', 'Social Studies'],
  'Class 10': ['English', 'Mathematics', 'Science', 'Social Studies'],
  'Class 11': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
  'Class 12': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
};

export function AdminExamView({ setToast }) {
  const [activeTab, setActiveTab] = useState('forms');
  const [loading, setLoading] = useState(true);

  // Forms tab state
  const [examForms, setExamForms] = useState([]);
  const [schedulingFormId, setSchedulingFormId] = useState(null);
  const [scheduledDateInput, setScheduledDateInput] = useState('');
  const [durationMinutesInput, setDurationMinutesInput] = useState(195);
  const [selectedSubjectsInput, setSelectedSubjectsInput] = useState([]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');

  // Papers tab state
  const [examPapers, setExamPapers] = useState([]);
  const [paperGrade, setPaperGrade] = useState('Class 10');
  const [paperTitle, setPaperTitle] = useState('Class 10 Board Comprehensive Exam');
  const [paperDuration, setPaperDuration] = useState(195);
  const [paperSubjects, setPaperSubjects] = useState(['English', 'Mathematics', 'Science', 'Social Studies']);
  const [paperCustomSubject, setPaperCustomSubject] = useState('');
  const [paperQuestions, setPaperQuestions] = useState([
    {
      subject: 'English',
      questionText: 'Identify the synonym of the word "diligent":',
      options: ['Lazy', 'Hardworking', 'Careless', 'Passive'],
      correctOption: 1,
      marks: 5
    }
  ]);

  // Submissions tab state
  const [submissions, setSubmissions] = useState([]);
  const [publishingSubId, setPublishingSubId] = useState(null);
  const [remarksInput, setRemarksInput] = useState(''); 

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'forms') {
        const res = await api.exams.getAllForms();
        if (res.success) setExamForms(res.forms || []);
      } else if (activeTab === 'papers') {
        const res = await api.exams.getPapers();
        if (res.success) setExamPapers(res.papers || []);
      } else if (activeTab === 'submissions') {
        const res = await api.exams.getSubmissions();
        if (res.success) setSubmissions(res.submissions || []);
      }
    } catch (err) {
      console.error('Error loading admin exam data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Handle Exam Date Scheduling
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduledDateInput) return;
    if (!selectedSubjectsInput || selectedSubjectsInput.length === 0) {
      setToast({ message: 'Please select at least one subject for the exam.', type: 'warning' });
      return;
    }
    try {
      const res = await api.exams.scheduleExam(schedulingFormId, {
        scheduledDate: scheduledDateInput,
        durationMinutes: durationMinutesInput,
        subjects: selectedSubjectsInput
      });
      if (res.success) {
        setToast({ message: '📅 Exam scheduled with custom duration & subjects successfully!', type: 'success' });
        setSchedulingFormId(null);
        setScheduledDateInput('');
        loadData();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to schedule exam', type: 'danger' });
    }
  };

  // Add Question to Paper Form
  const addQuestion = () => {
    const subjects = paperSubjects.length > 0 ? paperSubjects : (SYLLABUS_MAP[paperGrade] || ['General']);
    setPaperQuestions([
      ...paperQuestions,
      {
        subject: subjects[0] || 'General',
        questionText: '',
        options: ['', '', '', ''],
        correctOption: 0,
        marks: 5
      }
    ]);
  };

  // Remove Question from Paper Form
  const removeQuestion = (idx) => {
    if (paperQuestions.length <= 1) {
      setToast({ message: 'Must include at least one question in the paper.', type: 'warning' });
      return;
    }
    setPaperQuestions(paperQuestions.filter((_, i) => i !== idx));
  };

  // Save/Set Paper
  const handleSavePaper = async (e) => {
    e.preventDefault();
    if (!paperSubjects || paperSubjects.length === 0) {
      setToast({ message: 'Please select at least one subject to be included in the paper.', type: 'warning' });
      return;
    }
    
    // Validation
    let valid = true;
    paperQuestions.forEach((q, i) => {
      if (!q.questionText.trim()) valid = false;
      q.options.forEach(opt => {
        if (!opt.trim()) valid = false;
      });
    });

    if (!valid) {
      setToast({ message: 'Please fill in all questions, options, and select correct options.', type: 'danger' });
      return;
    }

    try {
      const res = await api.exams.createPaper({
        grade: paperGrade,
        title: paperTitle,
        durationMinutes: paperDuration,
        subjects: paperSubjects,
        questions: paperQuestions
      });
      if (res.success) {
        setToast({ message: `📝 Question paper saved successfully for ${paperGrade} (${paperDuration} mins)!`, type: 'success' });
        loadData();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to set paper', type: 'danger' });
    }
  };

  // Publish / Upload Result
  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.exams.publishResult(publishingSubId, remarksInput);
      if (res.success) {
        setToast({ message: '✓ Result published and released to student dashboard!', type: 'success' });
        setPublishingSubId(null);
        setRemarksInput('');
        loadData();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to publish result', type: 'danger' });
    }
  };

  // Update syllabus subject lists when paper grade changes
  useEffect(() => {
    const subjects = SYLLABUS_MAP[paperGrade] || ['General'];
    setPaperSubjects(subjects);
    setPaperQuestions([
      {
        subject: subjects[0] || 'General',
        questionText: '',
        options: ['', '', '', ''],
        correctOption: 0,
        marks: 5
      }
    ]);
    setPaperTitle(`${paperGrade} Board Annual Examination`);
  }, [paperGrade]);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header section */}
      <div className="glass-panel" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span className="badge badge-student" style={{ marginBottom: '0.5rem', backgroundColor: '#a855f7', color: '#fff' }}>EXAMINATION MANAGEMENT</span>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)', margin: 0 }}>Board Exam Control Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Schedule online exams, set custom exam durations, select subjects included, build question papers, and publish results.
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1px' }}>
        <button 
          onClick={() => setActiveTab('forms')}
          className={`tab-btn ${activeTab === 'forms' ? 'active' : ''}`}
          style={{ padding: '0.75rem 1.25rem', border: 'none', borderBottom: activeTab === 'forms' ? '2px solid #3b82f6' : '2px solid transparent', backgroundColor: 'transparent', color: activeTab === 'forms' ? '#ffffff' : 'var(--text-muted)', fontWeight: activeTab === 'forms' ? 800 : 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          📁 Exam Forms ({examForms.length})
        </button>
        <button 
          onClick={() => setActiveTab('papers')}
          className={`tab-btn ${activeTab === 'papers' ? 'active' : ''}`}
          style={{ padding: '0.75rem 1.25rem', border: 'none', borderBottom: activeTab === 'papers' ? '2px solid #3b82f6' : '2px solid transparent', backgroundColor: 'transparent', color: activeTab === 'papers' ? '#ffffff' : 'var(--text-muted)', fontWeight: activeTab === 'papers' ? 800 : 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          📝 Set Question Papers & Schedules
        </button>
        <button 
          onClick={() => setActiveTab('submissions')}
          className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
          style={{ padding: '0.75rem 1.25rem', border: 'none', borderBottom: activeTab === 'submissions' ? '2px solid #3b82f6' : '2px solid transparent', backgroundColor: 'transparent', color: activeTab === 'submissions' ? '#ffffff' : 'var(--text-muted)', fontWeight: activeTab === 'submissions' ? 800 : 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          🏆 Submissions & Grading ({submissions.length})
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Exam Board Panel...</div>
      ) : (
        <div>
          {/* Tab 1: Exam Forms */}
          {activeTab === 'forms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Student Info</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Grade & Selected Subjects</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Fee Verification</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Scheduled Date & Duration</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examForms.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No student exam forms registered yet.
                        </td>
                      </tr>
                    ) : (
                      examForms.map((form) => {
                        const dateStr = form.scheduledDate ? new Date(form.scheduledDate).toLocaleString() : 'Not Scheduled';
                        const isScheduled = form.scheduledDate !== null;
                        const durationMins = form.durationMinutes || 195;
                        
                        return (
                          <tr key={form._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img src={form.student?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.student?.name}`} alt={form.student?.name} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #3b82f6' }} />
                                <div>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{form.student?.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{form.student?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span style={{ fontWeight: 800, color: '#a855f7' }}>{form.grade}</span>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                Subjects: {form.subjects && form.subjects.length > 0 ? form.subjects.join(', ') : 'All Standard Subjects'}
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: 800, color: '#10b981' }}>₹2,000.00</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                Txn: {form.transactionId}
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ color: isScheduled ? '#ffffff' : '#f59e0b', fontWeight: isScheduled ? 700 : 500 }}>{dateStr}</div>
                              <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600, marginTop: '0.2rem' }}>
                                ⏱ Duration: {durationMins} Mins ({Math.floor(durationMins / 60)}h {durationMins % 60}m)
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span className="badge" style={{
                                backgroundColor: form.status === 'Submitted' ? 'rgba(245,158,11,0.15)' : form.status === 'Scheduled' ? 'rgba(168,85,247,0.15)' : 'rgba(16,185,129,0.15)',
                                color: form.status === 'Submitted' ? '#f59e0b' : form.status === 'Scheduled' ? '#a855f7' : '#10b981',
                                fontWeight: 800
                              }}>
                                {form.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              <button 
                                className="curious-btn-primary" 
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                                onClick={() => {
                                  setSchedulingFormId(form._id);
                                  setScheduledDateInput(form.scheduledDate ? new Date(form.scheduledDate).toISOString().slice(0, 16) : new Date(Date.now() + 86400000).toISOString().slice(0, 16));
                                  setDurationMinutesInput(form.durationMinutes || 195);
                                  setSelectedSubjectsInput(form.subjects && form.subjects.length > 0 ? form.subjects : (SYLLABUS_MAP[form.grade] || ['English', 'Mathematics']));
                                }}
                              >
                                🗓 Schedule & Configure
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Scheduling Modal */}
              {schedulingFormId && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                  <div className="glass-panel" style={{ width: '90%', maxWidth: '520px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Schedule & Configure Online Exam</h3>
                      <button type="button" onClick={() => setSchedulingFormId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                    </div>
                    
                    <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      
                      {/* 1. Date & Time */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                          🗓 Exam Date & Start Time *
                        </label>
                        <input 
                          type="datetime-local" 
                          required 
                          value={scheduledDateInput} 
                          onChange={e => setScheduledDateInput(e.target.value)} 
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '8px' }}
                        />
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                          Result release is automatically scheduled for 1 month after this date.
                        </span>
                      </div>

                      {/* 2. Exam Duration */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                          ⏱ Set Exam Duration (Minutes) *
                        </label>
                        <input 
                          type="number" 
                          required 
                          min={10} 
                          max={600}
                          value={durationMinutesInput} 
                          onChange={e => setDurationMinutesInput(Number(e.target.value))} 
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '8px' }}
                        />
                        {/* Preset duration buttons */}
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                          {[
                            { label: '30m', val: 30 },
                            { label: '60m (1h)', val: 60 },
                            { label: '90m (1.5h)', val: 90 },
                            { label: '120m (2h)', val: 120 },
                            { label: '180m (3h)', val: 180 },
                            { label: '195m (3h 15m)', val: 195 }
                          ].map(preset => (
                            <button
                              key={preset.val}
                              type="button"
                              onClick={() => setDurationMinutesInput(preset.val)}
                              style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: '6px',
                                border: durationMinutesInput === preset.val ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                                backgroundColor: durationMinutesInput === preset.val ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                                color: durationMinutesInput === preset.val ? '#3b82f6' : 'var(--text-muted)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Subject Selection */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                          📚 Select Included Subjects for Exam *
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          {(SYLLABUS_MAP[examForms.find(f => f._id === schedulingFormId)?.grade] || ['English', 'Mathematics', 'Science', 'Social Studies', 'Physics', 'Chemistry', 'EVS', 'General Awareness']).map(sub => {
                            const isChecked = selectedSubjectsInput.includes(sub);
                            return (
                              <label key={sub} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', padding: '0.4rem 0.6rem', borderRadius: '6px', backgroundColor: isChecked ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.02)', border: isChecked ? '1px solid #a855f7' : '1px solid var(--border-color)', color: isChecked ? '#ffffff' : 'var(--text-muted)', cursor: 'pointer' }}>
                                <input 
                                  type="checkbox" 
                                  checked={isChecked} 
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setSelectedSubjectsInput([...selectedSubjectsInput, sub]);
                                    } else {
                                      setSelectedSubjectsInput(selectedSubjectsInput.filter(s => s !== sub));
                                    }
                                  }}
                                />
                                {sub}
                              </label>
                            );
                          })}
                        </div>
                        {/* Custom subject addition */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                            type="text" 
                            placeholder="Add custom subject (e.g. Computer Science)" 
                            value={customSubjectInput} 
                            onChange={e => setCustomSubjectInput(e.target.value)} 
                            style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customSubjectInput.trim() && !selectedSubjectsInput.includes(customSubjectInput.trim())) {
                                setSelectedSubjectsInput([...selectedSubjectsInput, customSubjectInput.trim()]);
                                setCustomSubjectInput('');
                              }
                            }}
                            className="btn-secondary"
                            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
                          >
                            + Add
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={() => setSchedulingFormId(null)} className="btn-secondary" style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem', justifyContent: 'center' }}>
                          Cancel
                        </button>
                        <button type="submit" className="curious-btn-primary" style={{ flex: 2, padding: '0.65rem', fontSize: '0.85rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6', justifyContent: 'center' }}>
                          Save & Schedule Exam
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Set Question Papers */}
          {activeTab === 'papers' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'flex-start' }}>
              
              {/* Creator Form */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>Create & Configure MCQ Question Paper</h3>
                
                <form onSubmit={handleSavePaper} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Grade / Class Select</label>
                      <select value={paperGrade} onChange={e => setPaperGrade(e.target.value)} style={{ padding: '0.6rem', fontSize: '0.85rem' }}>
                        {Object.keys(SYLLABUS_MAP).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Exam Title</label>
                      <input type="text" required value={paperTitle} onChange={e => setPaperTitle(e.target.value)} />
                    </div>
                  </div>

                  {/* Duration & Included Subjects Configuration */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                        ⏱ Exam Duration (Minutes) *
                      </label>
                      <input 
                        type="number" 
                        required 
                        min={10} 
                        max={600} 
                        value={paperDuration} 
                        onChange={e => setPaperDuration(Number(e.target.value))} 
                        style={{ padding: '0.5rem', fontSize: '0.85rem', width: '100%' }}
                      />
                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                        {[
                          { label: '30m', val: 30 },
                          { label: '60m', val: 60 },
                          { label: '90m', val: 90 },
                          { label: '120m', val: 120 },
                          { label: '180m', val: 180 },
                          { label: '195m', val: 195 }
                        ].map(p => (
                          <button
                            key={p.val}
                            type="button"
                            onClick={() => setPaperDuration(p.val)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              border: paperDuration === p.val ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                              backgroundColor: paperDuration === p.val ? 'rgba(59,130,246,0.2)' : 'transparent',
                              color: paperDuration === p.val ? '#3b82f6' : 'var(--text-muted)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                        📚 Subjects Included in Exam *
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
                        {(SYLLABUS_MAP[paperGrade] || ['General']).map(sub => {
                          const isChecked = paperSubjects.includes(sub);
                          return (
                            <label key={sub} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: isChecked ? '1px solid #a855f7' : '1px solid var(--border-color)', backgroundColor: isChecked ? 'rgba(168,85,247,0.15)' : 'transparent', color: isChecked ? '#ffffff' : 'var(--text-muted)', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={e => {
                                  if (e.target.checked) {
                                    setPaperSubjects([...paperSubjects, sub]);
                                  } else {
                                    setPaperSubjects(paperSubjects.filter(s => s !== sub));
                                  }
                                }}
                              />
                              {sub}
                            </label>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input 
                          type="text" 
                          placeholder="Custom Subject" 
                          value={paperCustomSubject} 
                          onChange={e => setPaperCustomSubject(e.target.value)} 
                          style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (paperCustomSubject.trim() && !paperSubjects.includes(paperCustomSubject.trim())) {
                              setPaperSubjects([...paperSubjects, paperCustomSubject.trim()]);
                              setPaperCustomSubject('');
                            }
                          }}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '0.5rem' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>MCQ Questions List ({paperQuestions.length})</h4>
                    <button type="button" onClick={addQuestion} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Plus size={14} /> Add Question
                    </button>
                  </div>

                  {/* Questions Builder */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {paperQuestions.map((q, idx) => {
                      const subjects = paperSubjects.length > 0 ? paperSubjects : (SYLLABUS_MAP[paperGrade] || ['General']);
                      return (
                        <div key={idx} style={{ padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button type="button" onClick={() => removeQuestion(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '90%', marginBottom: '1rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Syllabus Subject *</label>
                              <select 
                                value={q.subject} 
                                onChange={e => {
                                  const updated = [...paperQuestions];
                                  updated[idx].subject = e.target.value;
                                  setPaperQuestions(updated);
                                }}
                                style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                              >
                                {subjects.map(sub => (
                                  <option key={sub} value={sub}>{sub}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Marks Weightage</label>
                              <input 
                                type="number" 
                                required 
                                value={q.marks} 
                                onChange={e => {
                                  const updated = [...paperQuestions];
                                  updated[idx].marks = Number(e.target.value);
                                  setPaperQuestions(updated);
                                }}
                                style={{ padding: '0.45rem', fontSize: '0.8rem' }}
                              />
                            </div>
                          </div>

                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Question Text *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. Find the value of x if x + 5 = 12"
                              value={q.questionText} 
                              onChange={e => {
                                const updated = [...paperQuestions];
                                updated[idx].questionText = e.target.value;
                                setPaperQuestions(updated);
                              }}
                            />
                          </div>

                          {/* Options grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx}>
                                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Option {String.fromCharCode(65 + oIdx)} *</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={opt} 
                                  onChange={e => {
                                    const updated = [...paperQuestions];
                                    updated[idx].options[oIdx] = e.target.value;
                                    setPaperQuestions(updated);
                                  }}
                                  style={{ padding: '0.45rem', fontSize: '0.8rem' }}
                                />
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Correct Option Select:</span>
                            <div style={{ display: 'flex', gap: '0.85rem' }}>
                              {q.options.map((_, oIdx) => (
                                <label key={oIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', cursor: 'pointer', color: q.correctOption === oIdx ? '#3b82f6' : 'var(--text-muted)' }}>
                                  <input 
                                    type="radio" 
                                    name={`correct_${idx}`} 
                                    checked={q.correctOption === oIdx} 
                                    onChange={() => {
                                      const updated = [...paperQuestions];
                                      updated[idx].correctOption = oIdx;
                                      setPaperQuestions(updated);
                                    }} 
                                    style={{ cursor: 'pointer' }}
                                  />
                                  Option {String.fromCharCode(65 + oIdx)}
                                </label>
                              ))}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                  <button 
                    type="submit" 
                    className="curious-btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 800, fontSize: '0.95rem' }}
                  >
                    💾 Save Question Paper ({paperDuration} Mins Duration)
                  </button>

                </form>
              </div>

              {/* Set Papers List */}
              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  Question Papers Set ({examPapers.length})
                </h4>
                
                {examPapers.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                    No papers created yet. Use form to create one.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {examPapers.map((p) => (
                      <div 
                        key={p._id} 
                        style={{ padding: '0.85rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => {
                          setPaperGrade(p.grade);
                          setPaperTitle(p.title);
                          setPaperDuration(p.durationMinutes || 195);
                          setPaperSubjects(p.subjects && p.subjects.length > 0 ? p.subjects : (SYLLABUS_MAP[p.grade] || ['General']));
                          setPaperQuestions(p.questions);
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, color: '#3b82f6', fontSize: '0.88rem' }}>{p.grade}</span>
                          <span className="badge" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981', fontWeight: 800, fontSize: '0.7rem' }}>
                            {p.questions.length} MCQs
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Total: <strong>{p.totalMarks} Marks</strong> | ⏱ <strong>{p.durationMinutes || 195}m</strong>
                        </div>
                        {p.subjects && p.subjects.length > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#a855f7', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Subjects: {p.subjects.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 3: Submissions & Grading */}
          {activeTab === 'submissions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Student Info</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Registered Grade</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Scoring Evaluated</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Submission Time</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No student submissions found yet.
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub) => {
                        const dateStr = sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'Recent';
                        
                        return (
                          <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img src={sub.student?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.student?.name}`} alt={sub.student?.name} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #3b82f6' }} />
                                <div>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{sub.student?.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.student?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#a855f7' }}>
                              {sub.grade}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{sub.obtainedMarks} / {sub.totalMarks} Marks</div>
                              <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>
                                {sub.percentage}% ({sub.percentage >= 33 ? 'PASS' : 'FAIL'})
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                              {dateStr}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span className="badge" style={{
                                backgroundColor: sub.isPublished ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                color: sub.isPublished ? '#10b981' : '#f59e0b',
                                fontWeight: 800
                              }}>
                                {sub.isPublished ? '✓ Released' : '⏳ Processing'}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              <button 
                                className="curious-btn-primary" 
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                                onClick={() => {
                                  setPublishingSubId(sub._id);
                                  setRemarksInput(sub.remarks || '');
                                }}
                              >
                                📜 Publish Result
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Publish Modal */}
              {publishingSubId && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                  <div className="glass-panel" style={{ width: '90%', maxWidth: '440px', padding: '2rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', textAlign: 'center', marginBottom: '0.5rem' }}>Publish & Release Grade Report</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.2rem' }}>
                      This will finalize evaluation remarks and make the printable card visible to the student immediately.
                    </p>
                    
                    <form onSubmit={handlePublishSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Instructor Feedback / Remarks</label>
                        <textarea 
                          rows={3} 
                          required 
                          placeholder="e.g. Excellent performance in Mathematics! Maintain this focus." 
                          value={remarksInput} 
                          onChange={e => setRemarksInput(e.target.value)} 
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={() => setPublishingSubId(null)} className="btn-secondary" style={{ flex: 1, padding: '0.55rem', fontSize: '0.85rem', justifyContent: 'center' }}>
                          Cancel
                        </button>
                        <button type="submit" className="curious-btn-primary" style={{ flex: 2, padding: '0.55rem', fontSize: '0.85rem', backgroundColor: '#10b981', borderColor: '#10b981', justifyContent: 'center' }}>
                          Release Report Card
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
