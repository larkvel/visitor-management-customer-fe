import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Users, CheckCircle2, AlertCircle, Clock, Calendar, ArrowRight, ShieldCheck } from "lucide-react";

export default function AttendanceDashboard({ companyId, users, session, setError }) {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0 });
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  // Load stats and logs
  async function loadData() {
    setLoading(true);
    try {
      const [fetchedLogs, fetchedStats] = await Promise.all([
        api.getAttendance(companyId, startDate, endDate),
        api.getAttendanceStats(companyId)
      ]);
      setLogs(fetchedLogs);
      setStats(fetchedStats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  // Filter logs for the current logged in user
  const personalLogs = logs.filter(l => l.user_id === session.user.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Metrics Row */}
      <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        <div className="metric-card" style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--bg2)", border: "1px solid var(--border1)", padding: 20, borderRadius: 12 }}>
          <div className="metric-icon" style={{ background: "rgba(99,102,241,.1)", color: "var(--primary)", padding: 12, borderRadius: 10, display: "inline-flex" }}><Users size={24} /></div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{stats.total}</div>
            <div style={{ fontSize: 12, color: "var(--text-sub)", fontWeight: 500 }}>Total Employees</div>
          </div>
        </div>
        <div className="metric-card" style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--bg2)", border: "1px solid var(--border1)", padding: 20, borderRadius: 12 }}>
          <div className="metric-icon" style={{ background: "rgba(34,197,94,.1)", color: "var(--success)", padding: 12, borderRadius: 10, display: "inline-flex" }}><CheckCircle2 size={24} /></div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{stats.present}</div>
            <div style={{ fontSize: 12, color: "var(--text-sub)", fontWeight: 500 }}>Present Today</div>
          </div>
        </div>
        <div className="metric-card" style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--bg2)", border: "1px solid var(--border1)", padding: 20, borderRadius: 12 }}>
          <div className="metric-icon" style={{ background: "rgba(239,68,68,.1)", color: "var(--danger)", padding: 12, borderRadius: 10, display: "inline-flex" }}><AlertCircle size={24} /></div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{stats.absent}</div>
            <div style={{ fontSize: 12, color: "var(--text-sub)", fontWeight: 500 }}>Absent Today</div>
          </div>
        </div>
        <div className="metric-card" style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--bg2)", border: "1px solid var(--border1)", padding: 20, borderRadius: 12 }}>
          <div className="metric-icon" style={{ background: "rgba(234,179,8,.1)", color: "var(--warn)", padding: 12, borderRadius: 10, display: "inline-flex" }}><Clock size={24} /></div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{stats.late}</div>
            <div style={{ fontSize: 12, color: "var(--text-sub)", fontWeight: 500 }}>Late Check-in</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
        {/* Left Column: Attendance Log Table */}
        <section className="panel" style={{ background: "var(--bg2)", border: "1px solid var(--border1)", borderRadius: 12, padding: 24 }}>
          <div className="panelHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Attendance logs</h2>
              <p style={{ fontSize: 12, color: "var(--text-sub)", margin: "4px 0 0 0" }}>Daily biometric punches and check-in / check-out history.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text)", padding: "6px 12px", borderRadius: 8, fontSize: 12, outline: "none" }}
              />
              <ArrowRight size={14} color="var(--text-sub)" />
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text)", padding: "6px 12px", borderRadius: 8, fontSize: 12, outline: "none" }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "40px 0", textAlignment: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div className="spinner" />
              <p style={{ fontSize: 13, color: "var(--text-sub)" }}>Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty" style={{ padding: "60px 0", textAlignment: "center", color: "var(--text-sub)" }}>
              No punches registered within selected dates.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlignment: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border1)" }}>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Employee</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Date</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>First In (Clock-In)</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Last Out (Clock-Out)</th>
                    <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--text-sub)", fontWeight: 700 }}>Work Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border2)" }}>
                      <td style={{ padding: "16px", fontSize: 13, color: "var(--text)" }}>
                        <div style={{ fontWeight: 600 }}>{log.full_name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-sub)" }}>{log.email}</div>
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, color: "var(--text)" }}>
                        {new Date(log.punch_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, color: "var(--success)" }}>
                        {log.first_in ? new Date(log.first_in).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, color: "var(--warn)" }}>
                        {log.last_out ? new Date(log.last_out).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                        {log.hoursWorked ? `${log.hoursWorked} hrs` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Right Column: Personal clock-in card */}
        <section className="panel" style={{ background: "var(--bg2)", border: "1px solid var(--border1)", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>My punches</h2>
            <p style={{ fontSize: 12, color: "var(--text-sub)", margin: "4px 0 0 0" }}>Your personal clock-in and check-out logs.</p>
          </div>

          <div style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-sub)", marginBottom: 4 }}>Biometric Card Code</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <ShieldCheck size={20} />
              {session.user.biometricId || "Not Registered"}
            </div>
            {!session.user.biometricId && (
              <p style={{ fontSize: 10, color: "var(--danger)", margin: "6px 0 0 0" }}>Contact administrator to register your Biometric Card.</p>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--text-sub)", margin: 0 }}>Recent Punch History</p>
            {personalLogs.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text-sub)", fontStyle: "italic", padding: "10px 0" }}>No clock logs recorded.</div>
            ) : (
              personalLogs.map((log, idx) => (
                <div key={idx} style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
                      {new Date(log.punch_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-sub)", marginTop: 2 }}>{log.hoursWorked ? `${log.hoursWorked} hrs worked` : "In Progress"}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ fontSize: 11, background: "rgba(34,197,94,.1)", color: "var(--success)", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                      IN: {log.first_in ? new Date(log.first_in).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </span>
                    {log.last_out && (
                      <span style={{ fontSize: 11, background: "rgba(239,68,68,.1)", color: "var(--danger)", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                        OUT: {new Date(log.last_out).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
