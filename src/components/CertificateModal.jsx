import React from 'react';
import { Modal } from './Modal';
import { Award, Download, Printer, ShieldCheck, CheckCircle, Sparkles } from './Icons';
import { DirectorSignature } from './DirectorSignature';

export function CertificateModal({ course, user, isOpen, onClose }) {
  if (!isOpen || !course) return null;

  const studentName = user?.name || 'Valued Student';
  const courseTitle = course.title || 'Accredited Course of Excellence';
  const teacherName = course.instructor?.name || (typeof course.instructor === 'string' ? course.instructor : 'Senior Faculty Lead');
  const certId = `BKTC-CERT-${(course._id || '99281').toString().slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📜 Official Accredited Certificate of Completion">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Printable Certificate Canvas */}
        <div 
          id="printable-certificate"
          style={{
            position: 'relative',
            background: '#ffffff',
            color: '#0f172a',
            padding: '2.5rem 2rem',
            borderRadius: '16px',
            border: '8px double #d97706',
            boxShadow: '0 20px 45px rgba(0,0,0,0.15)',
            textAlign: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Watermark Background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(#f8fafc 20%, transparent 20%), radial-gradient(#f1f5f9 20%, transparent 20%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
            opacity: 0.5,
            pointerEvents: 'none',
            zIndex: 0
          }} />

          {/* Corner Ornaments */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', width: '28px', height: '28px', borderTop: '3px solid #d97706', borderLeft: '3px solid #d97706' }} />
          <div style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px', borderTop: '3px solid #d97706', borderRight: '3px solid #d97706' }} />
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '28px', height: '28px', borderBottom: '3px solid #d97706', borderLeft: '3px solid #d97706' }} />
          <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '28px', height: '28px', borderBottom: '3px solid #d97706', borderRight: '3px solid #d97706' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Top Emblem & Institution Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #ff6d0a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: '1.1rem',
                boxShadow: '0 4px 10px rgba(37,99,235,0.3)'
              }}>
                BK
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                BK <span style={{ color: '#2563eb' }}>TEACHING</span> CENTER
              </span>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#ff6d0a', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
              Accredited Online Learning Platform & Skill Academy
            </div>

            {/* Certificate Title */}
            <div style={{
              display: 'inline-block',
              padding: '0.35rem 1.2rem',
              borderRadius: '50px',
              backgroundColor: 'rgba(217, 119, 6, 0.12)',
              color: '#b45309',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              border: '1px solid rgba(217, 119, 6, 0.3)'
            }}>
              Certificate of Completion
            </div>

            <p style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic', marginBottom: '0.5rem' }}>
              This is to proudly certify that
            </p>

            {/* Student Name */}
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#1e293b',
              margin: '0.4rem 0 0.8rem',
              letterSpacing: '-0.02em',
              borderBottom: '2px dashed #93c5fd',
              display: 'inline-block',
              paddingBottom: '0.25rem',
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem'
            }}>
              {studentName}
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#475569', maxWidth: '520px', margin: '0 auto 0.8rem', lineHeight: 1.5 }}>
              has successfully fulfilled all course requirements, assignments, and comprehensive practical assessments for the accredited program:
            </p>

            {/* Course Title */}
            <h3 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#2563eb',
              margin: '0.6rem 0 1.5rem',
              letterSpacing: '-0.01em'
            }}>
              "{courseTitle}"
            </h3>

            {/* Signatures & Seal Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'flex-end',
              gap: '1rem',
              marginTop: '1.8rem',
              paddingTop: '1.2rem',
              borderTop: '1px solid #e2e8f0'
            }}>
              
              {/* Left: Issue Date & Faculty */}
              <div style={{ textAlign: 'left', fontSize: '0.8rem', color: '#475569' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                  📅 Issue Date:
                </div>
                <div style={{ color: '#2563eb', fontWeight: 600, marginBottom: '0.6rem' }}>
                  {issueDate}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Faculty: <strong>{teacherName}</strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  ID: <code style={{ backgroundColor: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: '4px', color: '#0f172a' }}>{certId}</code>
                </div>
              </div>

              {/* Center: Gold Foil Seal Badge */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #fde68a 0%, #d97706 100%)',
                  boxShadow: '0 4px 15px rgba(217, 119, 6, 0.35)',
                  border: '2px solid #b45309',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#78350f',
                  fontSize: '0.55rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: '0 auto',
                  lineHeight: 1.1
                }}>
                  <Award size={20} style={{ color: '#78350f', marginBottom: '1px' }} />
                  <span>VERIFIED</span>
                  <span style={{ fontSize: '0.5rem' }}>OFFICIAL</span>
                </div>
              </div>

              {/* Right: Authorized Director Signature (Bittu kumar) */}
              <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end' }}>
                <DirectorSignature width={190} height={58} showTitle={true} />
              </div>
            </div>

          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handlePrint}
            className="curious-btn-primary"
            style={{ padding: '0.65rem 1.4rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Printer size={16} /> Print / Save PDF Certificate
          </button>
          <button
            type="button"
            onClick={onClose}
            className="curious-btn-outline"
            style={{ padding: '0.65rem 1.2rem' }}
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
}

export default CertificateModal;
