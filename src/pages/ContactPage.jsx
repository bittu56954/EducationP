import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle, HelpCircle, User, BookOpen } from '../components/Icons';

export function ContactPage({ onOpenAuth, setToast }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    courseInterest: 'All Courses',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Live Advisor Handshake connection state
  const [testingConnection, setTestingConnection] = useState(false);
  const [advisorLatency, setAdvisorLatency] = useState(null);

  const handleTestConnection = () => {
    setTestingConnection(true);
    setAdvisorLatency(null);
    setTimeout(() => {
      setTestingConnection(false);
      setAdvisorLatency(Math.floor(Math.random() * 85) + 35); // simulated ping 35ms - 120ms
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.message.trim()) {
      if (setToast) setToast({ message: 'All fields are mandatory. Please fill in name, email, phone number, and message.', type: 'danger' });
      return;
    }

    const nameLetters = formData.name.trim().replace(/[^a-zA-Z]/g, '').length;
    if (nameLetters < 4) {
      if (setToast) setToast({ message: 'Name must contain at least 4 letters.', type: 'danger' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      if (setToast) setToast({ message: 'Please enter a valid email address.', type: 'danger' });
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      if (setToast) setToast({ message: 'Mobile phone number must be exactly 10 digits.', type: 'danger' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      if (setToast) setToast({ message: 'Thank you! Your message has been sent to BK Teaching Center team.', type: 'success' });
    }, 800);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'General Inquiry',
      courseInterest: 'All Courses',
      message: ''
    });
    setSubmitted(false);
    setAdvisorLatency(null);
  };

  const faqs = [
    {
      q: "How do I enroll my child in BK Teaching Center courses?",
      a: "You can easily enroll by selecting a course from our Courses page, clicking 'Enroll Now', or by contacting our admission desk at +91 98765 43210. You can also book a free trial class."
    },
    {
      q: "Are live classes available for online students?",
      a: "Yes! BK Teaching Center provides interactive live online classes with real-time doubt solving, recorded lecture archives, and weekly progress assessments."
    },
    {
      q: "What age groups and classes do you cater to?",
      a: "We offer tailored programs for students from Grade 1 through Grade 12, covering school boards (CBSE, ICSE, State Boards) as well as competitive entrance exam prep (JEE, NEET, Olympiads)."
    },
    {
      q: "What are your center timing and batch schedules?",
      a: "Our physical center operates Monday through Saturday from 8:00 AM to 8:00 PM. Online classes are scheduled during flexible evening hours to fit student schedules."
    }
  ];

  return (
    <div style={{ paddingTop: '5.5rem', minHeight: '100vh', backgroundColor: 'var(--bg-dark)' }}>
      {/* Header Banner */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderBottom: '1px solid var(--border-color)',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-block',
            padding: '0.35rem 1rem',
            borderRadius: '50px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            color: '#3b82f6',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: '1rem',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            GET IN TOUCH WITH US
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Contact <span style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BK Teaching Center</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
            Have questions about our courses, live classes, fee structure, or enrollment process? Our dedicated academic advisors are here to help you.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* Contact Information Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: 'var(--shadow-main)'
            }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MessageSquare size={24} style={{ color: '#3b82f6' }} /> Contact Details
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '2.8rem',
                    height: '2.8rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Main Campus Address</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                      BK Teaching Center, Knowledge Hub Campus, Plot 42, Academic Boulevard, Sector 14, New Delhi - 110001
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '2.8rem',
                    height: '2.8rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Phone size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Phone & WhatsApp</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                      Admissions: +91 98765 43210<br />
                      Support: +91 98765 43211
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '2.8rem',
                    height: '2.8rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Mail size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Email Helpdesk</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                      admissions@bkteachingcenter.com<br />
                      info@bkteachingcenter.com
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '2.8rem',
                    height: '2.8rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Operational Hours</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                      Monday – Saturday: 8:00 AM – 8:00 PM<br />
                      Sunday: 10:00 AM – 4:00 PM (Counseling Only)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Callback / advisor status component */}
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '20px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="glowing-badge-primary" style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}>
                  ⚡
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Academic Advisor: Online</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Response Latency &lt; 3 mins</span>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(9, 13, 22, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.85rem'
              }}>
                {testingConnection ? (
                  <span style={{ color: 'var(--text-muted)' }}>Pinging counselor endpoint node...</span>
                ) : advisorLatency !== null ? (
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    Ping Response: {advisorLatency}ms (Secure WebSocket Link Established! ✅)
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-dim)' }}>Handshake Ping status: idle. Click below to test.</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="curious-btn-outline"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  justifyContent: 'center',
                  width: '100%',
                  borderRadius: '10px'
                }}
              >
                {testingConnection ? 'Analyzing Link...' : 'Test Advisor Node Link Status 🌐'}
              </button>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-main)'
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto'
                }}>
                  <CheckCircle size={38} />
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Message Received!
                </h3>
                <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '450px', margin: '0 auto 1.8rem auto' }}>
                  Thank you for reaching out to <strong>BK Teaching Center</strong>. Our academic team has received your inquiry and will contact you shortly.
                </p>
                <button
                  onClick={handleReset}
                  className="curious-btn-primary"
                  style={{ padding: '0.7rem 1.8rem', borderRadius: '10px' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  Send Us a Message
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Fill in your details below and we will get back to you promptly.
                </p>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      placeholder="Enter Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="interactive-input"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.6rem',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-dark)',
                        color: 'var(--text-main)',
                        fontSize: '0.92rem'
                      }}
                    />
                    <User size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                      Email Address *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        required
                        placeholder="Enter Your Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="interactive-input"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.6rem',
                          borderRadius: '10px',
                          backgroundColor: 'var(--bg-dark)',
                          color: 'var(--text-main)',
                          fontSize: '0.92rem'
                        }}
                      />
                      <Mail size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                      Phone Number *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        required
                        placeholder="Enter Your Mobile No"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="interactive-input"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.6rem',
                          borderRadius: '10px',
                          backgroundColor: 'var(--bg-dark)',
                          color: 'var(--text-main)',
                          fontSize: '0.92rem'
                        }}
                      />
                      <Phone size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="interactive-input"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-dark)',
                        color: 'var(--text-main)',
                        fontSize: '0.92rem'
                      }}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="New Admission">New Admission</option>
                      <option value="Live Online Classes">Live Online Classes</option>
                      <option value="Fee Details">Fee Structure</option>
                      <option value="Technical Support">Technical Support</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                      Course Interest
                    </label>
                    <select
                      value={formData.courseInterest}
                      onChange={(e) => setFormData({ ...formData, courseInterest: e.target.value })}
                      className="interactive-input"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-dark)',
                        color: 'var(--text-main)',
                        fontSize: '0.92rem'
                      }}
                    >
                      <option value="All Courses">All Courses</option>
                      <option value="CBSE / ICSE Board Prep">Board Prep (Class 6-12)</option>
                      <option value="JEE Main & Advanced">JEE Entrance Prep</option>
                      <option value="NEET Medical Prep">NEET Medical Prep</option>
                      <option value="Coding & Robotics">Coding & Robotics</option>
                      <option value="Olympiad Foundation">Olympiad Foundation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you would like to know or schedule a counseling session..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="interactive-input"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-dark)',
                      color: 'var(--text-main)',
                      fontSize: '0.92rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="curious-btn-primary"
                  style={{
                    padding: '0.85rem',
                    fontSize: '1rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    marginTop: '0.5rem',
                    cursor: loading ? 'wait' : 'pointer'
                  }}
                >
                  {loading ? 'Sending Message...' : (
                    <>
                      <Send size={18} /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div style={{ marginTop: '4.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              Quick answers to common questions about BK Teaching Center
            </p>
          </div>

          <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '1.2rem 1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeFaq === idx ? '0 0 15px rgba(59, 130, 246, 0.1)' : 'none',
                  borderColor: activeFaq === idx ? '#3b82f6' : 'var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <HelpCircle size={20} style={{ color: '#3b82f6', flexShrink: 0 }} /> {faq.q}
                  </h3>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {activeFaq === idx ? '−' : '+'}
                  </span>
                </div>
                
                {/* Smooth Accordion Height transition panel */}
                <div className={`smooth-accordion-content ${activeFaq === idx ? 'open' : ''}`} style={{
                  paddingLeft: '1.8rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  borderTop: activeFaq === idx ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}>
                  <div style={{ paddingBottom: '0.5rem', paddingTop: '0.8rem' }}>{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

