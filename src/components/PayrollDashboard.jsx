import React, { useEffect, useState } from "react";
import { api } from "../api";
import { CircleDollarSign, Calendar, FileText, Settings, Key, PenTool, Printer, Check, Landmark } from "lucide-react";

export default function PayrollDashboard({ companyId, users, session, setError }) {
  const isAdmin = session.user.role === "company_admin" || session.user.role === "platform_admin";
  
  // Date states
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-indexed
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  
  // Calculations states
  const [calculations, setCalculations] = useState([]);
  const [savedSlips, setSavedSlips] = useState([]);
  const [settings, setSettings] = useState({ company_display_name: "", company_address: "", footer_text: "", digital_signature_base64: "" });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(isAdmin ? "calculate" : "slips");

  // Payslip Modal state
  const [activeSlip, setActiveSlip] = useState(null);

  // Load saved configurations
  async function loadSettings() {
    try {
      const data = await api.getPayrollSettings();
      setSettings(data);
    } catch (err) {
      setError(err.message);
    }
  }

  // Load historic saved slips
  async function loadSavedSlips() {
    try {
      const data = await api.getPayslips(companyId, year, month);
      setSavedSlips(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadSettings();
    loadSavedSlips();
  }, [year, month]);

  // Run calculation triggers
  async function triggerCalculation() {
    setLoading(true);
    setError("");
    try {
      const data = await api.calculatePayroll(companyId, year, month);
      setCalculations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Lock and save a slip to DB
  async function handleLockSlip(calc) {
    setError("");
    try {
      await api.savePayslip({
        userId: calc.userId,
        year,
        month,
        presentDays: calc.presentDays,
        absentDays: calc.absentDays,
        paidLeavesUsed: calc.paidLeavesUsed,
        unpaidLeavesUsed: calc.unpaidLeavesUsed,
        grossSalary: calc.grossSalary,
        netSalary: calc.netSalary,
        status: "approved"
      });
      // reload saved slips list
      await loadSavedSlips();
      // Remove from pending list
      setCalculations(prev => prev.filter(c => c.userId !== calc.userId));
      alert(`Payslip for ${calc.fullName} has been finalized and locked.`);
    } catch (err) {
      setError(err.message);
    }
  }

  // Handle template settings save
  async function handleSaveSettings(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await api.savePayrollSettings({
        companyDisplayName: settings.company_display_name,
        companyAddress: settings.company_address,
        footerText: settings.footer_text,
        digitalSignatureBase64: settings.digital_signature_base64
      });
      setSettings(response);
      alert("Payslip template configuration saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle signature file uploader
  function handleSignatureUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Limit is 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSettings(prev => ({ ...prev, digital_signature_base64: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  // Month labels
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Sub Bar Tabs */}
      <div className="panelHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border1)", paddingBottom: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {isAdmin && (
            <button 
              className={`sub-nav-btn ${activeTab === "calculate" ? "active" : ""}`}
              onClick={() => setActiveTab("calculate")}
              style={{ fontSize: 13, padding: "8px 16px" }}
            >
              <CircleDollarSign size={15} /> Run Calculations
            </button>
          )}
          <button 
            className={`sub-nav-btn ${activeTab === "slips" ? "active" : ""}`}
            onClick={() => setActiveTab("slips")}
            style={{ fontSize: 13, padding: "8px 16px" }}
          >
            <FileText size={15} /> Locked Payslips
          </button>
          {isAdmin && (
            <button 
              className={`sub-nav-btn ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
              style={{ fontSize: 13, padding: "8px 16px" }}
            >
              <Settings size={15} /> Payslip Template
            </button>
          )}
        </div>

        {/* Date Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text)", padding: "6px 12px", borderRadius: 8, fontSize: 12, outline: "none" }}>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text)", padding: "6px 12px", borderRadius: 8, fontSize: 12, outline: "none" }}>
            {Array.from({ length: 5 }, (_, i) => currentYear - i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Calculate Panel */}
      {activeTab === "calculate" && (
        <section className="panel" style={{ background: "var(--bg2)", border: "1px solid var(--border1)", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Run monthly payroll computations</h2>
              <p style={{ fontSize: 12, color: "var(--text-sub)", margin: "4px 0 0 0" }}>Calculate net wages based on attendance logs and leave limit values.</p>
            </div>
            <button className="primaryButton" onClick={triggerCalculation} disabled={loading}>
              Calculate Wage Records
            </button>
          </div>

          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div className="spinner" />
              <p style={{ fontSize: 13, color: "var(--text-sub)" }}>Running computations...</p>
            </div>
          ) : calculations.length === 0 ? (
            <div className="empty" style={{ padding: "50px 0", textAlign: "center", color: "var(--text-sub)" }}>
              No wage computations run. Select a date and click calculate.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border1)" }}>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Employee</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Salary Mode</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Work Days</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Days Present</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Leaves Used</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Calculated Net</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {calculations.map((calc, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border2)" }}>
                      <td style={{ padding: "16px", fontSize: 13, color: "var(--text)" }}>
                        <div style={{ fontWeight: 600 }}>{calc.fullName}</div>
                        <div style={{ fontSize: 11, color: "var(--text-sub)" }}>{calc.email}</div>
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, color: "var(--text)" }}>
                        {calc.salaryType === "daily" ? `Daily ($${calc.salaryRate})` : `Monthly ($${calc.salaryRate})`}
                      </td>
                      <td style={{ padding: "16px", fontSize: 13 }}>{calc.workingDays}</td>
                      <td style={{ padding: "16px", fontSize: 13 }}>{calc.presentDays}</td>
                      <td style={{ padding: "16px", fontSize: 13 }}>
                        <span style={{ color: "var(--success)" }}>Paid: {calc.paidLeavesUsed}</span>
                        {calc.unpaidLeavesUsed > 0 && <span style={{ color: "var(--danger)", marginLeft: 6 }}>Unpaid: {calc.unpaidLeavesUsed}</span>}
                      </td>
                      <td style={{ padding: "16px", fontSize: 14, fontWeight: 800, color: "var(--primary)" }}>
                        ${calc.netSalary}
                      </td>
                      <td style={{ padding: "16px", display: "flex", gap: 8 }}>
                        <button 
                          className="primaryButton"
                          onClick={() => handleLockSlip(calc)}
                          style={{ padding: "6px 12px", fontSize: 11, borderRadius: 6 }}
                        >
                          <Check size={12} /> Lock & Save
                        </button>
                        <button 
                          className="secButton"
                          onClick={() => setActiveSlip({ ...calc, year, month })}
                          style={{ padding: "6px 12px", fontSize: 11, borderRadius: 6 }}
                        >
                          Preview Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Saved Slips Panel */}
      {activeTab === "slips" && (
        <section className="panel" style={{ background: "var(--bg2)", border: "1px solid var(--border1)", borderRadius: 12, padding: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Finalized monthly payslips</h2>
            <p style={{ fontSize: 12, color: "var(--text-sub)", margin: "4px 0 0 0" }}>View and print payroll records signed digitally by administrators.</p>
          </div>

          {savedSlips.length === 0 ? (
            <div className="empty" style={{ padding: "50px 0", textAlign: "center", color: "var(--text-sub)" }}>
              No finalized payslips logged for this month.
            </div>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 20 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border1)" }}>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Employee</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Salary Settings</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Locked Period</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Days Present</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Net Wage</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Status</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {savedSlips.map((slip, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border2)" }}>
                      <td style={{ padding: "16px", fontSize: 13, color: "var(--text)" }}>
                        <div style={{ fontWeight: 600 }}>{slip.full_name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-sub)" }}>{slip.email}</div>
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, color: "var(--text)" }}>
                        {slip.salary_type === "daily" ? `Daily ($${slip.salary_rate})` : `Monthly ($${slip.salary_rate})`}
                      </td>
                      <td style={{ padding: "16px", fontSize: 13 }}>
                        {months.find(m => m.value === slip.month)?.label} {slip.year}
                      </td>
                      <td style={{ padding: "16px", fontSize: 13 }}>{slip.present_days} present</td>
                      <td style={{ padding: "16px", fontSize: 14, fontWeight: 800, color: "var(--success)" }}>
                        ${slip.net_salary}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span className="badge active">Finalized</span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <button 
                          className="primaryButton"
                          onClick={() => setActiveSlip({
                            userId: slip.user_id,
                            fullName: slip.full_name,
                            email: slip.email,
                            salaryType: slip.salary_type,
                            salaryRate: Number(slip.salary_rate),
                            presentDays: Number(slip.present_days),
                            absentDays: Number(slip.absent_days),
                            paidLeavesUsed: Number(slip.paid_leaves_used),
                            unpaidLeavesUsed: Number(slip.unpaid_leaves_used),
                            netSalary: Number(slip.net_salary),
                            year: slip.year,
                            month: slip.month
                          })}
                          style={{ padding: "6px 12px", fontSize: 11, borderRadius: 6 }}
                        >
                          <FileText size={12} /> Open Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Settings Template Panel */}
      {activeTab === "settings" && (
        <section className="panel" style={{ background: "var(--bg2)", border: "1px solid var(--border1)", borderRadius: 12, padding: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Payslip design template settings</h2>
            <p style={{ fontSize: 12, color: "var(--text-sub)", margin: "4px 0 0 0" }}>Customize your payslip headers, company address, disclaimer footer, and signature seal.</p>
          </div>

          <form onSubmit={handleSaveSettings} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="fieldGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <label style={{ gridColumn: "span 2" }}>Company Header Display Name *
                <input 
                  value={settings.company_display_name} 
                  onChange={e => setSettings({ ...settings, company_display_name: e.target.value })} 
                  required 
                  placeholder="Larkvel Solutions Inc."
                />
              </label>
              <label style={{ gridColumn: "span 2" }}>Company Registered Address *
                <input 
                  value={settings.company_address} 
                  onChange={e => setSettings({ ...settings, company_address: e.target.value })} 
                  required 
                  placeholder="Suite 404, Tech Park Building, Delaware"
                />
              </label>
              <label style={{ gridColumn: "span 2" }}>Payslip Footer Notes / Disclaimer
                <input 
                  value={settings.footer_text} 
                  onChange={e => setSettings({ ...settings, footer_text: e.target.value })} 
                  placeholder="This is a computer generated payslip and requires no physical seal."
                />
              </label>
              
              <label style={{ gridColumn: "span 2" }}>Digital Authorized Signature Image
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 20 }}>
                  {settings.digital_signature_base64 && (
                    <div style={{ border: "1px solid var(--border2)", background: "#fff", padding: 8, borderRadius: 6, width: 120, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={settings.digital_signature_base64} alt="Digital Sign" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <input type="file" accept="image/*" onChange={handleSignatureUpload} style={{ fontSize: 12 }} />
                    <span style={{ fontSize: 10, color: "var(--text-sub)" }}>PNG signature image with transparent background works best.</span>
                  </div>
                </div>
              </label>
            </div>

            <div>
              <button className="primaryButton" type="submit" disabled={submitting}>
                <PenTool size={14} /> Save Template Configuration
              </button>
            </div>
          </form>
        </section>
      )}

      {/* printable modal details */}
      {activeSlip && (
        <div className="modalOverlay" style={{ zIndex: 110 }}>
          <div className="modalCard" style={{ maxWidth: 650, width: "95%" }}>
            
            {/* Printable Frame wrapper */}
            <div id="payslip-print-area" style={{ background: "#fff", color: "#1e293b", padding: 32, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #e2e8f0", paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: 0, color: "#0f172a", fontSize: 20, fontWeight: 800 }}>{settings.company_display_name || session.user.companyName}</h2>
                  <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#64748b" }}>{settings.company_address || "Registered Corporate Office"}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", background: "#f1f5f9", padding: "4px 8px", borderRadius: 4, color: "#4f46e5" }}>Salary Slip</span>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 8 }}>Period: {months.find(m => m.value === activeSlip.month)?.label} {activeSlip.year}</div>
                </div>
              </div>

              {/* Grid detail summary */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, fontSize: 12 }}>
                <div>
                  <div style={{ color: "#64748b", fontWeight: 600 }}>Employee Name:</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{activeSlip.fullName}</div>
                  <div style={{ color: "#64748b", marginTop: 8 }}>Email: {activeSlip.email}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontWeight: 600 }}>Salary Settings:</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                    {activeSlip.salaryType === "daily" ? `Daily Rate: $${activeSlip.salaryRate}` : `Monthly Base: $${activeSlip.salaryRate}`}
                  </div>
                  <div style={{ color: "#64748b", marginTop: 8 }}>Days Present: {activeSlip.presentDays} days</div>
                </div>
              </div>

              {/* Slip Table details */}
              <table style={{ width: "100%", borderCollapse: "collapse", textAlignment: "left", fontSize: 12, marginBottom: 24 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "8px 12px", color: "#475569" }}>Description</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", color: "#475569" }}>Calculation</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", color: "#475569" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px" }}>Base Salary Earnings ({activeSlip.salaryType === "daily" ? "Daily wage" : "Monthly scale"})</td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      {activeSlip.salaryType === "daily" 
                        ? `${activeSlip.presentDays} days present`
                        : `${activeSlip.presentDays} days present / ${activeSlip.presentDays + activeSlip.absentDays} working days`
                      }
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: 600 }}>
                      ${activeSlip.salaryType === "daily" ? (activeSlip.presentDays * activeSlip.salaryRate) : activeSlip.salaryRate}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px" }}>Paid Leaves Allowance</td>
                    <td style={{ padding: "12px", textAlign: "right" }}>{activeSlip.paidLeavesUsed} days allowed</td>
                    <td style={{ padding: "12px", textAlign: "right", color: "green", fontWeight: 600 }}>
                      ${activeSlip.salaryType === "daily" ? (activeSlip.paidLeavesUsed * activeSlip.salaryRate) : 0}
                    </td>
                  </tr>
                  {activeSlip.unpaidLeavesUsed > 0 && (
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px", color: "#ef4444" }}>Unpaid Leave Deductions</td>
                      <td style={{ padding: "12px", textAlign: "right" }}>{activeSlip.unpaidLeavesUsed} excess absences</td>
                      <td style={{ padding: "12px", textAlign: "right", color: "#ef4444", fontWeight: 600 }}>
                        -${activeSlip.salaryType === "daily" 
                          ? 0 
                          : Number(((activeSlip.salaryRate / (activeSlip.presentDays + activeSlip.absentDays)) * activeSlip.unpaidLeavesUsed).toFixed(2))
                        }
                      </td>
                    </tr>
                  )}
                  <tr style={{ borderTop: "2px solid #e2e8f0", background: "#f8fafc", fontWeight: 700 }}>
                    <td style={{ padding: "12px", fontSize: 13 }}>Net Payable Salary</td>
                    <td style={{ padding: "12px" }}></td>
                    <td style={{ padding: "12px", textAlign: "right", fontSize: 13, color: "#4f46e5" }}>
                      ${activeSlip.netSalary}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signature Seal */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40 }}>
                <div style={{ fontSize: 11, color: "#64748b", maxWidth: 300 }}>
                  {settings.footer_text || "This document is generated and digitally verified by the authorized human resources team."}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", borderTop: "1px solid #cbd5e1", width: 150, paddingTop: 6 }}>
                  {settings.digital_signature_base64 ? (
                    <img src={settings.digital_signature_base64} alt="Signature" style={{ height: 40, marginBottom: 4, objectFit: "contain" }} />
                  ) : (
                    <div style={{ height: 40, marginBottom: 4, fontSize: 10, fontStyle: "italic", color: "#94a3b8" }}>Seal missing</div>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#475569" }}>Authorized Seal</span>
                </div>
              </div>
            </div>

            {/* Print and Close controls */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button type="button" className="secButton" onClick={() => setActiveSlip(null)}>Close</button>
              <button 
                type="button" 
                className="primaryButton"
                onClick={() => {
                  const printContents = document.getElementById("payslip-print-area").innerHTML;
                  const originalContents = document.body.innerHTML;
                  
                  // Setup temporary print body frame
                  document.body.innerHTML = `
                    <html>
                    <head>
                      <style>
                        body { background: #fff !important; color: #000 !important; font-family: sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border-bottom: 1px solid #ddd; padding: 8px; }
                      </style>
                    </head>
                    <body>
                      ${printContents}
                    </body>
                    </html>
                  `;
                  window.print();
                  
                  // Restore app view state
                  document.body.innerHTML = originalContents;
                  window.location.reload(); // Reload to restore react binders
                }}
              >
                <Printer size={15} /> Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
