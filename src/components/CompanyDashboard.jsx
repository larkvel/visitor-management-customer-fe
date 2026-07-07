import React from "react";
import {
  CalendarClock,
  CheckCircle2,
  DoorOpen,
  Edit3,
  LogIn,
  LogOut,
  UserCog,
  UserPlus,
  Users
} from "lucide-react";
import Metric from "./Metric";
import StatusBadge from "./StatusBadge";
import { can } from "../utils/helpers";

export default function CompanyDashboard(props) {
  const canCreateVisit = can(props.activeUser, "create_visit");
  const canManageUsers = can(props.activeUser, "manage_users");
  const canCheckInOut = can(props.activeUser, "check_in_out");
  const isReception = props.activeUser?.role === "reception";

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
                <div className="fieldGrid">
                  <label>Visitor name<input name="visitorName" value={props.form.visitorName} onChange={props.onVisitChange} required /></label>
                  <label>Email<input name="visitorEmail" type="email" value={props.form.visitorEmail} onChange={props.onVisitChange} /></label>
                  <label>Phone<input name="visitorPhone" value={props.form.visitorPhone} onChange={props.onVisitChange} /></label>
                  <label>Expected<input name="expectedAt" type="datetime-local" value={props.form.expectedAt} onChange={props.onVisitChange} required /></label>
                  <label>Location
                    <select name="locationId" value={props.form.locationId} onChange={props.onVisitChange} required>
                      {props.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                    </select>
                  </label>
                  <label>Host
                    <select name="hostId" value={props.form.hostId} onChange={props.onVisitChange}>
                      <option value="">Unassigned</option>
                      {props.hosts.map((host) => <option key={host.id} value={host.id}>{host.full_name}</option>)}
                    </select>
                  </label>
                  <label className="wide">Purpose<input name="purpose" value={props.form.purpose} onChange={props.onVisitChange} required /></label>
                </div>
                <button className="primaryButton" type="submit">
                  <UserPlus size={18} />
                  {props.editingVisitId ? "Save entry" : "Add visit"}
                </button>
              </form>
            )}

            {canManageUsers && (
              <form className="panel" onSubmit={props.onUserSubmit}>
                <div className="panelHeader">
                  <UserCog size={20} />
                  <h2>Create Company User</h2>
                </div>
                <div className="fieldGrid">
                  <label>Full name<input name="fullName" value={props.userForm.fullName} onChange={props.onUserFormChange} required /></label>
                  <label>Email<input name="email" type="email" value={props.userForm.email} onChange={props.onUserFormChange} required /></label>
                  <label>Username (for login)<input name="username" value={props.userForm.username} onChange={props.onUserFormChange} required minLength={3} placeholder="min 3 characters" /></label>
                  <label>Password<input name="password" type="password" value={props.userForm.password} onChange={props.onUserFormChange} required minLength={8} placeholder="min 8 characters" /></label>
                  <label className="wide">Role
                    <select name="role" value={props.userForm.role} onChange={props.onUserFormChange}>
                      <option value="company_admin">Company admin</option>
                      <option value="reception">Reception</option>
                      <option value="executive">Executive</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </label>
                </div>
                <button className="primaryButton" type="submit"><UserCog size={18} />Add user</button>
              </form>
            )}

            {canManageUsers && props.users.length > 0 && (
              <section className="panel">
                <div className="panelHeader">
                  <UserCog size={20} />
                  <h2>Team Members ({props.users.length})</h2>
                </div>
                <div className="visitList">
                  {props.users.map(user => (
                    <article className="accountRow" key={user.id}>
                      <div>
                        <strong>{user.full_name}</strong>
                        <span>{user.email}</span>
                        <small>@{user.username || "\u2014"} &middot; {user.role}</small>
                      </div>
                      <StatusBadge status={user.is_active ? "active" : "suspended"} />
                    </article>
                  ))}
                </div>
              </section>
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
