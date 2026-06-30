import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { Mail, ShieldCheck, ArrowLeft, CheckCircle, AlertCircle, Send, Key, Lock, ArrowRight } from 'lucide-react';

type Step = 'email' | 'sent' | 'temp-verify' | 'reset-success';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api/auth`;

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep]   = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) { setError('Please enter your email address.'); return; }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email)) { setError('Please enter a valid email address.'); return; }

    setLoading(true);
    try {
      // 1. Generate temp password in backend database
      const response = await axios.post(`${API_URL}/forgot-password/request`, { email });
      const generatedCode = response.data.tempPassword.toUpperCase();
      
      // 2. Dispatch the actual email using EmailJS
      await emailjs.send(
        'service_n1a1hvc',       // Service ID
        'template_9vl4z8p',      // Template ID
        {
          to_email: email,       
          user_email: email,
          email: email,
          temporaryPassword: generatedCode, // Exact match for {{temporaryPassword}}
          message: generatedCode
        },
        'OtBFaGLtIu90v9r5a'      // Public Key
      );

      setStep('sent');
      setResendTimer(60);
    } catch (err: any) {
      console.error("Password Request/EmailJS Error:", err);
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTemp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!tempPassword) { setError('Please enter the temporary password.'); return; }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/forgot-password/verify`, {
        email,
        tempPassword: tempPassword.trim().toUpperCase()
      });
      setStep('temp-verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid temporary password code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword || !confirmPassword) { setError('Please fill in all fields.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/forgot-password/reset`, {
        email,
        tempPassword: tempPassword.trim().toUpperCase(),
        newPassword
      });
      setStep('reset-success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Background */}
      <div className="auth-bg">
        <img src="/weather_data.png" alt="" className="auth-bg-img" style={{ opacity: 0.18 }} />
        <div className="auth-bg-overlay" />
      </div>

      {/* Orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      {/* Centered single-column layout */}
      <div className="auth-center-layout">

        {/* Back link */}
        {step !== 'reset-success' && (
          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={15} />
            <span>Back to Sign In</span>
          </Link>
        )}

        <div className="auth-card auth-card-narrow">

          {/* STEP 1: Enter Email */}
          {step === 'email' && (
            <>
              <div className="auth-card-header">
                <div className="auth-card-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}>
                  <Mail size={22} />
                </div>
                <h1 className="auth-card-title">Forgot Password?</h1>
                <p className="auth-card-sub">
                  Enter your email address to generate a temporary verification password.
                </p>
              </div>

              {error && (
                <div className="auth-error">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSendEmail} className="auth-form">
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@agency.gov"
                      className="auth-input"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="auth-submit-btn"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}
                >
                  {loading
                    ? <span className="auth-spinner" />
                    : <><Send size={16} /><span>Generate Temp Password</span></>
                  }
                </button>
              </form>

              <div className="auth-divider"><span>or</span></div>
              <p className="auth-footer-text">
                Remember your password?{' '}
                <Link to="/login" className="auth-footer-link">Sign In</Link>
              </p>
            </>
          )}

          {/* STEP 2: Prompt Input (Temp password was sent to email) */}
          {step === 'sent' && (
            <>
              <div className="auth-card-header">
                <div className="auth-card-icon" style={{ background: 'rgba(249,115,22,0.12)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.25)' }}>
                  <Key size={22} />
                </div>
                <h1 className="auth-card-title">Check Your Email</h1>
                <p className="auth-card-sub">
                  A temporary password code has been sent to <strong>{email}</strong>. Enter it below to verify:
                </p>
              </div>

              {error && (
                <div className="auth-error">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyTemp} className="auth-form">
                <div className="auth-field">
                  <label className="auth-label">Enter Temp Password</label>
                  <div className="auth-input-wrap">
                    <Key size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      value={tempPassword}
                      onChange={e => setTempPassword(e.target.value)}
                      placeholder="Paste temp password code"
                      className="auth-input"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="auth-submit-btn"
                  style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}
                >
                  {loading ? (
                    <span className="auth-spinner" />
                  ) : (
                    <>
                      <span>Verify Temp Password</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
              
              {/* 1-Minute Resend Timer */}
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Didn't receive the email?{' '}
                  {resendTimer > 0 ? (
                    <span style={{ color: '#94a3b8' }}>Resend in {resendTimer}s</span>
                  ) : (
                    <button 
                      onClick={handleSendEmail} 
                      disabled={loading}
                      style={{ 
                        background: 'none', border: 'none', color: '#3b82f6', 
                        fontWeight: 600, cursor: 'pointer', padding: 0 
                      }}
                    >
                      Resend Code
                    </button>
                  )}
                </p>
              </div>
            </>
          )}


          {/* STEP 3: Correct! Setup New Password */}
          {step === 'temp-verify' && (
            <>
              <div className="auth-card-header">
                <div className="auth-card-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <Lock size={22} />
                </div>
                <h1 className="auth-card-title">Setup New Password</h1>
                <p className="auth-card-sub">
                  Account verified! Please create a strong new password for your account.
                </p>
              </div>

              {error && (
                <div className="auth-error">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="auth-field">
                  <label className="auth-label">New Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="auth-input"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Confirm Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="auth-input"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="auth-submit-btn"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
                >
                  {loading
                    ? <span className="auth-spinner" />
                    : <><span>Reset Password</span><CheckCircle size={16} /></>
                  }
                </button>
              </form>
            </>
          )}

          {/* STEP 4: Success state */}
          {step === 'reset-success' && (
            <div className="auth-success-state">
              <div className="auth-success-icon-wrap">
                <CheckCircle size={48} className="auth-success-icon" />
                <div className="auth-success-ring" />
              </div>

              <h1 className="auth-card-title">Password Reset Complete</h1>
              <p className="auth-success-msg">
                Your password has been successfully updated in the database. You can now log in using your new credentials.
              </p>

              <Link to="/login" className="auth-submit-btn" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                <ShieldCheck size={16} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          )}

        </div>

        {/* Brand tag */}
        <div className="auth-brand-tag">
          <div className="auth-logo-icon" style={{ width: 28, height: 28, borderRadius: 8 }}>
            <ShieldCheck size={16} className="text-white" />
          </div>
          <span className="auth-logo-text" style={{ fontSize: '0.9rem' }}>
            DisasterGuard <span className="auth-logo-ai">AI</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
