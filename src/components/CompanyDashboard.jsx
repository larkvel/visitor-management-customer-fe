import React from "react";
import {
  Building2,
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

  return (
    <>
      <section className="selectorBand">
        <label className="companyPicker">
          <Building2 size={18} />
          <select value={props.selectedCompanyId} onChange={(event) => props.onCompanyChange(event.target.value)}>
            {props.companies.map((company) => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </label>
        <label className="companyPicker">
          <UserCog size={18} />
          <select value={props.activeUserId} onChange={(event) => props.onUserChange(event.target.value)}>
            {props.users.map((user) => (
              <option key={user.id} value={user.id}>{user.full_name} · {user.role}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="metrics" aria-label="Visitor metrics">
        <Metric icon={<CalendarClock />} label="Expected" value={props.dashboard.expected} />
        <Metric icon={<DoorOpen />} label="Onsite" value={props.dashboard.onsite} />
        <Metric icon={<CheckCircle2 />} label="Completed" value={props.dashboard.completed} />
        <Metric icon={<Users />} label="Today" value={props.dashboard.today} />
      </section>

      <section className="workspace">
        <div className="stack">
          <form className="panel" onSubmit={props.onVisitSubmit}>
            <div className="panelHeader">
              <UserPlus size={20} />
              <h2>{props.editingVisitId ? "Edit Visitor Entry" : "Register Visitor"}</h2>
            </div>
            <div className="fieldGrid">
              <label>Visitor name<input name="visitorName" value={props.form.visitorName} onChange={props.onVisitChange} required disabled={!canCreateVisit && !props.editingVisitId} /></label>
              <label>Email<input name="visitorEmail" type="email" value={props.form.visitorEmail} onChange={props.onVisitChange} disabled={!canCreateVisit && !props.editingVisitId} /></label>
              <label>Phone<input name="visitorPhone" value={props.form.visitorPhone} onChange={props.onVisitChange} disabled={!canCreateVisit && !props.editingVisitId} /></label>
              <label>Expected<input name="expectedAt" type="datetime-local" value={props.form.expectedAt} onChange={props.onVisitChange} required disabled={!canCreateVisit && !props.editingVisitId} /></label>
              <label>Location
                <select name="locationId" value={props.form.locationId} onChange={props.onVisitChange} required disabled={!canCreateVisit && !props.editingVisitId}>
                  {props.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                </select>
              </label>
              <label>Host
                <select name="hostId" value={props.form.hostId} onChange={props.onVisitChange} disabled={!canCreateVisit && !props.editingVisitId}>
                  <option value="">Unassigned</option>
                  {props.hosts.map((host) => <option key={host.id} value={host.id}>{host.full_name}</option>)}
                </select>
              </label>
              <label className="wide">Purpose<input name="purpose" value={props.form.purpose} onChange={props.onVisitChange} required disabled={!canCreateVisit && !props.editingVisitId} /></label>
            </div>
            <button className="primaryButton" type="submit" disabled={!canCreateVisit && !props.editingVisitId}>
              <UserPlus size={18} />
              {props.editingVisitId ? "Save entry" : "Add visit"}
            </button>
          </form>

          {canManageUsers && (
            <form className="panel" onSubmit={props.onUserSubmit}>
              <div className="panelHeader">
                <UserCog size={20} />
                <h2>Create Company User</h2>
              </div>
              <div className="fieldGrid">
                <label>Full name<input name="fullName" value={props.userForm.fullName} onChange={props.onUserFormChange} required /></label>
                <label>Email<input name="email" type="email" value={props.userForm.email} onChange={props.onUserFormChange} required /></label>
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
