import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { api } from "./api";
import CompanyDashboard from "./components/CompanyDashboard";
import { toDateTimeLocal, toIso, can } from "./utils/helpers";
import "./styles.css";

const emptyUser = {
  fullName: "",
  email: "",
  role: "executive"
};

const emptyVisit = {
  locationId: "",
  hostId: "",
  visitorName: "",
  visitorEmail: "",
  visitorPhone: "",
  purpose: "",
  expectedAt: ""
};

function App() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [users, setUsers] = useState([]);
  const [activeUserId, setActiveUserId] = useState("");
  const [locations, setLocations] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [visits, setVisits] = useState([]);
  const [dashboard, setDashboard] = useState({ expected: 0, onsite: 0, completed: 0, today: 0 });
  const [userForm, setUserForm] = useState(emptyUser);
  const [visitForm, setVisitForm] = useState({ ...emptyVisit, expectedAt: toDateTimeLocal() });
  const [editingVisitId, setEditingVisitId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId),
    [companies, selectedCompanyId]
  );

  const activeUser = useMemo(
    () => users.find((user) => user.id === activeUserId),
    [users, activeUserId]
  );

  async function loadCompanies() {
    const companyData = await api.listCompanies();
    setCompanies(companyData);
    setSelectedCompanyId((current) => current || companyData[0]?.id || "");
    return companyData;
  }

  async function loadCompanyData(companyId) {
    if (!companyId) {
      return;
    }

    const [locationData, hostData, userData, visitData, dashboardData] = await Promise.all([
      api.listLocations(companyId),
      api.listHosts(companyId),
      api.listUsers(companyId),
      api.listVisits(companyId),
      api.getDashboard(companyId)
    ]);

    setLocations(locationData);
    setHosts(hostData);
    setUsers(userData);
    setVisits(visitData);
    setDashboard(dashboardData);
    setActiveUserId((current) => current || userData[0]?.id || "");
    setVisitForm((current) => ({
      ...current,
      locationId: current.locationId || locationData[0]?.id || "",
      hostId: current.hostId || hostData[0]?.id || ""
    }));
  }

  // Load data on mount
  useEffect(() => {
    async function init() {
      try {
        const companyData = await loadCompanies();
        if (companyData.length > 0) {
          await loadCompanyData(companyData[0].id);
        }
      } catch (caught) {
        setError(caught.message);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  useEffect(() => {
