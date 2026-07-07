const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api-visit.larkvel.com";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
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
  registerCompany: (payload) => request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  checkSubdomainAvailable: (subdomain) => request("/api/auth/register/verify-subdomain", {
    method: "POST",
    body: JSON.stringify({ subdomain })
  }),
  
  // Companies
  getPlatformDashboard: () => request("/api/platform/dashboard"),
  listCompanies: () => request("/api/companies"),
  getCompanyBySubdomain: (subdomain) => request(`/api/companies/by-subdomain/${subdomain}`),
  createCompany: (payload) => request("/api/companies", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  updateCompany: (companyId, payload) => request(`/api/companies/${companyId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  }),
  listLocations: (companyId) => request(`/api/companies/${companyId}/locations`),
  listHosts: (companyId) => request(`/api/companies/${companyId}/hosts`),
  
  // Users
  listUsers: (companyId) => request(`/api/users?companyId=${companyId}`),
  createUser: (payload) => request("/api/users", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  
  // Visits
  listVisits: (companyId) => request(`/api/visits?companyId=${companyId}`),
  getDashboard: (companyId) => request(`/api/dashboard?companyId=${companyId}`),
  createVisit: (payload) => request("/api/visits", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  updateVisit: (visitId, payload) => request(`/api/visits/${visitId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  }),
  checkIn: (visitId, actorUserId) => request(`/api/visits/${visitId}/check-in`, {
    method: "POST",
    body: JSON.stringify({ actorUserId })
  }),
  checkOut: (visitId, actorUserId) => request(`/api/visits/${visitId}/check-out`, {
    method: "POST",
    body: JSON.stringify({ actorUserId })
  })
};
