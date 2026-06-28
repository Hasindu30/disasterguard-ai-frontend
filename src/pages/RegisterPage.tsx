import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, ShieldAlert, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { user, register, errorMsg, setErrorMsg, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole]         = useState<'USER' | 'ADMIN'>('USER');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate('/dashboard');
    setErrorMsg(null);
  }, [user, navigate, setErrorMsg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!name || !email || !password) { setValidationError('Please fill in all fields'); return; }
    if (password.length < 6) { setValidationError('Password must be at least 6 characters'); return; }
    try { await register(name, email, password, role); navigate('/dashboard'); } catch (_) {}
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f97316', '#22c55e'];

  return (
    <div className="auth-root">
      {/* Background image */}
      <div className="auth-bg">
        <img src="/flood_warning.png" alt="" className="auth-bg-img" />
        <div className="auth-bg-overlay" />
      </div>

      {/* Floating orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      {/* Split Layout */}
      <div className="auth-layout">

        {/* LEFT — Branding panel */}
        <div className="auth-brand-panel">
          <div className="auth-brand-inner">
            <div className="auth-logo">
              <div className="auth-logo-icon">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <span className="auth-logo-text">DisasterGuard <span className="auth-logo-ai">AI</span></span>
            </div>

            <h2 className="auth-brand-h2">
              Join the network<br />protecting communities<br />worldwide.
            </h2>
            <p className="auth-brand-p">
              Get access to predictive AI risk scores, live weather feeds, emergency resource maps, and automated alerts.
            </p>

            <ul className="auth-brand-features">
              {[
                'AI-powered flood & storm risk prediction',
                'Live geospatial risk maps via Leaflet',
                'Instant emergency resource locator',
                'Automated severity-graded alert feed',
              ].map(f => (
                <li key={f} className="auth-brand-feature">
                  <CheckCircle size={15} className="auth-brand-feature-icon" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="auth-brand-img-card">
              <div className="auth-brand-img-wrap">
                <img src="/weather_data.png" alt="Weather data" className="auth-brand-img" />
                <div className="auth-brand-img-tint" />
              </div>
              <div className="auth-brand-img-label">
                <div className="auth-live-dot" />
                <span>Global monitoring active</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Form panel */}
        <div className="auth-form-panel">
          <div className="auth-card">

            {/* Card header */}
            <div className="auth-card-header">
              <div className="auth-card-icon">
                <UserPlus size={22} />
              </div>
              <h1 className="auth-card-title">Create Account</h1>
              <p className="auth-card-sub">Join the DisasterGuard AI early detection network</p>
            </div>

            {/* Error */}
            {(errorMsg || validationError) && (
              <div className="auth-error">
                <ShieldAlert size={15} className="shrink-0" />
                <span>{validationError || errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">

              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <div className="auth-input-wrap">
                  <User size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Officer Jane Doe"
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrap">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="officer@agency.gov"
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="auth-input auth-input-pr"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="auth-eye-btn"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="auth-strength">
                    <div className="auth-strength-bars">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="auth-strength-bar"
                          style={{ background: i <= strength ? strengthColor[strength] : 'rgba(255,255,255,0.08)' }}
                        />
                      ))}
                    </div>
                    <span style={{ color: strengthColor[strength] }} className="auth-strength-label">
                      {strengthLabel[strength]}
                    </span>
                  </div>
                )}
              </div>

              {/* Role Selector */}
              <div className="auth-role-box">
                <label className="auth-role-label">
                  <ShieldCheck size={13} className="text-amber-400" />
                  Access Role
                </label>
                <div className="auth-role-grid">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`auth-role-btn ${role === 'USER' ? 'auth-role-active-user' : ''}`}
                  >
                    Standard User
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`auth-role-btn ${role === 'ADMIN' ? 'auth-role-active-admin' : ''}`}
                  >
                    Administrator
                  </button>
                </div>
                {/* <p className="auth-role-note">First registered account automatically gains ADMIN privileges.</p> */}
              </div>

              <button type="submit" disabled={loading} className="auth-submit-btn">
                {loading
                  ? <span className="auth-spinner" />
                  : <><span>Create Account</span><ArrowRight size={16} /></>
                }
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider"><span>or</span></div>

            {/* Footer */}
            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-footer-link">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
