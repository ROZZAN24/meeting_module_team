import { useMemo } from 'react';
import useSWR from 'swr';
import useAuth from 'hooks/useAuth';
import { fetcher } from 'utils/axios';

/**
 * usePagePermissions — BOS SOP Compliant Permission Hook
 * 
 * Fetches the current user's page-level authorization flags from the backend
 * and returns a clean permission object for the given pageCode.
 * 
 * Usage:
 *   const perms = usePagePermissions('M3110');
 *   if (perms.write) { // show + New button }
 *   if (perms.delete) { // show delete action }
 *   if (perms.export) { // show export button }
 *   if (perms.approval) { // show approve/reject actions }
 *
 * @param {string} pageCode - The unique page code (e.g., 'M3110', 'QM1210', 'AD1130')
 * @returns {{ loading: boolean, enabled: boolean, read: boolean, write: boolean, delete: boolean, export: boolean, approval: boolean, manager: boolean }}
 */
export default function usePagePermissions(pageCode) {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: auths, isLoading } = useSWR(
    userId ? `/api/user-page-auth/${userId}` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000 // 5-min cache — permissions don't change mid-session
    }
  );

  return useMemo(() => {
    // While loading, default to read-only (graceful degradation — don't block users)
    if (isLoading || !auths) {
      return {
        loading: isLoading,
        enabled: true,
        read: true,
        write: false,
        delete: false,
        export: false,
        approval: false,
        manager: false
      };
    }

    // Find the permission record for this specific pageCode
    const pageAuth = Array.isArray(auths)
      ? auths.find((a) => a.page?.pageCode === pageCode)
      : null;

    // If no record found (page not registered or not assigned), default to read-only
    if (!pageAuth) {
      return {
        loading: false,
        enabled: true,
        read: true,
        write: false,
        delete: false,
        export: false,
        approval: false,
        manager: false
      };
    }

    // If page is disabled for this user, block everything
    if (pageAuth.enable === 0) {
      return {
        loading: false,
        enabled: false,
        read: false,
        write: false,
        delete: false,
        export: false,
        approval: false,
        manager: false
      };
    }

    // Normal case — return exact permission flags
    return {
      loading: false,
      enabled: true,
      read: pageAuth.readAcs === 1,
      write: pageAuth.write === 1,
      delete: pageAuth.deleteAcs === 1,
      export: pageAuth.export === 1,
      approval: pageAuth.approval === 1,
      manager: pageAuth.manager === 1
    };
  }, [auths, pageCode, isLoading]);
}

/**
 * Canonical mapping of all BOS page codes.
 * Import this in view files: import { PAGE_CODES } from 'hooks/usePagePermissions';
 * Usage: const perms = usePagePermissions(PAGE_CODES.NPD_ITEM_GROUP);
 */
export const PAGE_CODES = {
  // ── Masters > HR > ATS ──
  ATS_INTERVIEW_CRITERIA: 'M2110',
  ATS_EMAIL_CONTENT: 'M2120',
  ATS_VERIFICATION: 'M2130',
  ATS_INDUCTION_CRITERIA: 'M2140',
  ATS_INDUCTION_PENDING: 'M2150',
  ATS_INDUCTION_TRAINING: 'M2160',
  ATS_INDUCTION_TRAINEE: 'M2170',

  // ── Masters > HR > Employee ──
  EMP_TYPE: 'M2220',
  EMP_DEPARTMENT: 'M2230',
  EMP_DESIGNATION: 'M2240',
  EMP_LEVEL: 'M2250',
  EMP_SATISFACTION: 'M2270',
  EMP_MASTER: 'M2210',
  EMP_GRADE: 'M2260',

  // ── Masters > HR > Payroll ──
  PAY_HOLIDAY: 'M2310',
  PAY_BANK: 'M2320',
  PAY_SHIFT: 'M2330',
  PAY_LOAN: 'M2340',
  PAY_LEAVE: 'M2350',
  PAY_PERMISSION: 'M2360',
  PAY_PETROL: 'M2370',
  PAY_POLICY: 'M2380',

  // ── Masters > QMS ──
  QMS_CHECKLIST: 'M1210',
  QMS_AUDIT_TYPE: 'M1110',
  QMS_AUDIT_AREA: 'M1120',
  QMS_AUDIT_CRITERIA: 'M1130',
  QMS_MEETING: 'M1310',

  // ── Masters > NPD ──
  NPD_ITEM_TYPE: 'M3120',
  NPD_ITEM_SUBTYPE: 'M3130',
  NPD_OEM: 'M3140',
  NPD_OEM_MAPPING: 'M3150',
  NPD_MODEL: 'M3160',
  NPD_CAPACITY: 'M3170',
  NPD_ITEM_GROUP: 'M3110',
  NPD_WIND_FARM: 'M3210',

  // ── Masters > Sales > CRM ──
  CRM_SATISFACTION: 'M5110',
  CRM_CONTACT: 'M5120',
  CRM_CUSTOMER: 'M5130',
  CRM_POTENTIAL: 'M5140',

  // ── Masters > Sales > Logistics ──
  LOG_PAYMENT_TERMS: 'M5210',
  LOG_DELIVERY_TERMS: 'M5220',
  LOG_CURRENCY: 'M5230',
  LOG_UOM: 'M5240',
  LOG_COUNTRY: 'M5250',
  LOG_STATE: 'M5260',
  LOG_SEGMENT: 'M5270',
  LOG_SUB_SEGMENT: 'M5280',
  LOG_DESPATCH_MODE: 'M5290',
  LOG_FREIGHT: 'M5300',

  // ── Masters > Vendor ──
  VEN_SUPPLIER: 'M4110',
  VEN_SUBCONTRACTOR: 'M4210',

  // ── QMS Transactions ──
  QMS_CHECKLIST_VERIFY: 'QM1110',
  QMS_CLOSE_RENEWAL: 'QM1120',
  QMS_CHECKLIST_CLOSE: 'QM1120',
  QMS_RENEWAL_VERIFY: 'QM1130',
  QMS_CHECKLIST_RENEWAL_VERIFY: 'QM1130',
  QMS_RENEWAL_REPORT: 'QM1140',
  QMS_CHECKLIST_REPORT: 'QM1140',
  QMS_AUDIT_SCHEDULE: 'QM1210',
  QMS_AUDIT_ATTENDANCE: 'QM1220',
  QMS_AUDIT_OBSERVATION: 'QM1230',
  QMS_AUDIT_NCR_CLOSE: 'QM1240',
  QMS_AUDIT_NCR_APPROVAL: 'QM1250',
  QMS_AUDIT_REPORT: 'QM1260',
  QMS_MEETING_SCHEDULE: 'QM1310',
  QMS_MOM: 'QM1330',
  QMS_MEETING_MOM: 'QM1330',
  QMS_MEETING_ATTENDANCE: 'QM1320',
  QMS_CLOSE_MOM: 'QM1340',
  QMS_MEETING_CLOSE_MOM: 'QM1340',
  QMS_MOM_APPROVAL: 'QM1350',
  QMS_MEETING_MOM_APPROVAL: 'QM1350',

  // ── Sales & Marketing ──
  SM_ENQUIRY_DASHBOARD: 'SM1110',
  SM_ENQUIRY: 'SM1120',
  SM_PRICE_MASTER: 'SM1130',
  SM_QUOTATION: 'SM1140',
  SM_TYPE_OF_SERVICE: 'SM1150',

  // ── Admin Hub ──
  AD_COMPANY_PROFILE: 'AD1110',
  AD_DIVISION: 'AD1120',
  AD_USER_CREDENTIALS: 'AD1130',
  AD_USER_ACCESS: 'AD1140',
  AD_AUDIT_TRAIL: 'AD1150',
  AD_SESSION_ANALYTICS: 'AD1160',
  AD_FILE_TRACEABILITY: 'AD1170',

  // ── BOS Admin ──
  AD_BUSINESS_AUTH: 'AD1210',
  AD_APP_PREFERENCE: 'AD1220',
  AD_PREFIX_CREDENTIALS: 'AD1230',
  AD_SESSION_MONITORING: 'AD1240',

  // ── Dashboard ──
  DASHBOARD_DEFAULT: 'DB1110',
  DASHBOARD_ANALYTICS: 'DB1120'
};
