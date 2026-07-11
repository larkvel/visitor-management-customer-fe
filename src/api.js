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
  updateUserDetails: (userId, payload) => request(`/api/users/${userId}`, { method: "PUT", body: JSON.stringify(payload) }),
  toggleUserStatus: (userId, isActive) => request(`/api/users/${userId}/status`, { method: "PUT", body: JSON.stringify({ isActive }) }),
  changeUserRole: (userId, role) => request(`/api/users/${userId}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
  deleteUser: (userId) => request(`/api/users/${userId}`, { method: "DELETE" }),

  // Attendance
  getAttendance: (companyId, startDate, endDate) => {
    let url = `/api/attendance?companyId=${companyId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return request(url);
  },
  getAttendanceStats: (companyId) => request(`/api/attendance/stats?companyId=${companyId}`),
  getMyAttendanceSummary: () => request("/api/attendance/my-summary"),

  // Leave Requests
  submitLeaveRequest: (payload) => request("/api/leave-requests", { method: "POST", body: JSON.stringify(payload) }),
  listLeaveRequests: (companyId, userId) => {
    let url = `/api/leave-requests?companyId=${companyId}`;
    if (userId) url += `&userId=${userId}`;
    return request(url);
  },
  updateLeaveStatus: (requestId, status) => request(`/api/leave-requests/${requestId}/status`, { method: "PUT", body: JSON.stringify({ status }) }),

  // Payroll
  getPayrollSettings: () => request("/api/payroll/settings"),
  savePayrollSettings: (payload) => request("/api/payroll/settings", { method: "POST", body: JSON.stringify(payload) }),
  calculatePayroll: (companyId, year, month) => request(`/api/payroll/calculate?companyId=${companyId}&year=${year}&month=${month}`),
  savePayslip: (payload) => request("/api/payroll/slips", { method: "POST", body: JSON.stringify(payload) }),
  getPayslips: (companyId, year, month, userId) => {
    let url = `/api/payroll/slips?companyId=${companyId}`;
    if (year) url += `&year=${year}`;
    if (month) url += `&month=${month}`;
    if (userId) url += `&userId=${userId}`;
    return request(url);
  },

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
