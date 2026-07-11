import React, { useEffect, useState } from "react";
import {
  CalendarCheck, CalendarX2, Clock3, UserPlus, CheckCircle2,
  XCircle, AlertCircle, FileText, Send, ChevronDown, MapPin, Users
} from "lucide-react";
import { api } from "../api";
import { toDateTimeLocal, toIso } from "../utils/helpers";

// ── Reusable small components ─────────────────────────────

function StatCard({ icon, label, value, color }) {
  const colors = {
    green:  { bg: "rgba(16,185,129,.12)", text: "#10b981", border: "rgba(16,185,129,.25)" },
    red:    { bg: "rgba(239,68,68,.12)",  text: "#ef4444", border: "rgba(239,68,68,.25)" },
    blue:   { bg: "rgba(99,102,241,.12)", text: "#6366f1", border: "rgba(99,102,241,.25)" },
    amber:  { bg: "rgba(245,158,11,.12)", text: "#f59e0b", border: "rgba(245,158,11,.25)" },
    purple: { bg: "rgba(168,85,247,.12)", text: "#a855f7", border: "rgba(168,85,247,.25)" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div style={{
      background: "var(--bg2)", border: `1px solid ${c.border}`,
      borderRadius: 12, padding: "18px 20px",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: c.bg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <span style={{ color: c.text }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:  { bg: "rgba(245,158,11,.15)", color: "#f59e0b",  label: "Pending" },
    approved: { bg: "rgba(16,185,129,.15)", color: "#10b981",  label: "Approved" },
    rejected: { bg: "rgba(239,68,68,.15)",  color: "#ef4444",  label: "Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap"
    }}>
      {s.label}
    </span>
  );
}

// ── Main Employee Dashboard ───────────────────────────────

export default function EmployeeDashboard({ session, locations, hosts, onVisitSubmit, visitForm, onVisitChange, setError }) {
  const companyId = session.user.companyId;
  const attendanceEnabled = session.user.attendanceEnabled;

  const [summary, setSummary] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState(attendanceEnabled ? "attendance" : "register");

  // Leave form
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "casual",
    fromDate: "",
    toDate: "",
    reason: ""
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState("");

  async function loadEmployeeData() {
    setLoadingData(true);
    try {
      const promises = [api.listLeaveRequests(companyId, session.user.id)];
      if (attendanceEnabled) promises.unshift(api.getMyAttendanceSummary());
      const results = await Promise.all(promises);
      if (attendanceEnabled) {
        setSummary(results[0]);
        setLeaveRequests(results[1]);
      } else {
        setLeaveRequests(results[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => { loadEmployeeData(); }, []);

  async function handleLeaveSubmit(e) {
    e.preventDefault();
    setSubmittingLeave(true);
    setLeaveSuccess("");
    try {
      await api.submitLeaveRequest({ ...leaveForm, companyId });
      setLeaveForm({ leaveType: "casual", fromDate: "", toDate: "", reason: "" });
      setLeaveSuccess("Leave request submitted successfully!");
      await loadEmployeeData();
      setTimeout(() => setLeaveSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingLeave(false);
    }
  }

  const tabs = [
    ...(attendanceEnabled ? [{ key: "attendance", label: "My Attendance", icon: <CalendarCheck size={15} /> }] : []),
    { key: "leave",      label: "Leave",        icon: <FileText size={15} /> },
    { key: "register",   label: "Register Visitor", icon: <UserPlus size={15} /> },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>

      {/* Welcome banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(99,102,241,.15) 0%, rgba(168,85,247,.1) 100%)",
        border: "1px solid rgba(99,102,241,.25)", borderRadius: 14, padding: "18px 24px",
        marginBottom: 20, display: "flex", alignItems: "center", gap: 14
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 700, color: "#fff", flexShrink: 0
        }}>
          {session.user.fullName?.charAt(0).toUpperCase() || "E"}
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>
            Welcome, {session.user.fullName}
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 2 }}>
            Employee Dashboard · {session.user.companyName}
            {summary?.pendingLeaves > 0 && (
              <span style={{
                marginLeft: 10, background: "rgba(245,158,11,.2)", color: "#f59e0b",
                borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700
              }}>
                {summary.pendingLeaves} leave{summary.pendingLeaves > 1 ? "s" : ""} pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Attendance stats row */}
      {attendanceEnabled && summary && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12, marginBottom: 20
        }}>
          <StatCard icon={<CalendarCheck size={20} />} label="Days Present" value={summary.presentDays} color="green" />
          <StatCard icon={<CalendarX2 size={20} />}   label="Days Absent"  value={summary.absentDays}  color="red" />
          <StatCard icon={<Clock3 size={20} />}        label="Hours Worked" value={summary.totalHours}  color="blue" />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Leave Balance"
            value={`${summary.leaveBalance.remaining >= 0 ? summary.leaveBalance.remaining : 0} / ${summary.leaveBalance.monthlyQuota}`}
            color={summary.leaveBalance.remaining > 0 ? "purple" : "amber"}
          />
        </div>
      )}

      {/* Tab bar */}
      <div className="tab-bar" style={{ marginBottom: 18 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── ATTENDANCE TAB ── */}
      {activeTab === "attendance" && attendanceEnabled && (
        <div className="panel">
          <div className="panelHeader">
            <CalendarCheck size={18} />
            <h2>My Attendance — {summary?.month || "This Month"}</h2>
          </div>

          {loadingData ? (
            <div className="empty">Loading attendance data…</div>
          ) : summary?.dailyLogs?.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Date", "First In", "Last Out", "Hours Worked", "Status"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "var(--text2)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summary.dailyLogs.map((row, i) => {
                    const hasIn  = !!row.first_in;
                    const hasOut = !!row.last_out;
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border2)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                          {new Date(row.punch_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" })}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#10b981" }}>
                          {hasIn ? new Date(row.first_in).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#6366f1" }}>
                          {hasOut ? new Date(row.last_out).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </td>
                        <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                          {row.hoursWorked > 0 ? `${row.hoursWorked}h` : "—"}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            background: hasIn && hasOut ? "rgba(16,185,129,.15)" : "rgba(245,158,11,.15)",
                            color: hasIn && hasOut ? "#10b981" : "#f59e0b",
                            padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700
                          }}>
                            {hasIn && hasOut ? "Complete" : hasIn ? "In Only" : "Absent"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">No attendance records for this month.</div>
          )}
        </div>
      )}

      {/* ── LEAVE TAB ── */}
      {activeTab === "leave" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

          {/* Leave Request Form */}
          <div className="panel">
            <div className="panelHeader">
              <Send size={18} />
              <h2>Request Leave</h2>
            </div>

            {attendanceEnabled && summary && (
              <div style={{
                background: "var(--bg3)", border: "1px solid var(--border2)",
                borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "var(--text2)" }}>Monthly Quota</span>
                  <strong>{summary.leaveBalance.monthlyQuota} days</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "var(--text2)" }}>Casual Used</span>
                  <strong style={{ color: "#f59e0b" }}>{summary.leaveBalance.casualUsed} days</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "var(--text2)" }}>Sick Used</span>
                  <strong style={{ color: "#ef4444" }}>{summary.leaveBalance.sickUsed} days</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 6, marginTop: 4 }}>
                  <span style={{ color: "var(--text2)" }}>Remaining</span>
                  <strong style={{ color: summary.leaveBalance.remaining > 0 ? "#10b981" : "#ef4444" }}>
                    {Math.max(0, summary.leaveBalance.remaining)} days
                  </strong>
                </div>
              </div>
            )}

            {leaveSuccess && (
              <div style={{
                background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.3)",
                color: "#10b981", borderRadius: 8, padding: "10px 14px",
                marginBottom: 14, fontSize: 13, fontWeight: 600
              }}>
                ✓ {leaveSuccess}
              </div>
            )}

            <form onSubmit={handleLeaveSubmit}>
              <div className="fieldGrid">
                <label>Leave Type
                  <select
                    value={leaveForm.leaveType}
                    onChange={e => setLeaveForm(p => ({ ...p, leaveType: e.target.value }))}
                  >
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </label>
                <label>From Date
                  <input
                    type="date"
                    value={leaveForm.fromDate}
                    onChange={e => setLeaveForm(p => ({ ...p, fromDate: e.target.value }))}
                    required
                  />
                </label>
                <label>To Date
                  <input
                    type="date"
                    value={leaveForm.toDate}
                    min={leaveForm.fromDate}
                    onChange={e => setLeaveForm(p => ({ ...p, toDate: e.target.value }))}
                    required
                  />
                </label>
                <label className="wide">Reason
                  <textarea
                    value={leaveForm.reason}
                    onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))}
                    placeholder="Brief reason for leave…"
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
                </label>
              </div>
              <button className="primaryButton" type="submit" disabled={submittingLeave}>
                <Send size={15} />
                {submittingLeave ? "Submitting…" : "Submit Leave Request"}
              </button>
            </form>
          </div>

          {/* My Leave History */}
          <div className="panel">
            <div className="panelHeader">
              <FileText size={18} />
              <h2>My Leave History</h2>
            </div>

            {leaveRequests.length === 0 ? (
              <div className="empty">No leave requests yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {leaveRequests.map(lr => (
                  <div key={lr.id} style={{
                    background: "var(--bg3)", border: "1px solid var(--border2)",
                    borderRadius: 8, padding: "12px 14px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                          {lr.leave_type.charAt(0).toUpperCase() + lr.leave_type.slice(1)} Leave
                          <span style={{ marginLeft: 6, fontWeight: 400, color: "var(--text2)", fontSize: 12 }}>
                            ({lr.days_count} day{lr.days_count > 1 ? "s" : ""})
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text2)" }}>
                          {new Date(lr.from_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          {" → "}
                          {new Date(lr.to_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        {lr.reason && (
                          <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4, fontStyle: "italic" }}>"{lr.reason}"</div>
                        )}
                        {lr.reviewer_name && (
                          <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 3 }}>
                            Reviewed by {lr.reviewer_name}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={lr.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── REGISTER VISITOR TAB ── */}
      {activeTab === "register" && (
        <form className="panel" onSubmit={onVisitSubmit}>
          <div className="panelHeader">
            <UserPlus size={18} />
            <h2>Register a Visitor</h2>
          </div>

          {locations.length === 0 && (
            <div className="warn-banner">
              No locations configured yet. Please contact your administrator.
            </div>
          )}

          <div className="fieldGrid">
            <label>Visitor Name <input name="visitorName" value={visitForm.visitorName} onChange={onVisitChange} required placeholder="Jane Doe" /></label>
            <label>Email <input name="visitorEmail" type="email" value={visitForm.visitorEmail} onChange={onVisitChange} placeholder="jane@example.com" /></label>
            <label>Phone <input name="visitorPhone" value={visitForm.visitorPhone} onChange={onVisitChange} placeholder="+91 98765 43210" /></label>
            <label>Expected At <input name="expectedAt" type="datetime-local" value={visitForm.expectedAt} onChange={onVisitChange} required /></label>
            <label>Location
              <select name="locationId" value={visitForm.locationId} onChange={onVisitChange} required disabled={locations.length === 0}>
                {locations.length === 0
                  ? <option value="">No locations set up</option>
                  : locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)
                }
              </select>
            </label>
            <label>Department
              <select name="hostId" value={visitForm.hostId} onChange={onVisitChange}>
                <option value="">Select Department…</option>
                {hosts.map(h => <option key={h.id} value={h.id}>{h.department}</option>)}
              </select>
            </label>
            <label>Host Name *
              <input name="hostName" value={visitForm.hostName || ""} onChange={onVisitChange} required placeholder="John Doe" />
            </label>
            <label>Host Email *
              <input name="hostEmail" type="email" value={visitForm.hostEmail || ""} onChange={onVisitChange} required placeholder="host@company.com" />
            </label>
            <label className="wide">Purpose <input name="purpose" value={visitForm.purpose} onChange={onVisitChange} required placeholder="Meeting / Interview / Delivery…" /></label>
          </div>

          <button className="primaryButton" type="submit" disabled={locations.length === 0}>
            <UserPlus size={16} /> Register Visitor
          </button>
        </form>
      )}
    </div>
  );
}
