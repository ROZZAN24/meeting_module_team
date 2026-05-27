-- 20260514_V9.8__Restore_Other_Modules.sql

-- This migration restores modules and pages that were previously hardcoded in the frontend
-- but were not mentioned in the 'Masters' hierarchy list.

-- 1. Dashboard Module
SET IDENTITY_INSERT bos_modules ON;
INSERT INTO bos_modules (module_id, mod_code, mod_name, icon) VALUES
(10, 'DASHBOARD', 'Dashboard', 'IconDashboard');
SET IDENTITY_INSERT bos_modules OFF;

INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon) VALUES
(10, NULL, 'DB1110', 'Default', 1, '/dashboard/default', 'IconDashboard'),
(10, NULL, 'DB1120', 'Analytics', 1, '/dashboard/analytics', 'IconDeviceAnalytics'),
(10, NULL, 'DB_03', 'Invoice', 1, '/dashboard/invoice', 'IconFileInvoice'),
(10, NULL, 'DB_04', 'CRM', 1, '/dashboard/crm', 'IconLifebuoy'),
(10, NULL, 'DB_05', 'Blog', 1, '/dashboard/blog', 'IconArticle');

-- 2. HRA Module (HR & Admin)
SET IDENTITY_INSERT bos_modules ON;
INSERT INTO bos_modules (module_id, mod_code, mod_name, icon) VALUES
(30, 'HRA', 'HRA', 'IconUsers');
SET IDENTITY_INSERT bos_modules OFF;

SET IDENTITY_INSERT bos_sub_modules ON;
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(301, 30, NULL, 'HRA_EMP', 'Employee', 'IconUsers');
SET IDENTITY_INSERT bos_sub_modules OFF;

INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon) VALUES
(30, 301, 'HRA_EMP_01', 'Employee Master (HRA)', 1, '/hra/employee/master', 'IconUserPlus');

-- 3. Sales & Marketing Module (Transaction)
SET IDENTITY_INSERT bos_modules ON;
INSERT INTO bos_modules (module_id, mod_code, mod_name, icon) VALUES
(40, 'SM', 'Sales & Marketing', 'IconBriefcase');
SET IDENTITY_INSERT bos_modules OFF;

SET IDENTITY_INSERT bos_sub_modules ON;
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(401, 40, NULL, 'SM_OCR', 'OCR', 'IconServerCog');
SET IDENTITY_INSERT bos_sub_modules OFF;

INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon) VALUES
(40, 401, 'SM1110', 'Enquiry Dashboard', 1, '/sm/enquiry/dashboard', 'IconDashboard'),
(40, 401, 'SM1120', 'Enquiry', 1, '/sm/enquiries', 'IconListCheck'),
(40, 401, 'SM1130', 'Price Master', 1, '/sm/price-master', 'IconReport'),
(40, 401, 'SM1140', 'Quotation', 1, '/sm/quotations', 'IconReport');

-- 4. Quality Management Systems (Transaction/Execution)
SET IDENTITY_INSERT bos_modules ON;
INSERT INTO bos_modules (module_id, mod_code, mod_name, icon) VALUES
(50, 'QMS_TRANS', 'Quality Management Systems', 'IconListCheck');
SET IDENTITY_INSERT bos_modules OFF;

SET IDENTITY_INSERT bos_sub_modules ON;
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(501, 50, NULL, 'QMS_CL', 'Checklist', 'IconClipboardCheck'),
(502, 50, NULL, 'QMS_AU', 'Audit', 'IconFileCheck'),
(503, 50, NULL, 'QMS_MT', 'Meeting', 'IconMessage2');
SET IDENTITY_INSERT bos_sub_modules OFF;

INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon) VALUES
-- Checklist
(50, 501, 'QM1110', 'Checklist Verify', 1, '/qms/checklist/verify', 'IconChecks'),
(50, 501, 'QM1120', 'Close Checklist / Renewal', 1, '/qms/checklist/close-renewal', 'IconFileCheck'),
(50, 501, 'QM1130', 'Checklist / Renewal Verify', 1, '/qms/checklist/renewal-verify', 'IconShieldCheck'),
(50, 501, 'QM1140', 'Checklist / Renewal Report', 1, '/qms/checklist/renewal-report', 'IconReport'),
-- Audit
(50, 502, 'QM1210', 'Audit Schedule', 1, '/qms/audit/schedule', 'IconCalendarEvent'),
(50, 502, 'QM1220', 'Audit User Attendance', 1, '/qms/audit/attendance', 'IconUserCheck'),
(50, 502, 'QM1230', 'Audit Observation', 1, '/qms/audit/observation', 'IconReportAnalytics'),
(50, 502, 'QM1240', 'Close NCR / OFI', 1, '/qms/audit/ncr/close', 'IconFileCheck'),
(50, 502, 'QM1250', 'Audit NCR / OFI approval', 1, '/qms/audit/ncr/approval', 'IconShieldCheck'),
(50, 502, 'QM1260', 'Audit Report', 1, '/qms/audit/report', 'IconReport'),
-- Meeting
(50, 503, 'QM1310', 'Meeting Schedule', 1, '/qms/meeting-schedule', 'IconCalendarEvent'),
(50, 503, 'QM1330', 'Minutes of Meeting', 1, '/qms/minutesofmeeting', 'IconNotes'),
(50, 503, 'QM1320', 'Meeting User Attendance', 1, '/qms/meeting-attendance', 'IconUserCheck'),
(50, 503, 'QM1340', 'Close MOM', 1, '/qms/close-mom', 'IconFileCheck'),
(50, 503, 'QM1350', 'MOM Approval', 1, '/qms/mom-approval', 'IconShieldCheck');

-- 5. Support Module
SET IDENTITY_INSERT bos_modules ON;
INSERT INTO bos_modules (module_id, mod_code, mod_name, icon) VALUES
(60, 'SUPPORT', 'Support', 'IconHelp');
SET IDENTITY_INSERT bos_modules OFF;

INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon) VALUES
(60, NULL, 'SUP_01', 'Support Ticket', 1, '/support/ticket', 'IconHelp');

-- 6. Grant Access to All Users for these new pages
INSERT INTO bos_user_page_auth (user_id, page_id, sub_mod_id, mod_id, enable, read_acs, [write], delete_acs, export, approval, manager, additional1, additional2)
SELECT 
    u.user_id, 
    p.page_id, 
    p.sub_mod_id, 
    p.mod_id, 
    1, 1, 1, 1, 1, 1, 1, 1, 1
FROM bos_pages p
CROSS JOIN ad_user_credential u
WHERE NOT EXISTS (
    SELECT 1 FROM bos_user_page_auth a 
    WHERE a.user_id = u.user_id AND a.page_id = p.page_id
);
