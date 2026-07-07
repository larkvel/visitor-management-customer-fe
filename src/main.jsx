import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { api } from "./api";
import CompanyDashboard from "./components/CompanyDashboard";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import { toDateTimeLocal, toIso } from "./utils/helpers";
import "./styles.css";

function getSubdomain() {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  if (parts.length >= 3 && parts[0] !== "www") return parts[0];
  const params = new URLSearchParams(window.location.search);
  return params.get("company") || null;
}

const emptyVisit = { locationId: "", hostId: "", visitorName: "", visitorEmail: "", visitorPhone: "", purpose: "", expectedAt: "" };
const emptyUser = { fullName: "", email: "", username: "", password: "", role: "executive" };

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [locs, hs, vs, us, dash] = await Promise.all([
      api.listLocations(companyId),
      api.listHosts(companyId),
      api.listVisits(companyId),
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

  function updateUserForm(e) { setUserForm(p => ({ ...p, [e.target.name]: e.target.value })); }
  function updateVisitForm(e) { setVisitForm(p => ({ ...p, [e.target.name]: e.target.value })); }

  async function submitUser(e) {
    e.preventDefault(); setError("");
    try {
      await api.createUser({ ...userForm, companyId });
      setUserForm(emptyUser);
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

  function startVisitEdit(visit) {
    setEditingVisitId(visit.id);
    setVisitForm({
      locationId: visit.location_id, hostId: visit.host_id || "",
      visitorName: visit.visitor_name, visitorEmail: visit.visitor_email || "",
      visitorPhone: visit.visitor_phone || "", purpose: visit.purpose,
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

  if (loading) return <main className="page"><div className="loading">Loading...</div></main>;

  const activeUser = users.find(u => u.id === session.user.id) || { ...session.user, permissions: [] };

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Visitor Management</p>
          <h1>{session.user.companyName}</h1>
        </div>
        <div className="toolbar">
          <span style={{ fontSize: "14px", color: "#666" }}>{session.user.fullName} &middot; {session.user.role}</span>
          <button onClick={onLogout} style={{ marginLeft: "12px", padding: "6px 14px", border: "1px solid #ddd", borderRadius: "4px", background: "white", cursor: "pointer" }}>Logout</button>
        </div>
      </header>
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
        onCompanyChange={() => {}}
        onUserChange={() => {}}
        onUserFormChange={updateUserForm}
        onUserSubmit={submitUser}
        onVisitChange={updateVisitForm}
        onVisitEdit={startVisitEdit}
        onVisitStatus={updateVisitStatus}
        onVisitSubmit={submitVisit}
      />
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
  if (!subdomain) return <LandingPage />;
  return <CompanyApp subdomain={subdomain} />;
}

createRoot(document.getElementById("root")).render(<App />);
