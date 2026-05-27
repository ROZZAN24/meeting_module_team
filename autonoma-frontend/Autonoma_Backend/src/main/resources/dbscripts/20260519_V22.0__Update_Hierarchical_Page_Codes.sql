-- 20260519_V22.0__Update_Hierarchical_Page_Codes.sql
-- Drop-and-reseed permission schema with user's non-underscore hierarchical codes.

-- 1. Clean existing records (avoid constraint violations by clearing dependent table first)
DELETE FROM bos_user_page_auth;
DELETE FROM bos_pages;
DELETE FROM bos_sub_modules;
DELETE FROM bos_modules;

-- 2. Seed Modules (Using IDENTITY_INSERT to keep static IDs)
SET IDENTITY_INSERT bos_modules ON;
INSERT INTO bos_modules (module_id, mod_code, mod_name, icon) VALUES
(1, 'M0000', 'Masters', 'IconDatabase'),
(2, 'HA0000', 'HR & Admin', 'IconUsers'),
(3, 'DD0000', 'Design & Development', 'IconTool'),
(4, 'SM0000', 'Sales & Marketing', 'IconBriefcase'),
(5, 'PP0000', 'Planning & Purchase', 'IconBriefcase'),
(6, 'P0000', 'Production', 'IconBuildingFactory'),
(7, 'Q0000', 'Quality', 'IconShieldCheck'),
(8, 'SL0000', 'Stores & Logistics', 'IconTruckDelivery'),
(9, 'FA0000', 'Finance & Accounts', 'IconReceiptTax'),
(10, 'MS0000', 'Maintenance & Services', 'IconServerCog'),
(11, 'QM0000', 'Quality Management Systems', 'IconListCheck'),
(12, 'R0000', 'Reports', 'IconReport'),
(13, 'S0000', 'Support', 'IconHelp'),
(14, 'AD0000', 'Admin', 'IconShieldLock'),
(15, 'DB0000', 'Dashboard', 'IconDashboard');
SET IDENTITY_INSERT bos_modules OFF;

-- 3. Seed Sub-Modules (Using IDENTITY_INSERT to keep static IDs and handle parent relationships)
SET IDENTITY_INSERT bos_sub_modules ON;

-- Level 1 sub-modules under Masters (mod_id = 1)
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(10, 1, NULL, 'M1000', 'QMS', 'IconListCheck'),
(20, 1, NULL, 'M2000', 'HR', 'IconUsers'),
(30, 1, NULL, 'M3000', 'NPD', 'IconRocket'),
(40, 1, NULL, 'M4000', 'Vendor Master', 'IconTruckDelivery'),
(50, 1, NULL, 'M5000', 'Sales', 'IconBriefcase');

-- Level 2 sub-modules under Masters > QMS (sub_mod_id = 10)
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(11, 1, 10, 'M1100', 'Audit', 'IconSearch'),
(12, 1, 10, 'M1200', 'Checklist', 'IconListCheck'),
(13, 1, 10, 'M1300', 'Meeting', 'IconMessages');

-- Level 2 sub-modules under Masters > HR (sub_mod_id = 20)
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(21, 1, 20, 'M2100', 'ATS', 'IconSearch'),
(22, 1, 20, 'M2200', 'Employee', 'IconUsers'),
(23, 1, 20, 'M2300', 'Common', 'IconTags');

-- Level 2 sub-modules under Masters > NPD (sub_mod_id = 30)
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(31, 1, 30, 'M3100', 'Product', 'IconBuildingFactory'),
(32, 1, 30, 'M3200', 'Wind Farm', 'IconRocket');

-- Level 2 sub-modules under Masters > Vendor Master (sub_mod_id = 40)
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(41, 1, 40, 'M4100', 'Supplier', 'IconTruckDelivery'),
(42, 1, 40, 'M4200', 'Sub Contractor', 'IconTool');

-- Level 2 sub-modules under Masters > Sales (sub_mod_id = 50)
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(51, 1, 50, 'M5100', 'CRM', 'IconUserCheck'),
(52, 1, 50, 'M5200', 'Terms & Logistics', 'IconTruck');

-- Sub-modules under other top-level modules
-- Under Sales & Marketing (mod_id = 4)
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(411, 4, NULL, 'SM1100', 'OCR', 'IconServerCog');

-- Under QMS (mod_id = 11)
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(111, 11, NULL, 'QM1100', 'Checklist', 'IconClipboardCheck'),
(112, 11, NULL, 'QM1200', 'Audit', 'IconFileCheck'),
(113, 11, NULL, 'QM1300', 'Meeting', 'IconMessage2');

-- Under Support (mod_id = 13)
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(131, 13, NULL, 'S1100', 'Support Ticket', 'IconHelp');

-- Under Admin (mod_id = 14)
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(141, 14, NULL, 'AD1100', 'Admin Hub', 'IconCategory'),
(142, 14, NULL, 'AD1200', 'BOS(S) Admin', 'IconUserShield');

-- Under Dashboard (mod_id = 15)
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(151, 15, NULL, 'DB1100', 'Dashboard', 'IconDashboard');

SET IDENTITY_INSERT bos_sub_modules OFF;

-- 4. Seed Pages
INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon) VALUES
-- Masters > QMS > Audit (mod_id=1, sub_mod_id=11)
(1, 11, 'M1110', 'Audit Type', 1, '/master/qms/audit/type', 'IconNotes'),
(1, 11, 'M1120', 'Audit Area / Zone', 1, '/master/qms/audit/area', 'IconMapPin'),
(1, 11, 'M1130', 'Audit Criteria', 1, '/master/qms/audit/criteria', 'IconShieldCheck'),

-- Masters > QMS > Checklist (mod_id=1, sub_mod_id=12)
(1, 12, 'M1210', 'Check List Master', 1, '/master/qms/checklist/master', 'IconClipboardCheck'),

-- Masters > QMS > Meeting (mod_id=1, sub_mod_id=13)
(1, 13, 'M1310', 'Meeting Master', 1, '/master/qms/meeting/master', 'IconCalendarEvent'),
(1, 13, 'M1320', 'Unnamed Page', 1, '/master/qms/meeting/unnamed', 'IconHelp'),

-- Masters > HR > ATS (mod_id=1, sub_mod_id=21)
(1, 21, 'M2110', 'Interview Criteria Master', 1, '/master/hr/ats/interview-criteria', 'IconClipboardCheck'),
(1, 21, 'M2120', 'Email Content Master', 1, '/master/hr/ats/email-content', 'IconMessage2'),
(1, 21, 'M2130', 'Applicant Verification Criteria', 1, '/master/hr/ats/verification', 'IconShieldCheck'),
(1, 21, 'M2140', 'Induction Criteria', 1, '/master/hr/ats/induction-criteria', 'IconUserPlus'),
(1, 21, 'M2150', 'Induction Pending', 1, '/master/hr/ats/induction-assignment', 'IconCalendarEvent'),
(1, 21, 'M2160', 'Induction Training', 1, '/master/hr/ats/induction-training', 'IconClipboardCheck'),
(1, 21, 'M2170', 'Induction Trainee', 1, '/master/hr/ats/induction-trainee', 'IconUserCheck'),

-- Masters > HR > Employee (mod_id=1, sub_mod_id=22)
(1, 22, 'M2210', 'Employee Master', 1, '/hra/employee/master', 'IconUserPlus'),
(1, 22, 'M2220', 'Employee Type', 1, '/master/hr/employee-type', 'IconTags'),
(1, 22, 'M2230', 'Department', 1, '/master/hr/department', 'IconBuilding'),
(1, 22, 'M2240', 'Designation', 1, '/master/hr/designation', 'IconBriefcase'),
(1, 22, 'M2250', 'Level', 1, '/master/hr/desg-level', 'IconHierarchy'),
(1, 22, 'M2260', 'Grade', 1, '/master/hr/grade', 'IconAward'),
(1, 22, 'M2270', 'Employee Satisfaction Criteria', 1, '/master/hr/satisfaction', 'IconAward'),

-- Masters > HR > Common (mod_id=1, sub_mod_id=23)
(1, 23, 'M2310', 'Holiday', 1, '/master/hr/payroll/holiday', 'IconCalendarEvent'),
(1, 23, 'M2320', 'Bank Details', 1, '/master/hr/payroll/bank', 'IconBuildingBank'),
(1, 23, 'M2330', 'Shift', 1, '/master/hr/payroll/shift', 'IconClock'),
(1, 23, 'M2340', 'Loan Master', 1, '/master/hr/payroll/loan', 'IconCoins'),
(1, 23, 'M2350', 'Leave Master', 1, '/master/hr/payroll/leave', 'IconCalendar'),
(1, 23, 'M2360', 'Permission Master', 1, '/master/hr/payroll/permission', 'IconLock'),
(1, 23, 'M2370', 'Petrol Allowance', 1, '/master/hr/payroll/petrol', 'IconGasStation'),
(1, 23, 'M2380', 'Policy Master', 1, '/master/hr/payroll/policy', 'IconFileText'),

-- Masters > NPD > Product (mod_id=1, sub_mod_id=31)
(1, 31, 'M3110', 'Product Item Group', 1, '/master/npd/product-group', 'IconCategory'),
(1, 31, 'M3120', 'Product Item Type', 1, '/master/npd/product-type', 'IconListCheck'),
(1, 31, 'M3130', 'Product Item Sub Type', 1, '/master/npd/product-subtype', 'IconNotes'),
(1, 31, 'M3140', 'Product OEM Master', 1, '/master/npd/product-oem', 'IconBuilding'),
(1, 31, 'M3150', 'Product OEM Mapping', 1, '/master/npd/product-oem-mapping', 'IconHierarchy'),
(1, 31, 'M3160', 'Product Model Master', 1, '/master/npd/product-model', 'IconSettings'),
(1, 31, 'M3170', 'Product Capacity Master', 1, '/master/npd/product-capacity', 'IconAward'),

-- Masters > NPD > Wind Farm (mod_id=1, sub_mod_id=32)
(1, 32, 'M3210', 'Wind Farm Master', 1, '/master/npd/wind-farm', 'IconRocket'),

-- Masters > Vendor Master > Supplier (mod_id=1, sub_mod_id=41)
(1, 41, 'M4110', 'Supplier Master', 1, '/sm/suppliers', 'IconTruckDelivery'),

-- Masters > Vendor Master > Sub Contractor (mod_id=1, sub_mod_id=42)
(1, 42, 'M4210', 'Sub Contractor', 1, '/sm/sub-contractors', 'IconTool'),

-- Masters > Sales > CRM (mod_id=1, sub_mod_id=51)
(1, 51, 'M5110', 'Customer Satisfaction Criteria', 1, '/master/sales/crm/satisfaction', 'IconMoodSmile'),
(1, 51, 'M5120', 'Contact Master', 1, '/sm/contacts', 'IconUsers'),
(1, 51, 'M5130', 'Customer Master', 1, '/sm/customers', 'IconBuilding'),
(1, 51, 'M5140', 'Customer Potential', 1, '/master/sales/crm/potential', 'IconChartBar'),

-- Masters > Sales > Terms & Logistics (mod_id=1, sub_mod_id=52)
(1, 52, 'M5210', 'Payment Terms', 1, '/master/common/payment-terms', 'IconCreditCard'),
(1, 52, 'M5220', 'Delivery Terms', 1, '/master/common/delivery-terms', 'IconTruckDelivery'),
(1, 52, 'M5230', 'Currency', 1, '/master/accounts/currency', 'IconCoins'),
(1, 52, 'M5240', 'Unit of Measurement', 1, '/master/sales/logistics/uom', 'IconRuler2'),
(1, 52, 'M5250', 'Country Master', 1, '/master/common/country', 'IconWorld'),
(1, 52, 'M5260', 'State Master', 1, '/master/common/state', 'IconMapPin'),
(1, 52, 'M5270', 'Segment', 1, '/sm/ocr/segment-master', 'IconChartPie'),
(1, 52, 'M5280', 'Sub Segment', 1, '/sm/ocr/sub-segment-master', 'IconChartDonut'),
(1, 52, 'M5290', 'Mode of Despatch', 1, '/master/sales/logistics/despatch-mode', 'IconPlaneTilt'),
(1, 52, 'M5300', 'Freight', 1, '/master/sales/logistics/freight', 'IconTractor'),

-- Sales & Marketing > OCR (mod_id=4, sub_mod_id=411)
(4, 411, 'SM1110', 'Enquiry Dashboard', 1, '/sm/enquiry/dashboard', 'IconDashboard'),
(4, 411, 'SM1120', 'Enquiry', 1, '/sm/enquiries', 'IconListCheck'),
(4, 411, 'SM1130', 'Price Master', 1, '/sm/price-master', 'IconReport'),
(4, 411, 'SM1140', 'Quotation', 1, '/sm/quotations', 'IconReport'),

-- Quality Management Systems > Checklist (mod_id=11, sub_mod_id=111)
(11, 111, 'QM1110', 'Checklist Verify', 1, '/qms/checklist/verify', 'IconChecks'),
(11, 111, 'QM1120', 'Close Checklist / Renewal', 1, '/qms/checklist/close-renewal', 'IconFileCheck'),
(11, 111, 'QM1130', 'Checklist / Renewal Verify', 1, '/qms/checklist/renewal-verify', 'IconShieldCheck'),
(11, 111, 'QM1140', 'Checklist / Renewal Report', 1, '/qms/checklist/renewal-report', 'IconReport'),

-- Quality Management Systems > Audit (mod_id=11, sub_mod_id=112)
(11, 112, 'QM1210', 'Audit Schedule', 1, '/qms/audit/schedule', 'IconCalendarEvent'),
(11, 112, 'QM1220', 'Audit User Attendance', 1, '/qms/audit/attendance', 'IconUserCheck'),
(11, 112, 'QM1230', 'Audit Observation', 1, '/qms/audit/observation', 'IconReportAnalytics'),
(11, 112, 'QM1240', 'Close NCR / OFI', 1, '/qms/audit/ncr/close', 'IconFileCheck'),
(11, 112, 'QM1250', 'Audit NCR / OFI Approval', 1, '/qms/audit/ncr/approval', 'IconShieldCheck'),
(11, 112, 'QM1260', 'Audit Report', 1, '/qms/audit/report', 'IconReport'),

-- Quality Management Systems > Meeting (mod_id=11, sub_mod_id=113)
(11, 113, 'QM1310', 'Meeting Schedule', 1, '/qms/meeting-schedule', 'IconCalendarEvent'),
(11, 113, 'QM1320', 'Meeting User Attendance', 1, '/qms/meeting-attendance', 'IconUserCheck'),
(11, 113, 'QM1330', 'Minutes of Meeting', 1, '/qms/minutesofmeeting', 'IconNotes'),
(11, 113, 'QM1340', 'Close MOM', 1, '/qms/close-mom', 'IconFileCheck'),
(11, 113, 'QM1350', 'MOM Approval', 1, '/qms/mom-approval', 'IconShieldCheck'),

-- Support > Support Ticket (mod_id=13, sub_mod_id=131)
(13, 131, 'S1110', 'Support Ticket', 1, '/support/ticket', 'IconHelp'),

-- Admin > Admin Hub (mod_id=14, sub_mod_id=141)
(14, 141, 'AD1110', 'Company Profile', 1, '/admin/company-profile', 'IconBuildingSkyscraper'),
(14, 141, 'AD1120', 'Division Master (Units)', 1, '/admin/division', 'IconLayoutColumns'),
(14, 141, 'AD1130', 'User Credentials', 1, '/admin/user-credentials', 'IconUsers'),
(14, 141, 'AD1140', 'User Access', 1, '/admin/user-access', 'IconFingerprint'),
(14, 141, 'AD1150', 'Audit Trail', 1, '/admin/audit-trail', 'IconHistory'),
(14, 141, 'AD1160', 'User Session Analytics', 1, '/admin/session-analytics', 'IconTimeline'),
(14, 141, 'AD1170', 'File Traceability Hub', 1, '/admin/file-traceability-hub', 'IconFileAnalytics'),

-- Admin > BOS(S) Admin (mod_id=14, sub_mod_id=142)
(14, 142, 'AD1210', 'Business Authorization', 1, '/admin/business-authorization', 'IconShieldLock'),
(14, 142, 'AD1220', 'App Preference', 1, '/admin/preference-master', 'IconSettings'),
(14, 142, 'AD1230', 'Prefix/Suffix Credentials', 1, '/admin/prefix-credentials', 'IconSettings'),
(14, 142, 'AD1240', 'Session Monitoring', 1, '/admin/session-monitoring', 'IconActivity'),

-- Dashboard > Dashboard (mod_id=15, sub_mod_id=151)
(15, 151, 'DB1110', 'Default', 1, '/dashboard/default', 'IconDashboard'),
(15, 151, 'DB1120', 'Analytics', 1, '/dashboard/analytics', 'IconTimeline'),
(15, 151, 'DB1130', 'Invoice', 1, '/dashboard/invoice', 'IconFileText'),
(15, 151, 'DB1140', 'CRM', 1, '/dashboard/crm', 'IconUsers'),
(15, 151, 'DB1150', 'Blog', 1, '/dashboard/blog', 'IconNotes');

-- 5. Grant Access to All Users (default auth mapping)
INSERT INTO bos_user_page_auth (user_id, page_id, sub_mod_id, mod_id, enable, read_acs, [write], delete_acs, export, approval, manager, additional1, additional2)
SELECT 
    u.user_id, 
    p.page_id, 
    p.sub_mod_id, 
    p.mod_id, 
    1, 1, 1, 1, 1, 1, 1, 1, 1
FROM bos_pages p
CROSS JOIN ad_user_credential u;
