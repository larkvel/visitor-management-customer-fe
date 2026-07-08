import React, { useState } from "react";
import { api } from "../api";

const FEATURES = [
  { icon: "👤", title: "Digital Check-In", desc: "Smooth digital check-in with instant host notifications and a clean visitor log." },
  { icon: "📊", title: "Real-time Dashboard", desc: "Live view of expected visitors, who's on-site right now, and completed visits today." },
  { icon: "👥", title: "Team Management", desc: "Create users with role-based permissions — admin, reception, executive, viewer." },
  { icon: "🏢", title: "Multi-location", desc: "Manage multiple offices or locations from a single company dashboard." },
  { icon: "🔔", title: "Host Notifications", desc: "Instantly route guests to the right person the moment they arrive." },
  { icon: "🔒", title: "Secure & Auditable", desc: "Complete audit trail and enterprise-grade security for compliance needs." },
];

const STEPS = [
  { title: "Register Your Company", desc: "Submit your details through our simple registration form below." },
  { title: "Admin Review", desc: "Our team reviews and activates your account, usually within 24 hours." },
  { title: "Receive Credentials", desc: "Get your admin login details to access your company portal." },
  { title: "Go Live", desc: "Add locations, team members, and start managing visitors instantly." },
];

const STATS = [
  { num: "500+", label: "Companies onboarded" },
  { num: "50K+", label: "Visitors managed" },
  { num: "99.9%", label: "Uptime SLA" },
  { num: "< 24h", label: "Setup time" },
];

export default function LandingPage() {
  const [form, setForm] = useState({ companyName: "", adminName: "", email: "", phone: "", industry: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.registerCompany(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp">

      {/* ── Navbar ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            Larkvel
          </div>
          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#how-it-works" className="lp-nav-link">How it Works</a>
            <a href="#register" className="lp-nav-cta">Get Started →</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-grid" />
        <div className="lp-hero-inner">
          <div className="lp-hero-badge">
            <span className="lp-hero-badge-dot" />
            Trusted by 500+ businesses worldwide
          </div>
          <h1>
            Modern Visitor Management<br />
            <span className="gradient-text">Built for Every Business</span>
          </h1>
          <p>
            Streamline check-ins, manage employee hosts, and keep your workplace secure — all from one elegant cloud-based platform.
          </p>
          <div className="lp-hero-btns">
            <a href="#register" className="lp-btn-primary">
              Start Free Trial
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            </a>
            <a href="#features" className="lp-btn-ghost">Learn More</a>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="lp-stats">
        <div className="lp-stats-inner">
          {STATS.map((s, i) => (
            <div key={i}>
              <div className="lp-stat-num">{s.num}</div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="lp-features">
        <div className="lp-section-inner">
          <div className="lp-section-eyebrow">Features</div>
          <h2 className="lp-section-title">Everything Your Workplace Needs</h2>
          <p className="lp-section-sub">Powerful tools designed for modern, security-conscious workplaces.</p>
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div className="lp-feature-card" key={i}>
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="lp-how">
        <div className="lp-section-inner">
          <div className="lp-section-eyebrow">Process</div>
          <h2 className="lp-section-title">Up and Running in 24 Hours</h2>
          <p className="lp-section-sub">A simple four-step process to get your company fully set up.</p>
          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <div className="lp-step" key={i}>
                <div className="lp-step-num">{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Register ── */}
      <section id="register" className="lp-register">
        <div className="lp-section-inner">
          <div className="lp-section-eyebrow">Registration</div>
          <h2 className="lp-section-title">Register Your Company</h2>
          <p className="lp-section-sub">Get started for free. No credit card required.</p>

          {success ? (
            <div className="lp-success">
              <div className="lp-success-icon">✅</div>
              <h3>Registration Submitted!</h3>
              <p>
                Your company is now <strong>pending admin approval</strong>.<br />
                You'll receive login credentials at the email provided once approved — usually within 24 hours.
              </p>
            </div>
          ) : (
            <div className="lp-form-card">
              {error && <div className="lp-alert">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="lp-form-grid">
                  <div className="lp-field">
                    <label>Company Name *</label>
                    <input name="companyName" value={form.companyName} onChange={handleChange} required placeholder="Acme Corporation" />
                  </div>
                  <div className="lp-field">
                    <label>Your Full Name *</label>
                    <input name="adminName" value={form.adminName} onChange={handleChange} required placeholder="John Smith" />
                  </div>
                  <div className="lp-field">
                    <label>Business Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@acme.com" />
                  </div>
                  <div className="lp-field">
                    <label>Phone</label>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                  </div>
                  <div className="lp-field wide">
                    <label>Industry</label>
                    <select name="industry" value={form.industry} onChange={handleChange}>
                      <option value="">Select industry…</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance & Banking</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="retail">Retail</option>
                      <option value="education">Education</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="lp-submit" disabled={loading}>
                  {loading ? "Submitting…" : "Submit Registration"}
                </button>
                <p className="lp-form-note">✓ Free 30-day trial &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Setup within 24 hours</p>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-logo">
            <div className="lp-logo-icon" style={{ width: 32, height: 32 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            Larkvel
          </div>
          <p className="lp-footer-note">
            Modern visitor management for every business.<br />
            Already approved? Access your dashboard at <strong style={{ color: "#818cf8" }}>yourcompany.larkvel.com</strong>
          </p>
          <div className="lp-footer-divider" />
          <p className="lp-footer-copy">© 2025 Larkvel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
