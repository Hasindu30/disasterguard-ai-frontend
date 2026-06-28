import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert, Map, Bell, HeartHandshake, Eye, Sparkles,
  Navigation, ChevronDown, AlertTriangle, Activity, Zap,
  Globe, Users, Clock, ArrowRight, CheckCircle, Satellite,
  Radio, Wind, Droplets, Thermometer, TrendingUp
} from 'lucide-react';

/* ─── Animated counter hook ─────────────────────────────────── */
function useCounter(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

/* ─── Stat card component ────────────────────────────────────── */
const StatCard: React.FC<{ value: string; label: string; icon: React.ReactNode; color: string }> = ({ value, label, icon, color }) => (
  <div className={`landing-stat-card`} style={{ borderColor: `${color}30` }}>
    <div className="landing-stat-icon" style={{ background: `${color}15`, color }}>
      {icon}
    </div>
    <div>
      <div className="landing-stat-value">{value}</div>
      <div className="landing-stat-label">{label}</div>
    </div>
  </div>
);

/* ─── Feature card ───────────────────────────────────────────── */
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  img: string;
  color: string;
  delay: number;
}> = ({ icon, title, desc, img, color, delay }) => (
  <div className="landing-feature-card" style={{ animationDelay: `${delay}ms` }}>
    <div className="landing-feature-img-wrap">
      <img src={img} alt={title} className="landing-feature-img" />
      <div className="landing-feature-img-overlay" style={{ background: `linear-gradient(to top, #0f172a 30%, transparent)` }} />
    </div>
    <div className="landing-feature-body">
      <div className="landing-feature-icon" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <h3 className="landing-feature-title">{title}</h3>
      <p className="landing-feature-desc">{desc}</p>
      <div className="landing-feature-arrow" style={{ color }}>
        <span>Learn more</span>
        <ArrowRight size={14} />
      </div>
    </div>
  </div>
);

/* ─── Alert feed item ────────────────────────────────────────── */
const AlertItem: React.FC<{ level: string; loc: string; msg: string; time: string; color: string }> = ({ level, loc, msg, time, color }) => (
  <div className="landing-alert-item" style={{ borderLeftColor: color }}>
    <div className="landing-alert-dot" style={{ background: color }} />
    <div className="landing-alert-content">
      <div className="landing-alert-header">
        <span className="landing-alert-level" style={{ color }}>{level}</span>
        <span className="landing-alert-loc">{loc}</span>
        <span className="landing-alert-time">{time}</span>
      </div>
      <p className="landing-alert-msg">{msg}</p>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const alertsCount = useCounter(2847, 1800, statsVisible);
  const locCount = useCounter(150, 1600, statsVisible);
  const resourcesCount = useCounter(9400, 2000, statsVisible);

  const features = [
    {
      icon: <Satellite size={20} />,
      title: 'Predictive AI Risk Engine',
      desc: 'Real-time multi-variable risk scoring using live rainfall, wind velocity, topography contours, and historical disaster patterns.',
      img: '/weather_data.png',
      color: '#f97316',
    },
    {
      icon: <Map size={20} />,
      title: 'Geospatial Risk Mapping',
      desc: 'Interactive Leaflet overlays with color-coded risk zones, flood boundaries, and evacuation route visualization.',
      img: '/hero_disaster_map.png',
      color: '#ef4444',
    },
    {
      icon: <HeartHandshake size={20} />,
      title: 'Emergency Resource Finder',
      desc: 'Instantly locates nearby hospitals, fire stations, police, and shelters using OpenStreetMap Overpass real-time queries.',
      img: '/command_center.png',
      color: '#22c55e',
    },
    {
      icon: <Bell size={20} />,
      title: 'Automated Alert System',
      desc: 'Flags dangerous weather predictions immediately, generating severity-graded alerts logged in a persistent history feed.',
      img: '/flood_warning.png',
      color: '#3b82f6',
    },
  ];

  return (
    <div className="landing-root">
      {/* ── Gradient orbs ── */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      {/* ══ NAV BAR ══════════════════════════════════════════════ */}
      {!user && (
      <nav className="landing-nav" style={{ background: scrollY > 60 ? 'rgba(9,11,20,0.92)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(16px)' : 'none' }}>
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <span className="landing-logo-text">DisasterGuard <span className="landing-logo-ai">AI</span></span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#alerts" className="landing-nav-link">Live Alerts</a>
            <a href="#about" className="landing-nav-link">About</a>
          </div>
          <div className="landing-nav-cta">
            {user ? (
              <Link to="/dashboard" className="landing-btn-primary">
                <Eye size={15} /> Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-btn-ghost">Sign In</Link>
                <Link to="/register" className="landing-btn-primary">
                  Get Started <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      )}

      {/* ══ HERO SECTION ═════════════════════════════════════════ */}
      <section className="landing-hero">
        {/* Background hero image */}
        <div className="landing-hero-bg">
          <img src="/hero_disaster_map.png" alt="Disaster map" className="landing-hero-bg-img" />
          <div className="landing-hero-bg-overlay" />
        </div>

        <div className="landing-hero-content">
          {/* Badge */}
          {/* <div className="landing-hero-badge">
            <div className="landing-badge-dot" />
            <Sparkles size={12} />
            <span>AI-Powered Early Warning System — Live</span>
          </div> */}

          {/* Heading */}
          <h1 className="landing-hero-h1">
            Predict Disasters.<br />
            <span className="landing-hero-gradient">Protect Lives.</span>
          </h1>

          <p className="landing-hero-sub">
            DisasterGuard AI fuses live weather telemetry, geospatial flood modeling,
            and emergency resource mapping into a single command platform for rapid community resilience.
          </p>

          {/* CTAs */}
          <div className="landing-hero-ctas">
            {user ? (
              <Link to="/dashboard" className="landing-cta-primary">
                <Eye size={18} />
                <span>Open Command Center</span>
              </Link>
            ) : (
              <>
                <Link to="/register" className="landing-cta-primary">
                  <Zap size={18} />
                  <span>Start Free — No Credit Card</span>
                </Link>
                <Link to="/login" className="landing-cta-secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div className="landing-trust">
            {[
              'Open-Meteo Weather API',
              'OpenStreetMap Resources',
              'JWT Secured',
              'Real-time Monitoring',
            ].map((t) => (
              <span key={t} className="landing-trust-badge">
                <CheckCircle size={11} /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="landing-scroll-hint">
          <ChevronDown size={20} className="landing-bounce" />
        </div>
      </section>

      {/* ══ LIVE STATS BANNER ════════════════════════════════════ */}
      <section className="landing-stats-banner" ref={statsRef}>
        <div className="landing-stats-inner">
          <StatCard value={`${alertsCount.toLocaleString()}+`} label="Alerts Generated" icon={<Bell size={18} />} color="#ef4444" />
          <div className="landing-stats-divider" />
          <StatCard value={`${locCount}+`} label="Countries Covered" icon={<Globe size={18} />} color="#f97316" />
          <div className="landing-stats-divider" />
          <StatCard value={`${resourcesCount.toLocaleString()}+`} label="Emergency Resources" icon={<HeartHandshake size={18} />} color="#22c55e" />
          <div className="landing-stats-divider" />
          <StatCard value="99.8%" label="System Uptime" icon={<Activity size={18} />} color="#3b82f6" />
          <div className="landing-stats-divider" />
          <StatCard value="< 1.5s" label="Risk Calculation" icon={<Clock size={18} />} color="#a855f7" />
        </div>
      </section>

      {/* ══ LIVE WEATHER TICKER ══════════════════════════════════ */}
      <div className="landing-ticker">
        <div className="landing-ticker-label">
          <Radio size={12} className="landing-ticker-pulse" />
          LIVE
        </div>
        <div className="landing-ticker-track">
          <div className="landing-ticker-inner">
            {[
              '🌧 Colombo, LK — Rainfall: 24.3mm/hr — Risk: HIGH',
              '⚡ Jakarta, ID — Storm Warning Active — Risk: CRITICAL',
              '🌊 Chennai, IN — Coastal Flood Alert — Risk: SEVERE',
              '🌪 Manila, PH — Typhoon Track Updated — Risk: EXTREME',
              '🌡 Bangkok, TH — Flash Flood Advisory — Risk: HIGH',
              '🌧 Mumbai, IN — Heavy Rain Warning — Risk: SEVERE',
              '⚡ Dhaka, BD — Cyclone Watch — Risk: HIGH',
              '🌊 Ho Chi Minh, VN — Flood Zone Active — Risk: CRITICAL',
            ].map((item, i) => (
              <span key={i} className="landing-ticker-item">{item}</span>
            ))}
            {/* duplicate for infinite loop */}
            {[
              '🌧 Colombo, LK — Rainfall: 24.3mm/hr — Risk: HIGH',
              '⚡ Jakarta, ID — Storm Warning Active — Risk: CRITICAL',
              '🌊 Chennai, IN — Coastal Flood Alert — Risk: SEVERE',
              '🌪 Manila, PH — Typhoon Track Updated — Risk: EXTREME',
              '🌡 Bangkok, TH — Flash Flood Advisory — Risk: HIGH',
              '🌧 Mumbai, IN — Heavy Rain Warning — Risk: SEVERE',
              '⚡ Dhaka, BD — Cyclone Watch — Risk: HIGH',
              '🌊 Ho Chi Minh, VN — Flood Zone Active — Risk: CRITICAL',
            ].map((item, i) => (
              <span key={`d${i}`} className="landing-ticker-item">{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FEATURES SECTION ═════════════════════════════════════ */}
      <section id="features" className="landing-features-section">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <div className="landing-section-badge">
              <TrendingUp size={13} /> Platform Capabilities
            </div>
            <h2 className="landing-section-h2">
              Everything You Need to<br />
              <span className="landing-gradient-text">Respond Faster</span>
            </h2>
            <p className="landing-section-sub">
              A full-stack disaster preparedness suite integrating weather intelligence,
              spatial risk analysis, and emergency coordination into one unified platform.
            </p>
          </div>

          <div className="landing-features-grid">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ SPLIT IMAGE SECTION ══════════════════════════════════ */}
      <section className="landing-split-section" id="about">
        <div className="landing-split-inner">
          {/* Image side */}
          <div className="landing-split-img-col">
            <div className="landing-split-img-wrap">
              <img src="/command_center.png" alt="Command Center" className="landing-split-img" />
              <div className="landing-split-img-card">
                <div className="landing-split-img-card-dot" />
                <div>
                  <div className="landing-split-img-card-title">Situational Awareness</div>
                  <div className="landing-split-img-card-sub">Real-time data — updated every 60s</div>
                </div>
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="landing-split-text-col">
            <div className="landing-section-badge">
              <Users size={13} /> Built for Responders
            </div>
            <h2 className="landing-split-h2">
              A Command Center in<br />
              <span className="landing-gradient-text">Your Browser</span>
            </h2>
            <p className="landing-split-p">
              DisasterGuard AI was designed from the ground up for emergency management professionals,
              local government agencies, and community coordinators who need actionable intelligence — not raw data.
            </p>
            <ul className="landing-split-list">
              {[
                { icon: <Droplets size={16} />, text: 'Open-Meteo live rainfall & wind data' },
                { icon: <Navigation size={16} />, text: 'Leaflet geospatial risk overlays' },
                { icon: <ShieldAlert size={16} />, text: 'Severity-graded automated alert system' },
                { icon: <HeartHandshake size={16} />, text: 'Nearby emergency resource discovery' },
                { icon: <Wind size={16} />, text: 'Multi-factor AI risk scoring engine' },
                { icon: <Thermometer size={16} />, text: 'Historical alert trend analytics' },
              ].map((item, i) => (
                <li key={i} className="landing-split-item">
                  <span className="landing-split-item-icon">{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <div className="landing-split-ctas">
              {user ? (
                <Link to="/map" className="landing-cta-primary">
                  <Map size={16} /> Open Risk Map
                </Link>
              ) : (
                <Link to="/register" className="landing-cta-primary">
                  <Zap size={16} /> Create Free Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ LIVE ALERTS FEED ═════════════════════════════════════ */}
      <section id="alerts" className="landing-alerts-section">
        <div className="landing-alerts-bg">
          <img src="/flood_warning.png" alt="Flood" className="landing-alerts-bg-img" />
          <div className="landing-alerts-bg-overlay" />
        </div>
        <div className="landing-alerts-inner">
          <div className="landing-alerts-header">
            <div className="landing-section-badge" style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.25)', color: '#f87171' }}>
              <AlertTriangle size={13} /> Live Incident Feed
            </div>
            <h2 className="landing-section-h2">Active Disaster Alerts</h2>
            <p className="landing-section-sub">Real-time severity monitoring across active monitoring zones</p>
          </div>
          <div className="landing-alerts-feed">
            <AlertItem level="CRITICAL" loc="Jakarta, Indonesia" msg="Major flooding reported in 3 districts. Evacuation orders active for Zone B and C." time="2 min ago" color="#ef4444" />
            <AlertItem level="SEVERE" loc="Colombo, Sri Lanka" msg="Heavy rainfall exceeding 28mm/hr. Flash flood risk detected in low-lying areas." time="5 min ago" color="#f97316" />
            <AlertItem level="HIGH" loc="Chennai, India" msg="Coastal storm surge warning issued. Avoid low-elevation coastal roads." time="11 min ago" color="#eab308" />
            <AlertItem level="MODERATE" loc="Bangkok, Thailand" msg="Flood advisory remains in effect. Monitoring upstream water levels." time="18 min ago" color="#3b82f6" />
            <AlertItem level="SEVERE" loc="Manila, Philippines" msg="Typhoon trajectory updated. Landfall expected within 6 hours. Prepare now." time="22 min ago" color="#f97316" />
          </div>
          <div className="landing-alerts-cta">
            {user ? (
              <Link to="/alerts" className="landing-cta-primary">
                <Bell size={16} /> View Full Alert History
              </Link>
            ) : (
              <Link to="/register" className="landing-cta-primary">
                <Bell size={16} /> Access Full Alert Feed
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═══════════════════════════════════════════ */}
      <section className="landing-cta-section">
        <div className="landing-cta-inner">
          <div className="landing-cta-img-col">
            <img src="/weather_data.png" alt="Weather data" className="landing-cta-img" />
          </div>
          <div className="landing-cta-text-col">
            <h2 className="landing-cta-h2">
              Ready to Safeguard<br />
              <span className="landing-gradient-text">Your Community?</span>
            </h2>
            <p className="landing-cta-p">
              Join emergency responders and analysts already using DisasterGuard AI to stay ahead of disasters.
              Free to get started. No hardware required.
            </p>
            <div className="landing-cta-btns">
              {user ? (
                <Link to="/dashboard" className="landing-cta-primary landing-cta-lg">
                  <Eye size={18} /> Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="landing-cta-primary landing-cta-lg">
                    <Zap size={18} /> Create Free Account
                  </Link>
                  <Link to="/login" className="landing-cta-outline">
                    Sign In →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════ */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-logo">
            <div className="landing-logo-icon landing-logo-icon-sm">
              <ShieldAlert size={16} className="text-white" />
            </div>
            <span className="landing-logo-text" style={{ fontSize: '1rem' }}>
              DisasterGuard <span className="landing-logo-ai">AI</span>
            </span>
          </div>
          <p className="landing-footer-copy">
            © {new Date().getFullYear()} DisasterGuard AI — Built for global resilience and community safety.
          </p>
          <div className="landing-footer-links">
            <Link to="/register" className="landing-footer-link">Register</Link>
            <Link to="/login" className="landing-footer-link">Login</Link>
            {user && <Link to="/dashboard" className="landing-footer-link">Dashboard</Link>}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
