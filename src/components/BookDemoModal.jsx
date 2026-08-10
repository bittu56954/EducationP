import React, { useState } from 'react';

export const BookDemoModal = ({ isOpen, onClose, initialGrade = 'Class 10', initialProgram = 'Board Tuition', user }) => {
  const [step, setStep] = useState(1);
  const [grade, setGrade] = useState(initialGrade);
  const [program, setProgram] = useState(initialProgram);
  const [formData, setFormData] = useState({
    parentName: user?.name || '',
    phone: user?.profile?.phone || '',
    childName: '',
    preferredSlot: 'Today 5:00 PM',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    if (step === 1) setStep(2);
    else if (step === 2) {
      if (!formData.parentName.trim() || !formData.phone.trim()) {
        setError('All fields marked with * are mandatory.');
        return;
      }
      
      const lettersCount = formData.parentName.trim().replace(/[^a-zA-Z]/g, '').length;
      if (lettersCount < 4) {
        setError('Student / Parent Name must contain at least 4 letters.');
        return;
      }

      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        setError('WhatsApp phone number must be exactly 10 digits.');
        return;
      }

      // Save booking to persistent storage
      const newBooking = {
        id: `BK-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
        program,
        grade,
        studentName: formData.parentName || 'Student',
        phone: formData.phone,
        preferredSlot: formData.preferredSlot,
        bookedAt: new Date().toISOString(),
        status: 'CONFIRMED & SCHEDULED',
        teacherName: 'Dr. Sarah Jenkins (Senior Faculty)',
        studentId: user?._id || 'unknown'
      };
      
      try {
        const existing = JSON.parse(localStorage.getItem('bktc_user_bookings') || '[]');
        existing.unshift(newBooking);
        localStorage.setItem('bktc_user_bookings', JSON.stringify(existing));
      } catch (err) {
        console.error('Error saving demo booking:', err);
      }

      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setStep(1);
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="curious-modal-overlay" onClick={onClose}>
      <div className="curious-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '1.4rem',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          &times;
        </button>

        {!isSubmitted ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{
                display: 'inline-block',
                padding: '0.3rem 0.8rem',
                borderRadius: '50px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                fontSize: '0.75rem',
                fontWeight: 800,
                marginBottom: '0.6rem'
              }}>
                BK TEACHING CENTER
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
                Book Your FREE Live Demo Class! 🎓
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.3rem' }}>
                Experience interactive live online classes with BK Teaching Center expert faculty.
              </p>
            </div>

            {/* Stepper indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', background: step >= 1 ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
                1. Select Course & Grade
              </div>
              <div style={{ width: '20px', height: '2px', background: step === 2 ? '#3b82f6' : 'rgba(255,255,255,0.2)' }}></div>
              <div style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', background: step === 2 ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
                2. Contact Details
              </div>
            </div>

            {step === 1 ? (
              <form onSubmit={handleNext}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Select Program
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    {[
                      { id: 'Board Tuition', icon: '📚' },
                      { id: 'JEE Entrance Prep', icon: '⚡' },
                      { id: 'NEET Medical', icon: '🩺' },
                      { id: 'Coding & AI Apps', icon: '💻' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setProgram(item.id)}
                        style={{
                          padding: '0.8rem',
                          borderRadius: '12px',
                          border: `2px solid ${program === item.id ? '#3b82f6' : 'var(--border-color)'}`,
                          background: program === item.id ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-glass)',
                          color: program === item.id ? '#3b82f6' : 'var(--text-main)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                        {item.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Select Class / Grade
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setGrade(c)}
                        className={`grade-pill ${grade === c ? 'active' : ''}`}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="curious-btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}>
                  Continue to Book Slot &rarr;
                </button>
              </form>
            ) : (
              <form onSubmit={handleNext}>
                {error && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    {error}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Student / Parent Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      WhatsApp Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Preferred Live Class Timing
                    </label>
                    <select
                      value={formData.preferredSlot}
                      onChange={(e) => setFormData({ ...formData, preferredSlot: e.target.value })}
                    >
                      <option value="Today 5:00 PM">Today 5:00 PM - 6:00 PM</option>
                      <option value="Today 7:00 PM">Today 7:00 PM - 8:00 PM</option>
                      <option value="Tomorrow 11:00 AM">Tomorrow 11:00 AM - 12:00 PM</option>
                      <option value="Tomorrow 6:00 PM">Tomorrow 6:00 PM - 7:00 PM</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="curious-btn-outline"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    &larr; Back
                  </button>
                  <button type="submit" className="curious-btn-primary" style={{ flex: 2, justifyContent: 'center', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}>
                    Confirm FREE Demo Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontSize: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.2rem',
                border: '2px solid #10b981',
              }}
            >
              ✓
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginBottom: '0.5rem' }}>
              Free Demo Class Confirmed! 🎉
            </h2>
            <p style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>
              Thank you, {formData.parentName || 'Student'}!
            </p>
            <div
              style={{
                background: 'var(--bg-glass)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                padding: '1rem 1.2rem',
                textAlign: 'left',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Program:</span>
                <span style={{ fontWeight: 700, color: '#3b82f6' }}>{program}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Grade:</span>
                <span style={{ fontWeight: 700 }}>{grade}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span className="badge badge-student" style={{ backgroundColor: '#10b981', color: '#fff', fontWeight: 800 }}>
                  CONFIRMED & SCHEDULED
                </span>
              </div>
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)'
            }}>
              💡 <strong>Where to find your booking:</strong> Your booked demo session is now active! It will be displayed under <strong>"My Booked Sessions & Live Demos"</strong> in your Student Dashboard.
            </div>

            <button onClick={handleReset} className="curious-btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}>
              Got It & Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
