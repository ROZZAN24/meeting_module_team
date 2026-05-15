-- V9.3__Initialize_Sidebar_Navigation_Final.sql

-- 0. Drop existing tables to ensure clean state with correct column names
IF OBJECT_ID(N'[dbo].[bos_user_page_auth]', N'U') IS NOT NULL DROP TABLE [dbo].[bos_user_page_auth];
IF OBJECT_ID(N'[dbo].[bos_pages]', N'U') IS NOT NULL DROP TABLE [dbo].[bos_pages];
IF OBJECT_ID(N'[dbo].[bos_sub_modules]', N'U') IS NOT NULL DROP TABLE [dbo].[bos_sub_modules];
IF OBJECT_ID(N'[dbo].[bos_modules]', N'U') IS NOT NULL DROP TABLE [dbo].[bos_modules];

-- 1. Create Tables with larger code columns to prevent truncation
CREATE TABLE [dbo].[bos_modules](
    [module_id] [int] IDENTITY(1,1) NOT NULL,
    [mod_code] [nvarchar](50) NULL,
    [mod_name] [nvarchar](100) NULL,
    [icon] [nvarchar](50) NULL,
    PRIMARY KEY CLUSTERED ([module_id] ASC)
);

CREATE TABLE [dbo].[bos_sub_modules](
    [sub_mod_id] [int] IDENTITY(1,1) NOT NULL,
    [mod_id] [int] NULL,
    [sub_mod_code] [nvarchar](50) NULL,
    [sub_mod_name] [nvarchar](100) NOT NULL,
    [icon] [nvarchar](50) NULL,
    PRIMARY KEY CLUSTERED ([sub_mod_id] ASC)
);

CREATE TABLE [dbo].[bos_pages](
    [page_id] [int] IDENTITY(1,1) NOT NULL,
    [mod_id] [int] NOT NULL,
    [sub_mod_id] [int] NULL,
    [page_code] [nvarchar](50) NULL,
    [page_name] [nvarchar](100) NOT NULL,
    [enabled] [int] NULL,
    [page_url] [nvarchar](255) NULL,
    [icon] [nvarchar](50) NULL,
    PRIMARY KEY CLUSTERED ([page_id] ASC)
);

CREATE TABLE [dbo].[bos_user_page_auth](
    [user_id] [nvarchar](50) NOT NULL,
    [page_id] [int] NOT NULL,
    [sub_mod_id] [int] NULL,
    [mod_id] [int] NOT NULL,
    [enable] [int] DEFAULT 1,
    [read_acs] [int] DEFAULT 0,
    [write] [int] DEFAULT 0,
    [delete_acs] [int] DEFAULT 0,
    [export] [int] DEFAULT 0,
    [approval] [int] DEFAULT 0,
    [manager] [int] DEFAULT 0,
    [additional1] [int] DEFAULT 0,
    [additional2] [int] DEFAULT 0,
    PRIMARY KEY CLUSTERED ([user_id] ASC, [page_id] ASC)
);

-- 2. Seed Modules
SET IDENTITY_INSERT bos_modules ON;
INSERT INTO bos_modules (module_id, mod_code, mod_name, icon) VALUES
(1, 'MASTERS', 'Masters', 'IconDatabase'),
(2, 'QMS', 'Quality Management Systems', 'IconShieldCheck'),
(3, 'NPD', 'Design & Development', 'IconFlask'),
(4, 'SALES', 'Sales & Marketing', 'IconShoppingCart'),
(5, 'HRM', 'Human Resources', 'IconUsers'),
(6, 'FINANCE', 'Finance', 'IconCoin'),
(7, 'OPERATIONS', 'Operations', 'IconSettings'),
(8, 'IT', 'IT Support', 'IconDeviceDesktop');
SET IDENTITY_INSERT bos_modules OFF;

-- 3. Seed Sub-Modules
SET IDENTITY_INSERT bos_sub_modules ON;
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, sub_mod_code, sub_mod_name, icon) VALUES
(1, 1, 'HR_MASTER', 'HR', 'IconUserEdit'),
(2, 1, 'QMS_MASTER', 'QMS', 'IconClipboardCheck'),
(3, 1, 'NPD_MASTER', 'NPD', 'IconPackage'),
(4, 1, 'SALES_MASTER', 'Sales', 'IconChartBar'),
(5, 5, 'ATS', 'ATS', 'IconSearch'),
(6, 5, 'EMPLOYEE', 'Employee', 'IconUser'),
(7, 5, 'PAYROLL', 'Payroll', 'IconCash'),
(8, 2, 'CHECKLIST', 'Check List', 'IconListCheck'),
(9, 2, 'AUDIT', 'Audit', 'IconSearch'),
(10, 2, 'MEETING', 'Meeting', 'IconMessages'),
(11, 3, 'PRODUCT', 'Product', 'IconBox'),
(12, 4, 'CRM', 'CRM', 'IconUserHeart'),
(13, 4, 'LOGISTICS', 'Terms & Logistics', 'IconTruck'),
(14, 1, 'DASH_MASTER', 'Dashboards', 'IconLayoutDashboard');
SET IDENTITY_INSERT bos_sub_modules OFF;

-- 4. Seed Pages (Hierarchical)
INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon) VALUES
-- Masters -> HR
(1, 1, 'M_HR_01', 'Interview Criteria Master', 1, '/masters/hr/interview-criteria', 'IconClipboardList'),
(1, 1, 'M_HR_02', 'Email Content Master', 1, '/masters/hr/email-content', 'IconMail'),
-- Masters -> QMS
(1, 2, 'M_QMS_01', 'Check List Master', 1, '/masters/qms/checklist-master', 'IconListCheck'),
-- HR -> Payroll
(5, 7, 'HR_PY_01', 'Holiday', 1, '/hr/payroll/holiday', 'IconCalendar'),
(5, 7, 'HR_PY_02', 'Bank Details', 1, '/hr/payroll/bank-details', 'IconBuildingBank'),
-- QMS -> Audit
(2, 9, 'QMS_AU_01', 'Audit Type', 1, '/qms/audit/type', 'IconSearch'),
(2, 9, 'QMS_AU_02', 'Audit Area / Zone', 1, '/qms/audit/area', 'IconMapPin'),
-- Sales -> CRM
(4, 12, 'S_CRM_01', 'Customer Master', 1, '/sales/crm/customer-master', 'IconUsers'),
(4, 12, 'S_CRM_02', 'Contact Master', 1, '/sales/crm/contact-master', 'IconPhone');

-- 5. Grant Access to Admin (user_id 'Admin')
INSERT INTO bos_user_page_auth (user_id, page_id, sub_mod_id, mod_id, enable, read_acs, [write], delete_acs, export, approval, manager, additional1, additional2)
SELECT 
    'Admin', 
    p.page_id, 
    p.sub_mod_id, 
    p.mod_id, 
    1, 1, 1, 1, 1, 1, 1, 1, 1
FROM bos_pages p;
