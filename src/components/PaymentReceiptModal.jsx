import React from 'react';
import { Modal } from './Modal';
import { CheckCircle, Download, Printer, ShieldCheck, FileText, Sparkles, AlertCircle } from './Icons';
import { getCourseValidityInfo } from '../utils/courseValidity';

export function PaymentReceiptModal({ enrollment, isOpen, onClose }) {
  if (!enrollment) return null;

  const course = enrollment.course || { title: enrollment.courseTitle || 'Accredited Course', category: enrollment.courseCategory || 'General', price: enrollment.amountPaid || 49 };
  const studentName = enrollment.studentName || enrollment.student?.name || 'Valued Student';
  const studentEmail = enrollment.studentEmail || enrollment.student?.email || 'student@learn.com';
  const amountPaid = enrollment.amountPaid !== undefined ? enrollment.amountPaid : (course.price || 49);
  const paymentMode = enrollment.paymentMode || 'Instant UPI / QR Code';
  const transactionId = enrollment.transactionId || `TXN-${enrollment._id ? enrollment._id.toString().slice(-8) : '998231'}`;
  const enrolledAtRaw = enrollment.enrolledAt || enrollment.createdAt || new Date();
  const valInfo = getCourseValidityInfo(enrolledAtRaw);
  const enrolledAt = valInfo.formattedEnrolledAt;
  const invoiceNo = `INV-BKTC-${(enrollment._id || Date.now()).toString().slice(-8).toUpperCase()}`;

  const basePrice = Math.round((amountPaid / 1.18) * 100) / 100;
  const gstAmount = Math.round((amountPaid - basePrice) * 100) / 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📜 Official Tax Invoice & Payment Receipt">
      <div id="printable-receipt" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#fff', color: '#1e293b', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        
        {/* Header Branding */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#2563eb', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={22} style={{ color: '#2563eb' }} /> BK TEACHING CENTER
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
              Accredited Online Learning Platform & Skill Academy
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>
              GSTIN: 07BKTC9982C1Z8 | Support: support@bkteachingcenter.com
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-block', backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              TAX INVOICE
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{invoiceNo}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {enrolledAt}</div>
          </div>
        </div>

        {/* Bill To & Payment Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>BILLED TO (STUDENT):</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{studentName}</div>
            <div style={{ color: '#475569' }}>{studentEmail}</div>
            <div style={{ color: '#64748b', marginTop: '0.2rem', fontSize: '0.75rem' }}>Status: Active Enrolled Student</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>PAYMENT METADATA:</div>
            <div><strong>Mode:</strong> <span style={{ color: '#2563eb' }}>{paymentMode}</span></div>
            <div><strong>Transaction / UTR:</strong> <span style={{ color: '#059669', fontFamily: 'monospace', fontWeight: 700 }}>{transactionId}</span></div>
            {(() => {
              const isPending = enrollment.receiptStatus === 'Pending' || enrollment.receiptStatus === 'Pending Verification';
              return (
                <div><strong>Verification:</strong> <span style={{ color: isPending ? '#d97706' : '#16a34a', fontWeight: 800 }}>{isPending ? '⏳ Pending Verification' : '✓ Verified & Complete'}</span></div>
              );
            })()}
          </div>
        </div>

        {/* Course Line Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.65rem 0.8rem', borderBottom: '1px solid #cbd5e1' }}>Item / Course Description</th>
              <th style={{ padding: '0.65rem 0.8rem', borderBottom: '1px solid #cbd5e1' }}>Category</th>
              <th style={{ padding: '0.65rem 0.8rem', borderBottom: '1px solid #cbd5e1', textAlign: 'right' }}>Rate</th>
              <th style={{ padding: '0.65rem 0.8rem', borderBottom: '1px solid #cbd5e1', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#0f172a' }}>
                {course.title}
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>Full course enrollment with video lectures, PDF study notes & certificate</div>
                <div style={{ marginTop: '0.4rem', padding: '0.35rem 0.6rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', fontSize: '0.73rem', color: '#166534' }}>
                  ⏳ <strong>Subscription Validity:</strong> 1 Year Access (365 Days) | <strong>Exact Expiry Date:</strong> {valInfo.formattedExpiresAt} | <strong>Valid Through:</strong> {valInfo.validUntilMonthYear}
                </div>
              </td>
              <td style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>{course.category || 'General'}</td>
              <td style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0', textAlign: 'right', color: '#475569' }}>₹{basePrice.toFixed(2)}</td>
              <td style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>₹{basePrice.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Price Breakdown */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
          {(() => {
            const isPending = enrollment.receiptStatus === 'Pending' || enrollment.receiptStatus === 'Pending Verification';
            return isPending ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', fontSize: '0.82rem', fontWeight: 700, background: '#fef3c7', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid #fde68a' }}>
                <AlertCircle size={18} style={{ color: '#d97706' }} /> Invoice Under Review (Pending Payment)
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontSize: '0.82rem', fontWeight: 700, background: '#ecfdf5', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                <ShieldCheck size={18} /> Official Accredited Invoice Stamp
              </div>
            );
          })()}
          <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Subtotal:</span>
              <span>₹{basePrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>GST / Tax (18%):</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontWeight: 900, fontSize: '1.05rem', borderTop: '2px solid #0f172a', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
              <span>Total Paid:</span>
              <span style={{ color: '#2563eb' }}>₹{amountPaid.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
          This is a computer-generated tax invoice issued by BK Teaching Center. No signature required.
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
        <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
          Close Receipt
        </button>
        <button className="btn-primary" style={{ flex: 2, justifyContent: 'center', backgroundColor: '#2563eb', borderColor: '#2563eb' }} onClick={handlePrint}>
          <Printer size={16} /> Print / Save Tax Invoice PDF
        </button>
      </div>
    </Modal>
  );
}
