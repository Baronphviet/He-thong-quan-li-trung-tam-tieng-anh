import {apiGet, apiPost, apiPut, apiDelete, apiFetch} from "./apiClient";

export const authService = {
  login: (credentials) => apiPost("/auth/login", credentials)
};

export const userService = {
  softDelete: (id) => apiDelete(`/users/${id}`),
  changePassword: (id, password) => apiPut(`/users/${id}/password`, { password }),
  getProfile: (id) => apiGet(`/users/${id}/profile`),
  activate: (id) => apiFetch(`/users/${id}/activate`, { method: "PATCH" }),
  hardDelete: (id) => apiDelete(`/users/${id}/hard`),
};

export const adminService = {
  getAll: () => apiGet("/admins"),
  create: (data) => apiPost("/admins", data),
  update: (id, data) => apiPut(`/admins/${id}`, data)
};

export const classService = {
  getAll: () => apiGet("/classes"),
  getOpen: () => apiGet("/classes/open"),
  getById: (id) => apiGet(`/classes/${id}`),
  getDetails: (id) => apiGet(`/classes/${id}/details`),
  create: (data) => apiPost("/classes", data),
  update: (id, data) => apiPut(`/classes/${id}`, data),
  close: (id) => apiDelete(`/classes/${id}`)
};

export const studentService = {
  getAll: () => apiGet("/students"),
  getById: (id) => apiGet(`/students/${id}`),
  create: (data) => apiPost("/students", data),
  update: (id, data) => apiPut(`/students/${id}`, data)
};

export const teacherService = {
  getAll: () => apiGet("/teachers"),
  create: (data) => apiPost("/teachers", data),
  update: (id, data) => apiPut(`/teachers/${id}`, data)
};

export const parentService = {
  getAll: () => apiGet("/parents"),
  create: (data) => apiPost("/parents", data),
  update: (id, data) => apiPut(`/parents/${id}`, data),
  linkStudent: (data) => apiPost("/parents/link-student", data)
};

export const enrollmentService = {
  getAll: () => apiGet("/enrollments"),
  create: (data) => apiPost("/enrollments", data),
  update: (id, data) => apiPut(`/enrollments/${id}`, data)
};

export const paymentService = {
  getAll: () => apiGet("/monthly-fees"),
  getById: (id) => apiGet(`/monthly-fees/${id}`),
  processPayment: (data) => apiPost("/payments", data),
  getFinanceReport: () => apiGet("/reports/finance-monthly")
};

export const announcementService = {
  getAll: () => apiGet("/announcements"),
  getSlider: () => apiGet("/public/announcements/slider"),
  getById: (id) => apiGet(`/announcements/${id}`),
  create: (data) => apiPost("/announcements", data),
  update: (id, data) => apiPut(`/announcements/${id}`, data),
  delete: (id) => apiDelete(`/announcements/${id}`)
};

export const masterService = {
  getAcademicYears: () => apiGet("/master/academic-years"),
  createAcademicYear: (data) => apiPost("/master/academic-years", data),
  updateAcademicYear: (id, data) => apiPut(`/master/academic-years/${id}`, data),
  deleteAcademicYear: (id) => apiDelete(`/master/academic-years/${id}`),

  getAgeGroups: () => apiGet("/master/age-groups"),
  createAgeGroup: (data) => apiPost("/master/age-groups", data),
  updateAgeGroup: (id, data) => apiPut(`/master/age-groups/${id}`, data),
  deleteAgeGroup: (id) => apiDelete(`/master/age-groups/${id}`),

  getTeachers: () => apiGet("/teachers"),
  getParents: () => apiGet("/parents"),
  getStudents: () => apiGet("/students"),
  getClasses: () => apiGet("/classes")
};

export const dashboardService = {
  getSummary: () => apiGet("/dashboard/summary"),
  getStatistics: () => apiGet("/reports/statistics"),
  getStudentsByClass: () => apiGet("/reports/students-by-class"),
  getFinanceReport: () => apiGet("/reports/finance-monthly"),
  getFinanceProfit: () => apiGet("/reports/finance-profit"),
  getStudentChangeReport: () => apiGet("/reports/student-change")
};

export const attendanceService = {
  listSessions: (classId) => apiGet(`/classes/${classId}/sessions`),
  createSession: (classId, data) => apiPost(`/classes/${classId}/sessions`, data),
  getSheet: (sessionId) => apiGet(`/sessions/${sessionId}/attendance`),
  saveSheet: (sessionId, items) => apiPut(`/sessions/${sessionId}/attendance`, items),
  getStudentHistory: (studentId) => apiGet(`/students/${studentId}/attendance`)
};
