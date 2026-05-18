-- 20260514_V9.6__Hierarchical_Sidebar_Structure.sql

-- 1. Add parent_sub_mod_id to bos_sub_modules
IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'parent_sub_mod_id' AND Object_ID = Object_ID(N'bos_sub_modules'))
    ALTER TABLE bos_sub_modules ADD parent_sub_mod_id INT NULL;
GO

-- 2. Clear existing data to re-seed hierarchy
DELETE FROM bos_user_page_auth;
DELETE FROM bos_pages;
DELETE FROM bos_sub_modules;
DELETE FROM bos_modules;
GO

-- 3. Seed Root Module: Masters
SET IDENTITY_INSERT bos_modules ON;
INSERT INTO bos_modules (module_id, mod_code, mod_name, icon) VALUES
(1, 'MASTERS', 'Masters', 'IconDatabase');
SET IDENTITY_INSERT bos_modules OFF;
GO

-- 4. Seed Sub-Modules (Recursive)
SET IDENTITY_INSERT bos_sub_modules ON;

-- Level 1 Sub-Modules under Masters
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(1, 1, NULL, 'HR', 'HR', 'IconUserEdit'),
(2, 1, NULL, 'QMS', 'QMS', 'IconShieldCheck'),
(3, 1, NULL, 'NPD', 'NPD', 'IconFlask'),
(4, 1, NULL, 'SALES', 'Sales', 'IconShoppingCart');

-- Level 2 Sub-Modules (Children of HR, QMS, etc.)
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon) VALUES
-- Under HR
(5, 1, 1, 'ATS', 'ATS', 'IconSearch'),
(6, 1, 1, 'EMPLOYEE', 'Employee', 'IconUsers'),
(7, 1, 1, 'PAYROLL', 'Payroll', 'IconCash'),
-- Under QMS
(8, 1, 2, 'CHECKLIST', 'Check List', 'IconListCheck'),
(9, 1, 2, 'AUDIT', 'Audit', 'IconSearch'),
(10, 1, 2, 'MEETING', 'Meeting', 'IconMessages'),
-- Under NPD
(11, 1, 3, 'PRODUCT', 'Product', 'IconPackage'),
-- Under Sales
(12, 1, 4, 'CRM', 'CRM', 'IconUserHeart'),
(13, 1, 4, 'LOGISTICS', 'Terms & Logistics', 'IconTruck');

SET IDENTITY_INSERT bos_sub_modules OFF;
GO

-- 5. Seed Pages
INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon) VALUES
-- 1.1.1 ATS
(1, 5, 'M_ATS_01', 'Interview Criteria Master', 1, '/masters/hr/ats/interview-criteria', 'IconClipboardList'),
(1, 5, 'M_ATS_02', 'Email Content Master', 1, '/masters/hr/ats/email-content', 'IconMail'),
(1, 5, 'M_ATS_03', 'Applicant Verification Criteria', 1, '/masters/hr/ats/verification', 'IconShieldCheck'),
(1, 5, 'M_ATS_04', 'Induction Criteria', 1, '/masters/hr/ats/induction', 'IconUserPlus'),

-- 1.1.2 Employee
(1, 6, 'M_EMP_01', 'Employee Type', 1, '/masters/hr/employee/type', 'IconTags'),
(1, 6, 'M_EMP_02', 'Department', 1, '/masters/hr/employee/department', 'IconHierarchy'),
(1, 6, 'M_EMP_03', 'Designation', 1, '/masters/hr/employee/designation', 'IconBriefcase'),
(1, 6, 'M_EMP_04', 'Level', 1, '/masters/hr/employee/level', 'IconArrowUpCircle'),
(1, 6, 'M_EMP_05', 'Employee Satisfaction Criteria', 1, '/masters/hr/employee/satisfaction', 'IconMoodSmile'),
(1, 6, 'M_EMP_06', 'Employee Master', 1, '/masters/hr/employee/master', 'IconUser'),

-- 1.1.3 Payroll
(1, 7, 'M_PAY_01', 'Holiday', 1, '/masters/hr/payroll/holiday', 'IconCalendar'),
(1, 7, 'M_PAY_02', 'Bank Details', 1, '/masters/hr/payroll/bank-details', 'IconBuildingBank'),
(1, 7, 'M_PAY_03', 'Shift', 1, '/masters/hr/payroll/shift', 'IconClock'),
(1, 7, 'M_PAY_04', 'Loan Master', 1, '/masters/hr/payroll/loan', 'IconCash'),
(1, 7, 'M_PAY_05', 'Leave Master', 1, '/masters/hr/payroll/leave', 'IconCalendarOff'),
(1, 7, 'M_PAY_06', 'Permission Master', 1, '/masters/hr/payroll/permission', 'IconLockAccess'),
(1, 7, 'M_PAY_07', 'Petrol Allowance', 1, '/masters/hr/payroll/petrol', 'IconGasStation'),
(1, 7, 'M_PAY_08', 'Policy Master', 1, '/masters/hr/payroll/policy', 'IconFileCertificate'),

-- 1.2.1 Check List
(1, 8, 'M_CL_01', 'Check List Master', 1, '/masters/qms/checklist/master', 'IconListCheck'),

-- 1.2.2 Audit
(1, 9, 'M_AU_01', 'Audit Type', 1, '/masters/qms/audit/type', 'IconSearch'),
(1, 9, 'M_AU_02', 'Audit Area / Zone', 1, '/masters/qms/audit/area', 'IconMapPin'),
(1, 9, 'M_AU_03', 'Audit Criteria', 1, '/masters/qms/audit/criteria', 'IconClipboardCheck'),

-- 1.2.3 Meeting
(1, 10, 'M_MT_01', 'Meeting Master', 1, '/masters/qms/meeting/master', 'IconMessages'),

-- 1.3.1 Product
(1, 11, 'M_PD_01', 'Product Item Type', 1, '/masters/npd/product/type', 'IconCategory'),
(1, 11, 'M_PD_02', 'Product Item Sub Type', 1, '/masters/npd/product/subtype', 'IconSubcategory'),
(1, 11, 'M_PD_03', 'Product OEM Master', 1, '/masters/npd/product/oem', 'IconBuildingFactory'),
(1, 11, 'M_PD_04', 'Product OEM Mapping', 1, '/masters/npd/product/oem-mapping', 'IconGitBranch'),
(1, 11, 'M_PD_05', 'Product Model Master', 1, '/masters/npd/product/model', 'IconDeviceDesktop'),
(1, 11, 'M_PD_06', 'Product Capacity Master', 1, '/masters/npd/product/capacity', 'IconBolt'),

-- 1.4.1 CRM
(1, 12, 'M_CRM_01', 'Customer Satisfaction Criteria', 1, '/masters/sales/crm/satisfaction', 'IconMoodSmile'),
(1, 12, 'M_CRM_02', 'Contact Master', 1, '/masters/sales/crm/contact-master', 'IconPhone'),
(1, 12, 'M_CRM_03', 'Customer Master', 1, '/masters/sales/crm/customer-master', 'IconUsers'),
(1, 12, 'M_CRM_04', 'Customer Potential', 1, '/masters/sales/crm/potential', 'IconChartBar'),

-- 1.4.2 Terms & Logistics
(1, 13, 'M_LOG_01', 'Payment Terms', 1, '/masters/sales/logistics/payment-terms', 'IconCreditCard'),
(1, 13, 'M_LOG_02', 'Delivery Terms', 1, '/masters/sales/logistics/delivery-terms', 'IconTruckDelivery'),
(1, 13, 'M_LOG_03', 'Currency', 1, '/masters/sales/logistics/currency', 'IconCoin'),
(1, 13, 'M_LOG_04', 'Unit of Measurement', 1, '/masters/sales/logistics/uom', 'IconRuler2'),
(1, 13, 'M_LOG_05', 'Country Master', 1, '/masters/sales/logistics/country', 'IconWorld'),
(1, 13, 'M_LOG_06', 'State Master', 1, '/masters/sales/logistics/state', 'IconMap'),
(1, 13, 'M_LOG_07', 'Segment', 1, '/masters/sales/logistics/segment', 'IconChartPie'),
(1, 13, 'M_LOG_08', 'Sub Segment', 1, '/masters/sales/logistics/subsegment', 'IconChartDonut'),
(1, 13, 'M_LOG_09', 'Mode of Despatch', 1, '/masters/sales/logistics/despatch-mode', 'IconPlaneTilt'),
(1, 13, 'M_LOG_10', 'Freight', 1, '/masters/sales/logistics/freight', 'IconTractor');
GO

-- 6. Grant Access to All Users
INSERT INTO bos_user_page_auth (user_id, page_id, sub_mod_id, mod_id, enable, read_acs, [write], delete_acs, export, approval, manager, additional1, additional2)
SELECT 
    u.user_id, 
    p.page_id, 
    p.sub_mod_id, 
    p.mod_id, 
    1, 1, 1, 1, 1, 1, 1, 1, 1
FROM bos_pages p
CROSS JOIN ad_user_credential u;
GO
