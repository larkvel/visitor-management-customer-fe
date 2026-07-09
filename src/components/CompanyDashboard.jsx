import React, { useState } from "react";
import {
  CalendarClock, CheckCircle2, DoorOpen, Edit3,
  LogIn, LogOut, MapPin, UserCog, UserPlus, Users
} from "lucide-react";
import { can } from "../utils/helpers";

/* ── Sub-components ──────────────────────────────────────── */
function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{status.replace("_", " ")}</span>;
}

function RoleBadge({ role }) {
  return <span className={`role-badge ${role}`}>{role.replace("_", " ")}</span>;
}

function Metric({ icon, label, value, colorClass }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${colorClass}`}>{icon}</div>
      <div>
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
      </div>
    </div>
  );
}

/* ── Main dashboard ──────────────────────────────────────── */
export default function CompanyDashboard(props) {
  const canCreateVisit = can(props.activeUser, "create_visit");
  const canManageUsers = can(props.activeUser, "manage_users");
  const canCheckInOut  = can(props.activeUser, "check_in_out");
  const isReception    = props.activeUser?.role === "reception";
  const [adminTab, setAdminTab] = useState("users");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter logs locally based on selected status
  let filteredVisits = props.visits;
  if (statusFilter !== "all") {
    if (statusFilter === "onsite") {
      filteredVisits = props.visits.filter(v => v.status === "checked_in");
    } else if (statusFilter === "completed") {
      filteredVisits = props.visits.filter(v => v.status === "checked_out");
    } else if (statusFilter === "expected") {
      filteredVisits = props.visits.filter(v => v.status === "expected");
    } else if (statusFilter === "cancelled") {
      filteredVisits = props.visits.filter(v => v.status === "cancelled");
    }
  }

  // ── SEPARATE PAGE: SETUP MODE ──
  if (props.activePage === "setup") {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {canManageUsers && (
          <div className="panel">
            <div className="panelHeader">
              <UserCog size={18} />
              <h2>Setup & Configurations</h2>
            </div>

            <div className="tab-bar">
              {[
                { key: "users",     label: `Users (${props.users.length})`,         icon: <UserCog size={14} /> },
                { key: "locations", label: `Locations (${props.locations.length})`,  icon: <MapPin size={14} /> },
                { key: "hosts",     label: `Departments (${props.hosts.length})`,    icon: <Users size={14} /> },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  className={`tab-btn ${adminTab === tab.key ? "active" : ""}`}
                  onClick={() => setAdminTab(tab.key)}
                >
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>

            {/* Users tab */}
            {adminTab === "users" && (
              <div className="setup-split">
                <div className="setup-split-left">
                  <p className="section-label">Add New User</p>
                  <form onSubmit={props.onUserSubmit} style={{ marginBottom: 20 }}>
                    <div className="fieldGrid">
                      <label>Full Name <input name="fullName" value={props.userForm.fullName} onChange={props.onUserFormChange} required /></label>
                      <label>Email <input name="email" type="email" value={props.userForm.email} onChange={props.onUserFormChange} required /></label>
                      <label>Username <input name="username" value={props.userForm.username} onChange={props.onUserFormChange} required minLength={3} placeholder="min 3 chars" /></label>
                      <label>Password <input name="password" type="password" value={props.userForm.password} onChange={props.onUserFormChange} required minLength={8} placeholder="min 8 chars" /></label>
                      <label>Role
                        <select name="role" value={props.userForm.role} onChange={props.onUserFormChange}>
                          <option value="company_admin">Company Admin</option>
                          <option value="reception">Reception</option>
                          <option value="executive">Executive</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </label>
                    </div>
                    <button className="primaryButton" type="submit"><UserCog size={15} /> Add User</button>
                  </form>
                </div>

                <div className="setup-split-right">
                  <p className="section-label">Team Members</p>
                  {props.users.length > 0 ? (
                    <div className="setup-list">
                      {props.users.map(u => (
                        <div className="list-item" key={u.id}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <div className="avatar-circle">{u.full_name?.charAt(0).toUpperCase()}</div>
                            <div className="list-item-main">
                              <div className="list-item-name">{u.full_name}</div>
                              <div className="list-item-sub">{u.email}{u.username ? ` · @${u.username}` : ""}</div>
                            </div>
                          </div>
                          <div className="list-item-badges">
                            <RoleBadge role={u.role} />
                            <StatusBadge status={u.is_active ? "active" : "suspended"} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty">No team members registered yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* Locations tab */}
            {adminTab === "locations" && (
              <div className="setup-split">
                <div className="setup-split-left">
                  <p className="section-label">Add New Location</p>
                  <form onSubmit={props.onLocationSubmit} style={{ marginBottom: 20 }}>
                    <div className="fieldGrid">
                      <label>Location Name * <input name="name" value={props.locationForm?.name ?? ""} onChange={props.onLocationFormChange} required placeholder="Head Office" /></label>
                      <label>Address <input name="address" value={props.locationForm?.address ?? ""} onChange={props.onLocationFormChange} placeholder="Street, City" /></label>
                    </div>
                    <button className="primaryButton" type="submit"><MapPin size={15} /> Add Location</button>
                  </form>
                </div>

                <div className="setup-split-right">
                  <p className="section-label">Active Locations</p>
                  {props.locations.length > 0 ? (
                    <div className="setup-list">
                      {props.locations.map(loc => (
                        <div className="list-item" key={loc.id}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="avatar-circle" style={{ background: "rgba(99,102,241,.1)", borderColor: "var(--primary)" }}>
                              <MapPin size={16} color="var(--primary)" />
                            </div>
                            <div className="list-item-main">
                              <div className="list-item-name">{loc.name}</div>
                              {loc.address && <div className="list-item-sub">{loc.address}</div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty">No locations yet. Add one above.</div>
                  )}
                </div>
              </div>
            )}

            {/* Departments tab */}
            {adminTab === "hosts" && (
              <div className="setup-split">
                <div className="setup-split-left">
                  <p className="section-label">Add New Department</p>
                  <form onSubmit={props.onHostSubmit} style={{ marginBottom: 20 }}>
                    <div className="fieldGrid">
                      <label>Department Name * <input name="department" value={props.hostForm?.department ?? ""} onChange={props.onHostFormChange} required placeholder="e.g. Engineering" /></label>
                      <label>Department Head Name * <input name="fullName" value={props.hostForm?.fullName ?? ""} onChange={props.onHostFormChange} required placeholder="John Doe" /></label>
                      <label>Head Email * <input name="email" type="email" value={props.hostForm?.email ?? ""} onChange={props.onHostFormChange} required placeholder="head@company.com" /></label>
                    </div>
                    <button className="primaryButton" type="submit"><Users size={15} /> Add Department</button>
                  </form>
                </div>

                <div className="setup-split-right">
                  <p className="section-label">Departments</p>
                  {props.hosts.length > 0 ? (
                    <div className="setup-list">
                      {props.hosts.map(h => (
                        <div className="list-item" key={h.id}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <div className="avatar-circle">
                              {(h.department || h.full_name || "D").charAt(0).toUpperCase()}
                            </div>
                            <div className="list-item-main">
                              <div className="list-item-name">{h.department || "General"}</div>
                              <div className="list-item-sub">Head: {h.full_name} · {h.email}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty">No departments yet. Add departments who receive visitors.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── DEFAULT PAGE: VISITOR LOG VIEW ──
  return (
    <>
      {/* ── Metric tiles ── */}
      <div className="metrics" aria-label="Visitor metrics">
        <Metric icon={<CalendarClock size={22} />} label="Expected"  value={props.dashboard.expected}  colorClass="blue" />
        <Metric icon={<DoorOpen size={22} />}      label="Onsite"    value={props.dashboard.onsite}    colorClass="green" />
        <Metric icon={<CheckCircle2 size={22} />}  label="Completed" value={props.dashboard.completed} colorClass="purple" />
        <Metric icon={<Users size={22} />}         label="Today"     value={props.dashboard.today}     colorClass="amber" />
      </div>

      {/* ── Workspace ── */}
      <div className="workspace" style={isReception || !canCreateVisit ? { gridTemplateColumns: "1fr" } : {}}>

        {/* ── Left column: register form ── */}
        {!isReception && canCreateVisit && (
          <form className="panel" onSubmit={props.onVisitSubmit}>
            <div className="panelHeader">
              <UserPlus size={18} />
              <h2>{props.editingVisitId ? "Edit Visitor Entry" : "Register Visitor"}</h2>
            </div>

            {props.locations.length === 0 && (
              <div className="warn-banner">
                No locations set up yet. Add a location in the Setup tab above before registering visitors.
              </div>
            )}

            <div className="fieldGrid">
              <label>Visitor Name <input name="visitorName" value={props.form.visitorName} onChange={props.onVisitChange} required placeholder="Jane Doe" /></label>
              <label>Email <input name="visitorEmail" type="email" value={props.form.visitorEmail} onChange={props.onVisitChange} placeholder="jane@example.com" /></label>
              <label>Phone <input name="visitorPhone" value={props.form.visitorPhone} onChange={props.onVisitChange} placeholder="+91 98765 43210" /></label>
              <label>Expected At <input name="expectedAt" type="datetime-local" value={props.form.expectedAt} onChange={props.onVisitChange} required /></label>
              <label>Location
                <select name="locationId" value={props.form.locationId} onChange={props.onVisitChange} required disabled={props.locations.length === 0}>
                  {props.locations.length === 0
                    ? <option value="">No locations — add one below</option>
                    : props.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)
                  }
                </select>
              </label>
              <label>Department / Host
                <select name="hostId" value={props.form.hostId} onChange={props.onVisitChange}>
                  <option value="">Select Department / Host…</option>
                  {props.hosts.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.department ? `${h.department} — ${h.full_name}` : h.full_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="wide">Purpose <input name="purpose" value={props.form.purpose} onChange={props.onVisitChange} required placeholder="Meeting / Interview / Delivery…" /></label>
            </div>

            <button className="primaryButton" type="submit" disabled={props.locations.length === 0}>
              <UserPlus size={16} />
              {props.editingVisitId ? "Save Entry" : "Add Visit"}
            </button>
          </form>
        )}

        {/* ── Right column: Visitor log ── */}
        <section className="panel visitPanel">
          <div className="panelHeader">
            <DoorOpen size={18} />
            <h2>Visitor Log</h2>
          </div>

          <div className="log-filters">
            <span className="log-filters-title">Filter Logs</span>
            
            <div className="log-filters-group">
              <label>Status:</label>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text)", padding: "5px 9px", borderRadius: "6px", fontSize: "13px", outline: "none" }}
              >
                <option value="all">All Statuses</option>
                <option value="onsite">Onsite (Checked In)</option>
                <option value="completed">Completed (Checked Out)</option>
                <option value="expected">Registered (Not Visited Yet)</option>
              </select>
            </div>

            <div className="log-filters-group">
              <label>From:</label>
              <input 
                type="date" 
                value={props.startDate} 
                onChange={e => props.onStartDateChange(e.target.value)} 
              />
            </div>
            <div className="log-filters-group">
              <label>To:</label>
              <input 
                type="date" 
                value={props.endDate} 
                onChange={e => props.onEndDateChange(e.target.value)} 
              />
            </div>
            {(props.startDate || props.endDate || statusFilter !== "all") && (
              <button 
                type="button" 
                className="clear-filter-btn"
                onClick={() => { props.onStartDateChange(""); props.onEndDateChange(""); setStatusFilter("all"); }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="visitList">
            {filteredVisits.length === 0
              ? <div className="empty">No visits registered matching filters.</div>
              : filteredVisits.map(visit => {
                const canEdit = !isReception && (
                  can(props.activeUser, "edit_any_visit") ||
                  (can(props.activeUser, "edit_own_visit") && visit.created_by_user_id === props.activeUserId)
                );
                return (
                  <article className="visitRow" key={visit.id}>
                    <div>
                      <strong>{visit.visitor_name}</strong>
                      <span>{visit.purpose}</span>
                      <small>
                        {visit.location_name}
                        {visit.host_name ? ` · ${visit.host_name}` : ""}
                        {" · "}{new Date(visit.expected_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        {visit.created_by_name ? ` · by ${visit.created_by_name}` : ""}
                      </small>
                    </div>
                    <StatusBadge status={visit.status} />
                    <div className="actions">
                      {canEdit && (
                        <button type="button" title="Edit entry" onClick={() => props.onVisitEdit(visit)}>
                          <Edit3 size={15} />
                        </button>
                      )}
                      {canCheckInOut && visit.status === "expected" && (
                        <button type="button" title="Check in" onClick={() => props.onVisitStatus(visit.id, "check-in")}>
                          <LogIn size={16} />
                        </button>
                      )}
                      {canCheckInOut && visit.status === "checked_in" && (
                        <button type="button" title="Check out" onClick={() => props.onVisitStatus(visit.id, "check-out")}>
                          <LogOut size={16} />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            }
          </div>
        </section>
      </div>
    </>
  );
}
