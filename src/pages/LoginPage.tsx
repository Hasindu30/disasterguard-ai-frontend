import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, ShieldAlert, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, login, errorMsg, setErrorMsg, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate('/dashboard');
    setErrorMsg(null);
  }, [user, navigate, setErrorMsg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!email || !password) { setValidationError('Please enter all fields'); return; }
    try { await login(email, password); navigate('/dashboard'); } catch (_) {}
  };

  return (
    <div className="auth-root">
      {/* Background image */}
      <div className="auth-bg">
        <img src="/hero_disaster_map.png" alt="" className="auth-bg-img" />
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
              Real-time disaster<br />intelligence at your<br />fingertips.
            </h2>
            <p className="auth-brand-p">
              Monitor live weather data, predict risk zones, and coordinate emergency response — all from one command platform.
            </p>

            <div className="auth-brand-stats">
              {[
                { v: '99.8%', l: 'Uptime SLA' },
                { v: '<1.5s', l: 'Risk Calc' },
                { v: '150+', l: 'Countries' },
              ].map(s => (
                <div key={s.l} className="auth-brand-stat">
                  <span className="auth-brand-stat-v">{s.v}</span>
                  <span className="auth-brand-stat-l">{s.l}</span>
                </div>
              ))}
            </div>

            <div className="auth-brand-img-card">
              <div className="auth-brand-img-wrap">
                <img src="/command_center.png" alt="Command center" className="auth-brand-img" />
                <div className="auth-brand-img-tint" />
              </div>
              <div className="auth-brand-img-label">
                <div className="auth-live-dot" />
                <span>Live telemetry active</span>
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
                <LogIn size={22} />
              </div>
              <h1 className="auth-card-title">Welcome Back</h1>
              <p className="auth-card-sub">Sign in to access your command center</p>
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
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrap">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@agency.gov"
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label className="auth-label">Password</label>
                  <Link to="/forgot-password" className="auth-forgot-link">
                    Forgot password?
                  </Link>
                </div>
                <div className="auth-input-wrap">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
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
              </div>

              <button type="submit" disabled={loading} className="auth-submit-btn">
                {loading
                  ? <span className="auth-spinner" />
                  : <><span>Sign In</span><ArrowRight size={16} /></>
                }
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider"><span>or</span></div>

            {/* Footer */}
            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="auth-footer-link">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
