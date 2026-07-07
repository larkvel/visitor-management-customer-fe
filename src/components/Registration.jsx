import React, { useState } from "react";
import { api } from "../api";

export function Registration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    industry: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      if (!formData.name || !formData.email) {
        throw new Error("Company name and email are required");
      }

      const response = await api.registerCompany(formData);
      setSuccess({
        companyName: response.name,
        subdomain: response.subdomain,
        message: response.message,
        nextSteps: response.nextSteps
      });
      setFormData({ name: "", email: "", phone: "", industry: "" });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Register Your Company</h1>
        <p style={styles.subtitle}>Join our visitor management platform</p>

        {error && (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {success ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <h2>Registration Successful!</h2>
            <p>Welcome, <strong>{success.companyName}</strong></p>
            
            <div style={styles.subdomain}>
              Your subdomain: <code>{success.subdomain}.larkvel.com</code>
            </div>

            <h3>Next Steps:</h3>
            <ol style={styles.stepsList}>
              {success.nextSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>

            <button 
              onClick={() => window.location.href = `https://${success.subdomain}.larkvel.com`}
              style={styles.primaryButton}
            >
              Go to Your Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label>Company Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Acme Corporation"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label>Business Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@company.com"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div style={styles.formGroup}>
              <label>Industry</label>
              <select name="industry" value={formData.industry} onChange={handleChange}>
                <option value="">Select an industry</option>
                <option value="tech">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="education">Education</option>
                <option value="hospitality">Hospitality</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading ? "Registering..." : "Register Company"}
            </button>

            <p style={styles.terms}>
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px"
  },
  card: {
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    padding: "40px",
    maxWidth: "500px",
    width: "100%"
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#333"
  },
  subtitle: {
    color: "#666",
    marginBottom: "24px",
    fontSize: "14px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  label: {
    fontWeight: "500",
    fontSize: "14px",
    color: "#333"
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    "&:focus": {
      outline: "none",
      borderColor: "#667eea"
    }
  },
  primaryButton: {
    padding: "12px 24px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
    marginTop: "12px"
  },
  error: {
    background: "#fee",
    color: "#c33",
    padding: "12px",
    borderRadius: "4px",
    marginBottom: "20px",
    fontSize: "14px"
  },
  successBox: {
    textAlign: "center",
    padding: "20px"
  },
  successIcon: {
    fontSize: "48px",
    color: "#4caf50",
    marginBottom: "16px"
  },
  subdomain: {
    background: "#f5f5f5",
    padding: "12px",
    borderRadius: "4px",
    margin: "16px 0",
    fontFamily: "monospace"
  },
  stepsList: {
    textAlign: "left",
    margin: "16px 0",
    paddingLeft: "20px"
  },
  terms: {
    fontSize: "12px",
    color: "#999",
    marginTop: "12px",
    textAlign: "center"
  }
};
