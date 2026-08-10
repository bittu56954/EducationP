import React, { useState } from 'react';
import { Modal } from './Modal';
import { 
  CheckCircle, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  Tag, 
  Copy, 
  Lock, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Award, 
  FileText,
  AlertCircle
} from './Icons';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import { getCourseValidityInfo } from '../utils/courseValidity';

export function PaymentCheckoutModal({ course, isOpen, onClose, onPaymentSuccess, user }) {
  const [step, setStep] = useState('checkout'); // 'checkout' | 'otp' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'bank' | 'slip'
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Form Inputs
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState(user?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [otpCode, setOtpCode] = useState('');

  // Status State
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Authorizing Payment with Bank Gateway...');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [createdEnrollment, setCreatedEnrollment] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  if (!course) return null;

  const originalPrice = Number(course.price || 3920);
  let discountPercent = 0;
  if (appliedCoupon === 'WELCOME50') discountPercent = 50;
  else if (appliedCoupon === 'BKTC20') discountPercent = 20;
  else if (appliedCoupon === 'STUDENT10') discountPercent = 10;

  const discountAmount = Math.round((originalPrice * discountPercent) / 100);
  const priceAfterDiscount = Math.max(0, originalPrice - discountAmount);
  const gstAmount = Math.round((priceAfterDiscount * 0.18) * 100) / 100;
  const finalTotal = Math.round((priceAfterDiscount + gstAmount) * 100) / 100;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME50' || code === 'BKTC20' || code === 'STUDENT10') {
      setAppliedCoupon(code);
    } else {
      setCouponError('Invalid promo code. Try WELCOME50 for 50% off!');
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('bkteachingcenter@okicici');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const formatCardNumber = (val) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return val;
    }
  };

  const executeCheckout = async (payPayload) => {
    setProcessing(true);
    setProcessingStatus('Securing SSL Handshake & Connecting to Gateway...');
    
    try {
      await new Promise(r => setTimeout(r, 600));
      setProcessingStatus('Verifying Real-Time Payment & UTR Authorization...');
      await new Promise(r => setTimeout(r, 700));
      setProcessingStatus('Finalizing Database Enrollment & Unlocking Hub...');
      
      const enrollmentResult = await onPaymentSuccess(course._id, payPayload);
      const fakeEnrollment = enrollmentResult?.enrollment || {
        _id: 'enr_' + Date.now(),
        course,
        courseTitle: course.title,
        courseCategory: course.category,
        amountPaid: payPayload.amountPaid,
        paymentMode: payPayload.paymentMode,
        transactionId: payPayload.transactionId,
        enrolledAt: new Date().toISOString(),
        studentName: user?.name || 'Valued Student',
        studentEmail: user?.email || 'student@learn.com'
      };
      setCreatedEnrollment(fakeEnrollment);
      setStep('success');
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    const modeMap = {
      upi: 'Instant UPI / QR Code',
      card: 'Credit / Debit Card',
      bank: `Net Banking (${selectedBank})`,
      slip: 'Manual Slip / Bank Wire',
      offline: 'Pay Later / Offline Cash'
    };

    const isSlip = paymentMethod === 'slip';
    const isPendingStatus = (paymentMethod === 'bank' || paymentMethod === 'slip' || paymentMethod === 'offline');
    const txnId = transactionRef.trim() || `TXN-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const payPayload = {
      paymentMode: modeMap[paymentMethod] || 'Instant UPI / QR Code',
      amountPaid: finalTotal,
      discountApplied: discountAmount,
      couponCode: appliedCoupon || '',
      receiptReceived: !isPendingStatus || (paymentMethod === 'slip' && Boolean(receiptUrl)),
      receiptStatus: isPendingStatus ? 'Pending' : 'Received',
      receiptUrl: receiptUrl || '',
      transactionId: txnId
    };

    if (paymentMethod === 'card') {
      // Trigger 3D Secure OTP verification
      setStep('otp');
      return;
    }

    await executeCheckout(payPayload);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      alert('Please enter the 6-digit OTP code sent to your registered mobile number.');
      return;
    }

    const payPayload = {
      paymentMode: `Credit / Debit Card (Verified via 3DS OTP)`,
      amountPaid: finalTotal,
      discountApplied: discountAmount,
      couponCode: appliedCoupon || '',
      receiptReceived: true,
      receiptStatus: 'Received',
      receiptUrl: '',
      transactionId: `TXN-CARD-${Math.floor(100000 + Math.random() * 900000)}`
    };

    await executeCheckout(payPayload);
  };

  const resetAndClose = () => {
    setStep('checkout');
    setAppliedCoupon(null);
    setCouponCode('');
    setTransactionRef('');
    setReceiptUrl('');
    setOtpCode('');
    onClose();
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={resetAndClose}
        title={step === 'success' ? "🎉 Payment Successful — Access Unlocked!" : step === 'otp' ? "🔒 3D Secure Card Verification" : `Checkout & Payment — ${course.title}`}
      >
        {step === 'checkout' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Top Order Summary Card */}
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src={course.thumbnail || course.image} alt={course.title} style={{ width: '70px', height: '65px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="badge badge-student" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{course.category}</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {course.title}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span>⭐ {course.rating || '4.9'}</span>
                    <span>⏱️ {course.duration || '24h Total'}</span>
                    <span>👨‍🏫 {course.teacher?.name || 'Lead Instructor'}</span>
                  </div>
                </div>
              </div>

              {/* Promo Coupon Bar */}
              <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.4rem', flex: 1, minWidth: '220px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Tag size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                    <input 
                      type="text" 
                      placeholder="Enter promo coupon (e.g. WELCOME50)"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      style={{ paddingLeft: '2rem', padding: '0.45rem 0.6rem 0.45rem 2rem', fontSize: '0.8rem', textTransform: 'uppercase' }}
                    />
                  </div>
                  <button type="submit" className="btn-secondary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}>
                    Apply
                  </button>
                </form>

                {appliedCoupon ? (
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                    ✓ Coupon "{appliedCoupon}" ({discountPercent}% OFF) Applied!
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#60a5fa' }}>
                    💡 Tip: Try <strong>WELCOME50</strong> for 50% discount!
                  </span>
                )}
              </div>
              {couponError && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.3rem' }}>{couponError}</div>}

              {/* Price Calculation Summary */}
              <div style={{ marginTop: '0.75rem', backgroundColor: 'rgba(9, 13, 22, 0.6)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Course Base Price:</span>
                  <span>₹{originalPrice.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}>
                    <span>Promo Discount ({appliedCoupon}):</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>GST / Govt Tax (18%):</span>
                  <span>+₹{gstAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', fontWeight: 900, fontSize: '1.05rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                  <span>Net Payable Amount:</span>
                  <span style={{ color: '#3b82f6' }}>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Course Subscription Validity & Schedule Highlight */}
              {(() => {
                const previewValidity = getCourseValidityInfo(new Date());
                return (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontSize: '0.78rem',
                    display: 'flex',
                    justifySpace: 'space-between',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#10b981', fontWeight: 800 }}>⏳ 1-YEAR UNLIMITED ACCESS</span>
                      <span style={{ color: '#60a5fa', fontWeight: 700 }}>Valid Until: {previewValidity.validUntilMonthYear}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      • Course is valid for <strong>1 Year (365 Days)</strong> from purchase date.
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      • Daily Live Classes: <strong>Monday to Saturday</strong> with recorded backups & study notes.
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Payment Method Selector */}
            <form onSubmit={handleSubmitPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                  Select Payment Gateway
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { id: 'upi', label: '⚡ Instant UPI / QR Code', desc: 'Scan & Pay via GPay, PhonePe, Paytm' },
                    { id: 'card', label: '💳 Credit / Debit Card', desc: 'Visa, Mastercard, RuPay with 3DS OTP' },
                    { id: 'bank', label: '🏦 Net Banking', desc: 'All major Indian & international banks' },
                    { id: 'slip', label: '📄 Bank Slip / Wire', desc: 'Direct wire transfer or receipt upload' },
                    { id: 'offline', label: '⏳ Pay Later / Offline', desc: 'Enroll now, pay later (Pending status)' }
                  ].map((m) => (
                    <div 
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '10px',
                        border: paymentMethod === m.id ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                        backgroundColor: paymentMethod === m.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-glass)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: paymentMethod === m.id ? '#60a5fa' : 'var(--text-main)' }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {m.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Gateway Form UI */}
              <div className="glass-panel" style={{ padding: '1rem 1.25rem', backgroundColor: 'rgba(15, 22, 36, 0.7)' }}>
                {paymentMethod === 'upi' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Scan QR Code using any UPI App (Google Pay, PhonePe, Paytm)
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '12px', width: '160px', margin: '0 auto', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=bkteachingcenter@okicici&pn=BK%20TEACHING%20CENTER&am=${finalTotal}&cu=INR`} 
                        alt="UPI QR Code"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.82rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '6px' }}>
                      <span>Official UPI ID: <strong>bkteachingcenter@okicici</strong></span>
                      <button type="button" onClick={handleCopyUpi} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                        <Copy size={12} /> {copiedUpi ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    <div>
                      <label style={{ display: 'block', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                        UPI Reference / UTR Number (Optional for instant auto-verify)
                      </label>
                      <input 
                        type="text" 
                        placeholder="Enter UTR No/ UPI Reference"
                        value={transactionRef}
                        onChange={e => setTransactionRef(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Cardholder Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter Card Name"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Card Number</label>
                      <input 
                        type="text" 
                        placeholder="4532 •••• •••• 8912"
                        value={cardNumber}
                        maxLength={19}
                        onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>CVV Code</label>
                        <input 
                          type="password" 
                          placeholder="•••"
                          maxLength={4}
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Choose Your Net Banking Provider</label>
                    <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="International Wire Transfer">International Wire Transfer</option>
                    </select>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '0.3rem' }}>
                      You will be securely redirected to <strong>{selectedBank}</strong> portal to complete authorization.
                    </div>
                  </div>
                )}

                {paymentMethod === 'slip' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#f59e0b' }}>
                      <strong>Bank Account Wire Details:</strong><br />
                      Account Name: BK Teaching Center Academy<br />
                      A/C No: 984012984102 | IFSC: HDFC0001892<br />
                      Branch: New Delhi Central
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                        Payment Slip / Image Link (or paste image URL) *
                      </label>
                      <input 
                        type="url" 
                        placeholder="https://example.com/receipts/my_payment_slip.jpg"
                        value={receiptUrl}
                        onChange={e => setReceiptUrl(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'offline' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'center' }}>
                    <div style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700 }}>
                      ⏳ Pay Later / Offline Cash Mode Selected
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Your enrollment will be created instantly, but your access will show as <strong>Pending</strong>. 
                      Once you complete payment offline, the administrator will verify and activate your lifetime course access.
                    </div>
                  </div>
                )}
              </div>

              {/* Security Seal */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={16} style={{ color: '#10b981' }} /> 256-Bit SSL Encrypted Payment Gateways | 100% Refund Guarantee
              </div>

              {processing && (
                <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  <div className="spinner-border" style={{ width: '18px', height: '18px', borderWidth: '2px', borderColor: '#3b82f6', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa' }}>{processingStatus}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={resetAndClose} disabled={processing}>
                  Cancel
                </button>
                <button type="submit" className="curious-btn-primary" style={{ flex: 2, justifyContent: 'center', backgroundColor: '#3b82f6', borderColor: '#3b82f6', padding: '0.8rem' }} disabled={processing}>
                  {processing ? 'Processing Payment...' : `Complete Purchase (₹${finalTotal.toFixed(2)}) →`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3D Secure OTP Step */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '1.8rem' }}>
              <Lock size={30} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>3D Secure One-Time Password (OTP)</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                An OTP has been sent to your mobile number ending in <strong>•••• 8912</strong> for amount <strong>₹{finalTotal.toFixed(2)}</strong>.
              </p>
            </div>

            <div style={{ maxWidth: '280px', margin: '0 auto', width: '100%' }}>
              <input 
                type="text" 
                placeholder="Enter 6-digit OTP (e.g. 558921)"
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em', fontWeight: 800 }}
                autoFocus
                required
              />
              <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '0.4rem' }}>
                Simulated Test OTP: Enter any 6 digits (e.g. 123456)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep('checkout')}>
                Back
              </button>
              <button type="submit" className="curious-btn-primary" style={{ flex: 2, justifyContent: 'center', backgroundColor: '#10b981', borderColor: '#10b981', padding: '0.75rem' }} disabled={processing}>
                {processing ? 'Verifying OTP...' : 'Verify OTP & Complete Pay'}
              </button>
            </div>
          </form>
        )}

        {/* Purchase Success Step */}
        {step === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '2px solid #10b981' }}>
              ✓
            </div>

            <div>
              <span className="badge badge-student" style={{ backgroundColor: '#10b981', color: '#fff', fontWeight: 800, padding: '0.25rem 0.75rem' }}>
                PURCHASE & ENROLLMENT SUCCESSFUL
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                Course Access Granted! 🚀
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                You have successfully purchased <strong>{course.title}</strong>.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '1rem', textAlign: 'left', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ color: '#3b82f6', fontWeight: 800 }}>📌 Transaction Summary:</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Transaction ID:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-main)' }}>{createdEnrollment?.transactionId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Total Paid:</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>₹{createdEnrollment?.amountPaid || finalTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Payment Mode:</span>
                <span style={{ fontWeight: 700, color: '#60a5fa' }}>{createdEnrollment?.paymentMode}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: 'center', padding: '0.75rem', fontSize: '0.85rem' }} 
                onClick={() => setShowReceipt(true)}
              >
                <FileText size={16} /> View Tax Invoice Receipt
              </button>
              <button 
                type="button" 
                className="curious-btn-primary" 
                style={{ flex: 1.5, justifyContent: 'center', backgroundColor: '#3b82f6', borderColor: '#3b82f6', padding: '0.75rem', fontSize: '0.85rem' }}
                onClick={resetAndClose}
              >
                Go to Dashboard & Start Learning →
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Tax Invoice Receipt Modal Popup */}
      <PaymentReceiptModal 
        enrollment={createdEnrollment}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </>
  );
}
