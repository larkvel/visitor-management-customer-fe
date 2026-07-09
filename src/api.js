const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api-visit.larkvel.com";

function getToken() {
  try {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    const subdomain = parts.length >= 3 ? parts[0] : new URLSearchParams(window.location.search).get("company");
    if (subdomain) {
      const session = JSON.parse(localStorage.getItem(`vm_session_${subdomain}`) || "null");
      return session?.token || null;
    }
  } catch { /* ignore */ }
  return null;
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Request failed");
  }

  return response.json();
}

export const api = {
  // Auth
  login: (username, password, subdomain) => request("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password, subdomain }) }),
  registerCompany: (payload) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),

  // Companies
  getCompanyBySubdomain: (subdomain) => request(`/api/companies/by-subdomain/${subdomain}`),
  listLocations: (companyId) => request(`/api/companies/${companyId}/locations`),
  createLocation: (companyId, payload) => request(`/api/companies/${companyId}/locations`, { method: "POST", body: JSON.stringify(payload) }),
  listHosts: (companyId) => request(`/api/companies/${companyId}/hosts`),
  createHost: (companyId, payload) => request(`/api/companies/${companyId}/hosts`, { method: "POST", body: JSON.stringify(payload) }),

  // Users
  listUsers: (companyId) => request(`/api/users?companyId=${companyId}`),
  createUser: (payload) => request("/api/users", { method: "POST", body: JSON.stringify(payload) }),
  toggleUserStatus: (userId, isActive) => request(`/api/users/${userId}/status`, { method: "PUT", body: JSON.stringify({ isActive }) }),
  changeUserRole: (userId, role) => request(`/api/users/${userId}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
  deleteUser: (userId) => request(`/api/users/${userId}`, { method: "DELETE" }),

  // Visits
  listVisits: (companyId, startDate, endDate) => {
    let url = `/api/visits?companyId=${companyId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return request(url);
  },
  getDashboard: (companyId) => request(`/api/dashboard?companyId=${companyId}`),
  createVisit: (payload) => request("/api/visits", { method: "POST", body: JSON.stringify(payload) }),
  updateVisit: (visitId, payload) => request(`/api/visits/${visitId}`, { method: "PUT", body: JSON.stringify(payload) }),
  checkIn: (visitId, actorUserId) => request(`/api/visits/${visitId}/check-in`, { method: "POST", body: JSON.stringify({ actorUserId }) }),
  checkOut: (visitId, actorUserId) => request(`/api/visits/${visitId}/check-out`, { method: "POST", body: JSON.stringify({ actorUserId }) })
};
