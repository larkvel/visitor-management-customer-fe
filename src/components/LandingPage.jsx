import React, { useState } from "react";
import { api } from "../api";

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
    setLoading(true);
    setError("");
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
    <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: "#1a1a2e", margin: 0 }}>

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", zIndex: 100, padding: "0 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#6366f1" }}>🏢 Larkvel</div>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <a href="#features" style={{ textDecoration: "none", color: "#555", fontSize: "14px", fontWeight: "500" }}>Features</a>
            <a href="#how-it-works" style={{ textDecoration: "none", color: "#555", fontSize: "14px", fontWeight: "500" }}>How It Works</a>
            <a href="#register" style={{ textDecoration: "none", background: "#6366f1", color: "white", padding: "9px 22px", borderRadius: "6px", fontSize: "14px", fontWeight: "600" }}>Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)", color: "white", padding: "100px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: "800", margin: "0 0 20px", lineHeight: 1.15 }}>
            Modern Visitor Management for Every Business
          </h1>
          <p style={{ fontSize: "18px", opacity: 0.9, marginBottom: "40px", lineHeight: 1.65 }}>
            Streamline visitor check-ins, manage employee hosts, and keep your workplace secure with Larkvel's cloud-based platform.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#register" style={{ display: "inline-block", padding: "14px 36px", background: "white", color: "#6366f1", borderRadius: "8px", fontWeight: "700", textDecoration: "none", fontSize: "16px" }}>
              Start Free Trial
            </a>
            <a href="#features" style={{ display: "inline-block", padding: "14px 36px", border: "2px solid rgba(255,255,255,0.7)", color: "white", borderRadius: "8px", fontWeight: "600", textDecoration: "none", fontSize: "16px" }}>
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>Everything You Need</h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "52px", fontSize: "16px" }}>Powerful features built for modern workplaces</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "24px" }}>
            {[
              { icon: "👤", title: "Digital Check-In", desc: "Smooth digital check-in with instant host notifications and visitor badges." },
              { icon: "📊", title: "Real-time Dashboard", desc: "Live view of expected visitors, who's on-site, and completed visits." },
              { icon: "👥", title: "Team Management", desc: "Create users with role-based permissions tailored to your organisation." },
              { icon: "🏢", title: "Multi-location", desc: "Manage multiple offices or locations from a single dashboard." },
              { icon: "🔔", title: "Host Notifications", desc: "Instantly alert the right people when their guests arrive." },
              { icon: "🔒", title: "Secure & Auditable", desc: "Complete audit trail and enterprise-grade security for compliance." }
            ].map((f, i) => (
              <div key={i} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "28px" }}>
                <div style={{ fontSize: "34px", marginBottom: "14px" }}>{f.icon}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: "17px" }}>{f.title}</h3>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "14px", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: "80px 24px", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>How It Works</h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "52px", fontSize: "16px" }}>Up and running in 24 hours</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "32px" }}>
            {[
              { title: "Register Your Company", desc: "Submit your company details through our simple registration form." },
              { title: "Admin Approval", desc: "Our team reviews and approves your account, usually within 24 hours." },
              { title: "Receive Credentials", desc: "Get your admin login details by email to access your company portal." },
              { title: "Go Live", desc: "Configure locations, add team members, and start managing visitors." }
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "24px" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#6366f1", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", margin: "0 auto 20px" }}>{i + 1}</div>
                <h3 style={{ margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Register */}
      <section id="register" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>Register Your Company</h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "48px", fontSize: "16px" }}>Get started for free. No credit card required.</p>

          {success ? (
            <div style={{ textAlign: "center", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "48px 32px" }}>
              <div style={{ fontSize: "52px", marginBottom: "16px" }}>✅</div>
              <h3 style={{ margin: "0 0 12px", fontSize: "22px" }}>Registration Submitted!</h3>
              <p style={{ color: "#166534", marginBottom: "8px" }}>Your company is now pending admin approval.</p>
              <p style={{ color: "#166534", margin: 0 }}>You'll receive your login credentials at the email provided once approved — usually within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "40px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: "6px", fontSize: "14px" }}>{error}</div>}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>Company Name *</label>
                  <input name="companyName" value={form.companyName} onChange={handleChange} required placeholder="Acme Corporation" style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>Your Full Name *</label>
                  <input name="adminName" value={form.adminName} onChange={handleChange} required placeholder="John Smith" style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>Business Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@company.com" style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>Phone</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1 555-000-0000" style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>Industry</label>
                <select name="industry" value={form.industry} onChange={handleChange} style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}>
                  <option value="">Select industry</option>
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

              <button type="submit" disabled={loading} style={{ padding: "13px", background: "#6366f1", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Submitting..." : "Submit Registration"}
              </button>
              <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", margin: 0 }}>
                ✓ Free 30-day trial &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Setup within 24 hours
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#1f2937", color: "#9ca3af", padding: "40px 24px", textAlign: "center" }}>
        <p style={{ margin: "0 0 8px", fontWeight: "600", color: "#e5e7eb" }}>🏢 Larkvel</p>
        <p style={{ margin: "0 0 8px", fontSize: "13px" }}>© 2025 Larkvel. All rights reserved.</p>
        <p style={{ margin: 0, fontSize: "13px" }}>Already approved? Access your dashboard at <strong>yourcompany.larkvel.com</strong></p>
      </footer>
    </div>
  );
}
