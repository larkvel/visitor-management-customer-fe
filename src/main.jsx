import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { api } from "./api";
import CompanyDashboard from "./components/CompanyDashboard";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import ScanStatusPage from "./components/ScanStatusPage";
import { ClipboardList, Settings } from "lucide-react";
import { toDateTimeLocal, toIso } from "./utils/helpers";
import "./styles.css";

function getSubdomain() {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  if (parts.length >= 3 && parts[0] !== "www") return parts[0];
  const params = new URLSearchParams(window.location.search);
  return params.get("company") || null;
}

const emptyVisit = { locationId: "", hostId: "", hostUserId: "", hostName: "", hostEmail: "", visitorName: "", visitorEmail: "", visitorPhone: "", purpose: "", expectedAt: "" };
const emptyUser = { fullName: "", email: "", username: "", password: "", role: "executive" };
const emptyLocation = { name: "", address: "" };
const emptyHost = { fullName: "", email: "", department: "" };

function DashboardApp({ session, onLogout }) {
  const companyId = session.user.companyId;
  const [locations, setLocations] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [visits, setVisits] = useState([]);
  const [users, setUsers] = useState([]);
  const [dashboard, setDashboard] = useState({ expected: 0, onsite: 0, completed: 0, today: 0 });
  const [visitForm, setVisitForm] = useState({ ...emptyVisit, expectedAt: toDateTimeLocal() });
  const [editingVisitId, setEditingVisitId] = useState("");
  const [userForm, setUserForm] = useState(emptyUser);
  const [locationForm, setLocationForm] = useState(emptyLocation);
  const [hostForm, setHostForm] = useState(emptyHost);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activePage, setActivePage] = useState("log");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [locs, hs, vs, us, dash] = await Promise.all([
      api.listLocations(companyId),
      api.listHosts(companyId),
      api.listVisits(companyId, startDate, endDate),
      api.listUsers(companyId),
      api.getDashboard(companyId)
    ]);
    setLocations(locs);
    setHosts(hs);
    setVisits(vs);
    setUsers(us);
    setDashboard(dash);
    setVisitForm(prev => ({
      ...prev,
      locationId: prev.locationId || locs[0]?.id || "",
      hostId: prev.hostId || hs[0]?.id || ""
    }));
  }

  useEffect(() => {
    loadData()
      .catch(e => {
        if (e.message?.includes("expired") || e.message?.includes("Unauthorized") || e.message?.includes("Authentication")) {
          onLogout();
        } else {
          setError(e.message);
        }
      })
      .finally(() => setLoading(false));
  }, [companyId]);

  // Refetch visits when date filters change (skip initial loading stage)
  useEffect(() => {
    if (!loading) {
      api.listVisits(companyId, startDate, endDate)
        .then(setVisits)
        .catch(e => setError(e.message));
    }
  }, [startDate, endDate]);

  function updateUserForm(e) { setUserForm(p => ({ ...p, [e.target.name]: e.target.value })); }
  function updateVisitForm(e) { setVisitForm(p => ({ ...p, [e.target.name]: e.target.value })); }
  function updateLocationForm(e) { setLocationForm(p => ({ ...p, [e.target.name]: e.target.value })); }
  function updateHostForm(e) { setHostForm(p => ({ ...p, [e.target.name]: e.target.value })); }

  async function submitUser(e) {
    e.preventDefault(); setError("");
    try {
      await api.createUser({ ...userForm, companyId });
      setUserForm(emptyUser);
      await loadData();
    } catch (err) { setError(err.message); }
  }

  async function handleUserStatusToggle(userId, currentStatus) {
    setError("");
    try {
      await api.toggleUserStatus(userId, !currentStatus);
      await loadData();
    } catch (err) { setError(err.message); }
  }

  async function handleUserDelete(userId) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setError("");
    try {
      await api.deleteUser(userId);
      await loadData();
    } catch (err) { setError(err.message); }
  }

  async function handleUserRoleChange(userId, newRole) {
    setError("");
    try {
      await api.changeUserRole(userId, newRole);
      await loadData();
    } catch (err) { setError(err.message); }
  }

  async function submitVisit(e) {
    e.preventDefault(); setError("");
    try {
      const payload = { ...visitForm, actorUserId: session.user.id, expectedAt: toIso(visitForm.expectedAt) };
      if (editingVisitId) {
        await api.updateVisit(editingVisitId, payload);
      } else {
        await api.createVisit({ ...payload, companyId });
      }
      setEditingVisitId("");
      setVisitForm({ ...emptyVisit, locationId: locations[0]?.id || "", hostId: hosts[0]?.id || "", expectedAt: toDateTimeLocal() });
      await loadData();
    } catch (err) { setError(err.message); }
  }

  async function submitLocation(e) {
    e.preventDefault(); setError("");
    try {
      await api.createLocation(companyId, locationForm);
      setLocationForm(emptyLocation);
      await loadData();
    } catch (err) { setError(err.message); }
  }

  async function submitHost(e) {
    e.preventDefault(); setError("");
    try {
      await api.createHost(companyId, hostForm);
      setHostForm(emptyHost);
      await loadData();
    } catch (err) { setError(err.message); }
  }

  function startVisitEdit(visit) {
    setEditingVisitId(visit.id);
    setVisitForm({
      locationId: visit.location_id,
      hostId: visit.host_id || "",
      hostUserId: visit.host_user_id || "",
      hostName: visit.host_name || "",
      hostEmail: visit.host_email || "",
      visitorName: visit.visitor_name,
      visitorEmail: visit.visitor_email || "",
      visitorPhone: visit.visitor_phone || "",
      purpose: visit.purpose,
      expectedAt: toDateTimeLocal(visit.expected_at)
    });
  }

  async function updateVisitStatus(visitId, action) {
    setError("");
    try {
      if (action === "check-in") await api.checkIn(visitId, session.user.id);
      else await api.checkOut(visitId, session.user.id);
      await loadData();
    } catch (err) { setError(err.message); }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="loading">
          <div className="spinner" />
          <p>Loading dashboard…</p>
        </div>
      </main>
    );
  }

  const activeUser = users.find(u => u.id === session.user.id) || { ...session.user, permissions: [] };
  const initials = session.user.fullName?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Visitor Management</p>
          <h1>{session.user.companyName}</h1>
        </div>
        <div className="toolbar">
          <div className="user-chip">
            <div className="user-chip-avatar">{initials}</div>
            <div>
              <div className="user-chip-name">{session.user.fullName}</div>
              <div className="user-chip-role">{session.user.role?.replace("_", " ")}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <div className="sub-navbar">
        <button 
          className={`sub-nav-btn ${activePage === "log" ? "active" : ""}`}
          onClick={() => setActivePage("log")}
        >
          <ClipboardList size={16} /> Visitor Log
        </button>
        {activeUser && (activeUser.role === "company_admin" || activeUser.role === "platform_admin") && (
          <button 
            className={`sub-nav-btn ${activePage === "setup" ? "active" : ""}`}
            onClick={() => setActivePage("setup")}
          >
            <Settings size={16} /> Setup
          </button>
        )}
      </div>

      <div className="dash-body">
        {error && <div className="alert">{error}</div>}
        <CompanyDashboard
          activeUser={activeUser}
          activeUserId={session.user.id}
          dashboard={dashboard}
          editingVisitId={editingVisitId}
          form={visitForm}
          hosts={hosts}
          locations={locations}
          selectedCompanyId={companyId}
          companies={[{ id: companyId, name: session.user.companyName }]}
          userForm={userForm}
          users={users}
          visits={visits}
          locationForm={locationForm}
          onLocationFormChange={updateLocationForm}
          onLocationSubmit={submitLocation}
          hostForm={hostForm}
          onHostFormChange={updateHostForm}
          onHostSubmit={submitHost}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          activePage={activePage}
          onCompanyChange={() => {}}
          onUserChange={() => {}}
          onUserFormChange={updateUserForm}
          onUserSubmit={submitUser}
          onUserStatusToggle={handleUserStatusToggle}
          onUserRoleChange={handleUserRoleChange}
          onUserDelete={handleUserDelete}
          onVisitChange={updateVisitForm}
          onVisitEdit={startVisitEdit}
          onVisitStatus={updateVisitStatus}
          onVisitSubmit={submitVisit}
        />
      </div>
    </main>
  );
}

function CompanyApp({ subdomain }) {
  const sessionKey = `vm_session_${subdomain}`;
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(sessionKey) || "null"); }
    catch { return null; }
  });

  function handleLogin(data) { localStorage.setItem(sessionKey, JSON.stringify(data)); setSession(data); }
  function handleLogout() { localStorage.removeItem(sessionKey); setSession(null); }

  if (!session) return <Login subdomain={subdomain} onLogin={handleLogin} />;
  return <DashboardApp session={session} onLogout={handleLogout} />;
}

function App() {
  const subdomain = getSubdomain();
  if (window.location.pathname === "/scan-status") {
    return <ScanStatusPage />;
  }
  if (!subdomain) return <LandingPage />;
  return <CompanyApp subdomain={subdomain} />;
}

createRoot(document.getElementById("root")).render(<App />);
