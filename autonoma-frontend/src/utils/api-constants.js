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
    ACTIVE_DEPARTMENTS: `${API_BASE}/hrm/departments/active`,
    DESIGNATIONS: `${API_BASE}/hrm/designations`,
    CATEGORIES: `${API_BASE}/hrm/categories`,
    LEVELS: `${API_BASE}/master/hr/designationlevel`,
    DESIGNATION_LEVELS: `${API_BASE}/master/hr/designationlevel`,
    TYPES: `${API_BASE}/hrm/employee-types`,
    EMPLOYEES: `${API_BASE}/master/employee`,
    GRADES: `${API_BASE}/master/hr/grade`,
    USERS: `${API_BASE}/users/all`,
    DIVISIONS: `${API_BASE}/admin/divisions`,
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
    MEETINGS: `${API_BASE}/qms/meetings`,
    MEETING_SCHEDULES: `${API_BASE}/qms/meeting-schedules`,
    MEETING_ATTENDANCE: `${API_BASE}/qms/meeting-attendance`,
    MOMS: `${API_BASE}/qms/moms`,
    MODEL_NAME: `${API_BASE}/master/qms/model-name`,
    UOM: `${API_BASE}/master/qms/uom`
  },

  // Admin Module
  ADMIN: {
    PREFERENCES: `${API_BASE}/preferences`,
    COMPANY: `${API_BASE}/company-profile`,
    CREDENTIALS: `${API_BASE}/users`,
  },

  // SM (Sales & Marketing) Module
  SM: {
    CUSTOMERS: `${API_BASE}/sm/customers`,
    CONTACTS: `${API_BASE}/sm/contacts`,
    ENQUIRIES: `${API_BASE}/sm/enquiry`,
    PRICE_MASTER: `${API_BASE}/sm/price-master`,
    SUPPLIERS: `${API_BASE}/sm/suppliers`,
    SUB_CONTRACTORS: `${API_BASE}/sm/sub-contractors`,
    QUOTATIONS: `${API_BASE}/sm/quotation`,
    SEGMENTS: `${API_BASE}/sm/segments`,
    SUB_SEGMENTS: `${API_BASE}/sm/sub-segments`,
    POTENTIAL: `${API_BASE}/master/sales/crm/potential`,
  },

  // OCR Module (proxied through Spring Boot)
  OCR: {
    INBOX: `${API_BASE}/ocr/inbox`,
    MARK_READ: (id) => `${API_BASE}/ocr/inbox/${id}/mark-read`,
    PROCESSING: `${API_BASE}/ocr/processing-requests`,
    PROCESSING_BY_ID: (id) => `${API_BASE}/ocr/processing-requests/${id}`,
  },

  NPD: {
    ITEM_GROUP: `${API_BASE}/master/npd/item-group`,
    ITEM_TYPE: `${API_BASE}/master/npd/item-type`,
    ITEM_SUBTYPE: `${API_BASE}/master/npd/item-subtype`,
    ITEM_OEM: `${API_BASE}/master/npd/oem`,
    ITEM_OEM_MAPPING: `${API_BASE}/master/npd/oem-mapping`,
    ITEM_MODEL: `${API_BASE}/master/npd/model`,
    ITEM_CAPACITY: `${API_BASE}/master/npd/capacity`,
    WIND_FARMS: `${API_BASE}/master/npd/wind-farm`,
    PROCESS: `${API_BASE}/master/npd/process`
  },

  // Common/Infrastructure
  FILES: `${API_BASE}/files`
};
