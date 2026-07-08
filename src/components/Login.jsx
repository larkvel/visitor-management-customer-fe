import React, { useState } from "react";
import { api } from "../api";

export default function Login({ subdomain, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.login(username, password);
      onLogin(result);
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", padding: "48px 40px", width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "42px", marginBottom: "10px" }}>🏢</div>
          <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "700" }}>Visitor Management</h1>
          <p style={{ margin: 0, color: "#6366f1", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {subdomain}.larkvel.com
          </p>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontWeight: "600", fontSize: "14px", marginBottom: "6px", color: "#374151" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: "600", fontSize: "14px", marginBottom: "6px", color: "#374151" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "12px", background: "#6366f1", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", marginTop: "8px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "#9ca3af" }}>
          Need an account? <a href="https://larkvel.com" style={{ color: "#6366f1", textDecoration: "none", fontWeight: "500" }}>Register at larkvel.com</a>
        </p>
      </div>
    </div>
  );
}
