/**
 * API Constants
 * Centralized source of truth for all backend endpoints.
 * This prevents typos and makes it easy to change paths globally.
 */

export const API_BASE = '/api';

export const API_PATHS = {
  // HRM Module
  HRM: {
    DEPARTMENTS: `${API_BASE}/hrm/departments`,
    DESIGNATIONS: `${API_BASE}/hrm/designations`,
    EMPLOYEES: `${API_BASE}/master/employee`,
  },
  
  // QMS Module
  QMS: {
    CHECKLIST: `${API_BASE}/qms/checklist`,
    AUDIT_TYPE: `${API_BASE}/master/qms/audit-type`,
    AUDIT_AREA: `${API_BASE}/master/qms/audit-area`,
    AUDIT_CRITERIA: `${API_BASE}/master/qms/audit-criteria`,
    AUDIT_SCHEDULE: `${API_BASE}/qms/audit-schedules`,
    AUDIT_ATTENDANCE: `${API_BASE}/qms/audit/attendance`,
    AUDIT_OBSERVATION: `${API_BASE}/qms/audit/observation`,
    AUDIT_NCR: `${API_BASE}/qms/audit/ncr`,
  },

  // Admin Module
  ADMIN: {
    PREFERENCES: `${API_BASE}/preferences`,
    COMPANY: `${API_BASE}/company-profile`,
    CREDENTIALS: `${API_BASE}/users`,
  },

  // Common/Infrastructure
  FILES: `${API_BASE}/files`
};
