import React, { useState } from "react";
import {
  CalendarClock, CheckCircle2, DoorOpen, Edit3,
  LogIn, LogOut, MapPin, UserCog, UserPlus, Users
} from "lucide-react";
import Metric from "./Metric";
import StatusBadge from "./StatusBadge";
import { can } from "../utils/helpers";

const ROLE_COLORS = {
  company_admin: { bg: "#ede9fe", color: "#7c3aed" },
  reception:     { bg: "#dbeafe", color: "#1d4ed8" },
  executive:     { bg: "#dcfce7", color: "#15803d" },
  viewer:        { bg: "#f3f4f6", color: "#374151" }
};

function RoleBadge({ role }) {
  const s = ROLE_COLORS[role] || ROLE_COLORS.viewer;
  return (
    <span style={{ ...s, padding: "2px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: "600", textTransform: "capitalize" }}>
      {role.replace("_", " ")}
    </span>
  );
}

export default function CompanyDashboard(props) {
  const canCreateVisit = can(props.activeUser, "create_visit");
  const canManageUsers = can(props.activeUser, "manage_users");
  const canCheckInOut = can(props.activeUser, "check_in_out");
  const isReception = props.activeUser?.role === "reception";
  const [adminTab, setAdminTab] = useState("users");

  return (
    <>
      <section className="metrics" aria-label="Visitor metrics">
        <Metric icon={<CalendarClock />} label="Expected" value={props.dashboard.expected} />
        <Metric icon={<DoorOpen />} label="Onsite" value={props.dashboard.onsite} />
        <Metric icon={<CheckCircle2 />} label="Completed" value={props.dashboard.completed} />
        <Metric icon={<Users />} label="Today" value={props.dashboard.today} />
      </section>

      <section className="workspace">
        {!isReception && (
          <div className="stack">
            {canCreateVisit && (
              <form className="panel" onSubmit={props.onVisitSubmit}>
                <div className="panelHeader">
                  <UserPlus size={20} />
                  <h2>{props.editingVisitId ? "Edit Visitor Entry" : "Register Visitor"}</h2>
                </div>
                {props.locations.length === 0 && (
                  <div style={{ background: "#fef3c7", color: "#92400e", padding: "10px 14px", borderRadius: "6px", marginBottom: "12px", fontSize: "13px" }}>
                    No locations set up yet. Add a location in the Setup tab below before registering visitors.
                  </div>
                )}
                <div className="fieldGrid">
                  <label>Visitor name<input name="visitorName" value={props.form.visitorName} onChange={props.onVisitChange} required /></label>
                  <label>Email<input name="visitorEmail" type="email" value={props.form.visitorEmail} onChange={props.onVisitChange} /></label>
                  <label>Phone<input name="visitorPhone" value={props.form.visitorPhone} onChange={props.onVisitChange} /></label>
                  <label>Expected<input name="expectedAt" type="datetime-local" value={props.form.expectedAt} onChange={props.onVisitChange} required /></label>
                  <label>Location
                    <select name="locationId" value={props.form.locationId} onChange={props.onVisitChange} required disabled={props.locations.length === 0}>
                      {props.locations.length === 0
                        ? <option value="">No locations — add one below</option>
                        : props.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)
                      }
                    </select>
                  </label>
                  <label>Host
                    <select name="hostId" value={props.form.hostId} onChange={props.onVisitChange}>
                      <option value="">Unassigned</option>
                      {props.hosts.map(h => <option key={h.id} value={h.id}>{h.full_name}</option>)}
                    </select>
                  </label>
                  <label className="wide">Purpose<input name="purpose" value={props.form.purpose} onChange={props.onVisitChange} required /></label>
                </div>
                <button className="primaryButton" type="submit" disabled={props.locations.length === 0}>
                  <UserPlus size={18} />
                  {props.editingVisitId ? "Save entry" : "Add visit"}
                </button>
              </form>
            )}

            {canManageUsers && (
              <div className="panel">
                <div style={{ display: "flex", borderBottom: "2px solid #f0f0f0", marginBottom: "20px" }}>
                  {[
                    { key: "users", label: `Users (${props.users.length})`, icon: <UserCog size={15} /> },
                    { key: "locations", label: `Locations (${props.locations.length})`, icon: <MapPin size={15} /> },
                    { key: "hosts", label: `Hosts (${props.hosts.length})`, icon: <Users size={15} /> }
                  ].map(tab => (
                    <button key={tab.key} type="button" onClick={() => setAdminTab(tab.key)}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontWeight: adminTab === tab.key ? "700" : "500", color: adminTab === tab.key ? "#6366f1" : "#666", borderBottom: adminTab === tab.key ? "2px solid #6366f1" : "2px solid transparent", marginBottom: "-2px", fontSize: "13px" }}>
                      {tab.icon}{tab.label}
                    </button>
                  ))}
                </div>

                {adminTab === "users" && (
                  <>
                    <form onSubmit={props.onUserSubmit} style={{ marginBottom: "20px" }}>
                      <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600" }}>Add New User</h3>
                      <div className="fieldGrid">
                        <label>Full name<input name="fullName" value={props.userForm.fullName} onChange={props.onUserFormChange} required /></label>
                        <label>Email<input name="email" type="email" value={props.userForm.email} onChange={props.onUserFormChange} required /></label>
                        <label>Username<input name="username" value={props.userForm.username} onChange={props.onUserFormChange} required minLength={3} placeholder="min 3 chars" /></label>
                        <label>Password<input name="password" type="password" value={props.userForm.password} onChange={props.onUserFormChange} required minLength={8} placeholder="min 8 chars" /></label>
                        <label className="wide">Role
                          <select name="role" value={props.userForm.role} onChange={props.onUserFormChange}>
                            <option value="company_admin">Company Admin</option>
                            <option value="reception">Reception</option>
                            <option value="executive">Executive</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </label>
                      </div>
                      <button className="primaryButton" type="submit" style={{ marginTop: "8px" }}><UserCog size={16} />Add User</button>
                    </form>
                    {props.users.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {props.users.map(user => (
                          <div key={user.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                            <div>
                              <div style={{ fontWeight: "600", fontSize: "14px" }}>{user.full_name}</div>
                              <div style={{ fontSize: "12px", color: "#6b7280" }}>{user.email}{user.username ? ` · @${user.username}` : ""}</div>
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <RoleBadge role={user.role} />
                              <StatusBadge status={user.is_active ? "active" : "suspended"} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {adminTab === "locations" && (
                  <>
                    <form onSubmit={props.onLocationSubmit} style={{ marginBottom: "20px" }}>
                      <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600" }}>Add New Location</h3>
                      <div className="fieldGrid">
                        <label>Location name *<input name="name" value={props.locationForm.name} onChange={props.onLocationFormChange} required placeholder="e.g. Head Office" /></label>
                        <label>Address<input name="address" value={props.locationForm.address} onChange={props.onLocationFormChange} placeholder="Street, City" /></label>
                      </div>
                      <button className="primaryButton" type="submit" style={{ marginTop: "8px" }}><MapPin size={16} />Add Location</button>
                    </form>
                    {props.locations.length > 0
                      ? <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {props.locations.map(loc => (
                            <div key={loc.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                              <MapPin size={16} color="#6366f1" />
                              <div>
                                <div style={{ fontWeight: "600", fontSize: "14px" }}>{loc.name}</div>
                                {loc.address && <div style={{ fontSize: "12px", color: "#6b7280" }}>{loc.address}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      : <div style={{ textAlign: "center", color: "#9ca3af", padding: "20px", fontSize: "14px" }}>No locations yet. Add one above.</div>
                    }
                  </>
                )}

                {adminTab === "hosts" && (
                  <>
                    <form onSubmit={props.onHostSubmit} style={{ marginBottom: "20px" }}>
                      <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600" }}>Add New Host</h3>
                      <div className="fieldGrid">
                        <label>Full name *<input name="fullName" value={props.hostForm.fullName} onChange={props.onHostFormChange} required /></label>
                        <label>Email *<input name="email" type="email" value={props.hostForm.email} onChange={props.onHostFormChange} required /></label>
                        <label>Department<input name="department" value={props.hostForm.department} onChange={props.onHostFormChange} placeholder="e.g. Engineering" /></label>
                      </div>
                      <button className="primaryButton" type="submit" style={{ marginTop: "8px" }}><Users size={16} />Add Host</button>
                    </form>
                    {props.hosts.length > 0
                      ? <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {props.hosts.map(host => (
                            <div key={host.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#4f46e5", fontSize: "14px", flexShrink: 0 }}>{host.full_name.charAt(0).toUpperCase()}</div>
                              <div>
                                <div style={{ fontWeight: "600", fontSize: "14px" }}>{host.full_name}</div>
                                <div style={{ fontSize: "12px", color: "#6b7280" }}>{host.email}{host.department ? ` · ${host.department}` : ""}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      : <div style={{ textAlign: "center", color: "#9ca3af", padding: "20px", fontSize: "14px" }}>No hosts yet. Add employees who receive visitors.</div>
                    }
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <section className="panel visitPanel">
          <div className="panelHeader">
            <DoorOpen size={20} />
            <h2>Visitor Log</h2>
          </div>
          <div className="visitList">
            {props.visits.map((visit) => {
              const canEdit = !isReception && (
                can(props.activeUser, "edit_any_visit")
                || (can(props.activeUser, "edit_own_visit") && visit.created_by_user_id === props.activeUserId)
              );
              return (
                <article className="visitRow" key={visit.id}>
                  <div>
                    <strong>{visit.visitor_name}</strong>
                    <span>{visit.purpose}</span>
                    <small>{visit.location_name} &middot; {new Date(visit.expected_at).toLocaleString()} &middot; by {visit.created_by_name || "Unknown"}</small>
                  </div>
                  <StatusBadge status={visit.status} />
                  <div className="actions">
                    {canEdit && (
                      <button type="button" title="Edit entry" onClick={() => props.onVisitEdit(visit)}>
                        <Edit3 size={17} />
                      </button>
                    )}
                    {canCheckInOut && visit.status === "expected" && (
                      <button type="button" title="Check in" onClick={() => props.onVisitStatus(visit.id, "check-in")}>
                        <LogIn size={18} />
                      </button>
                    )}
                    {canCheckInOut && visit.status === "checked_in" && (
                      <button type="button" title="Check out" onClick={() => props.onVisitStatus(visit.id, "check-out")}>
                        <LogOut size={18} />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
            {props.visits.length === 0 && <div className="empty">No visits registered yet.</div>}
          </div>
        </section>
      </section>
    </>
  );
}
