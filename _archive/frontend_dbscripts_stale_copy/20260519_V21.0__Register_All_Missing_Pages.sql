-- 20260519_V21.0__Register_All_Missing_Pages.sql
-- Phase 1: Register all 19 missing pages in bos_pages and grant default access to all users.
-- This ensures every sidebar page appears in the User Access matrix.

-- ============================================================================
-- 1. REGISTER NEW MODULE: ADMIN (mod_id=70)
-- ============================================================================
SET IDENTITY_INSERT bos_modules ON;
IF NOT EXISTS (SELECT 1 FROM bos_modules WHERE module_id = 70)
BEGIN
    INSERT INTO bos_modules (module_id, mod_code, mod_name, icon)
    VALUES (70, 'ADMIN', 'Admin', 'IconShieldLock');
END
SET IDENTITY_INSERT bos_modules OFF;

-- ============================================================================
-- 2. REGISTER NEW SUB-MODULES
-- ============================================================================
SET IDENTITY_INSERT bos_sub_modules ON;

-- Vendor sub-module under Masters (mod_id=1)
IF NOT EXISTS (SELECT 1 FROM bos_sub_modules WHERE sub_mod_id = 14)
BEGIN
    INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon)
    VALUES (14, 1, 4, 'VENDOR', 'Vendor', 'IconTruckDelivery');
END

-- Admin Hub sub-module under Admin (mod_id=70)
IF NOT EXISTS (SELECT 1 FROM bos_sub_modules WHERE sub_mod_id = 701)
BEGIN
    INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon)
    VALUES (701, 70, NULL, 'AD_HUB', 'Admin Hub', 'IconCategory');
END

-- BOS Admin sub-module under Admin (mod_id=70)
IF NOT EXISTS (SELECT 1 FROM bos_sub_modules WHERE sub_mod_id = 702)
BEGIN
    INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon)
    VALUES (702, 70, NULL, 'AD_BOS', 'BOS(S) Admin', 'IconUserShield');
END

SET IDENTITY_INSERT bos_sub_modules OFF;

-- ============================================================================
-- 3. REGISTER ALL 19 MISSING PAGES
-- ============================================================================

-- 3.1 Masters > ATS: Induction Pending, Training, Trainee (3 pages)
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'M2150')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (1, 5, 'M2150', 'INDUCTION PENDING', 1, '/master/hr/ats/induction-assignment', 'IconCalendarEvent');

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'M2160')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (1, 5, 'M2160', 'INDUCTION TRAINING', 1, '/master/hr/ats/induction-training', 'IconClipboardCheck');

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'M2170')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (1, 5, 'M2170', 'INDUCTION TRAINEE', 1, '/master/hr/ats/induction-trainee', 'IconUserCheck');

-- 3.2 Masters > Employee: Grade (1 page)
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'M2260')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (1, 6, 'M2260', 'GRADE', 1, '/master/hr/grade', 'IconAward');

-- 3.3 Masters > Product: Item Group + Wind Farm (2 pages)
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'M3110')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (1, 11, 'M3110', 'PRODUCT ITEM GROUP', 1, '/master/npd/product-group', 'IconCategory');

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'M3210')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (1, 11, 'M3210', 'WIND FARM MASTER', 1, '/master/npd/wind-farm', 'IconRocket');

-- 3.4 Masters > Vendor: Supplier + Sub Contractor (2 pages)
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'M4110')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (1, 14, 'M4110', 'SUPPLIER MASTER', 1, '/sm/suppliers', 'IconTruckDelivery');

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'M4210')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (1, 14, 'M4210', 'SUB CONTRACTOR', 1, '/sm/sub-contractors', 'IconTool');

-- 3.5 Admin Hub pages (7 pages)
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'AD1110')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (70, 701, 'AD1110', 'COMPANY PROFILE', 1, '/admin/company-profile', 'IconBuildingSkyscraper');

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'AD1120')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (70, 701, 'AD1120', 'DIVISION MASTER', 1, '/admin/division', 'IconLayoutColumns');

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'AD1130')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (70, 701, 'AD1130', 'USER CREDENTIALS', 1, '/admin/user-credentials', 'IconUsers');

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'AD1140')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (70, 701, 'AD1140', 'USER ACCESS', 1, '/admin/user-access', 'IconFingerprint');

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'AD1150')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (70, 701, 'AD1150', 'AUDIT TRAIL', 1, '/admin/audit-trail', 'IconHistory');

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'AD1160')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (70, 701, 'AD1160', 'USER SESSION ANALYTICS', 1, '/admin/session-analytics', 'IconTimeline');

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'AD1170')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (70, 701, 'AD1170', 'FILE TRACEABILITY HUB', 1, '/admin/file-traceability-hub', 'IconFileAnalytics');

-- 3.6 BOS Admin pages (4 pages)
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'AD1210')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (70, 702, 'AD1210', 'BUSINESS AUTHORIZATION', 1, '/admin/business-authorization', 'IconShieldLock');

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'AD1220')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (70, 702, 'AD1220', 'APP PREFERENCE', 1, '/admin/preference-master', 'IconSettings');

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'AD1230')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (70, 702, 'AD1230', 'PREFIX/SUFFIX CREDENTIALS', 1, '/admin/prefix-credentials', 'IconSettings');

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'AD1240')
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (70, 702, 'AD1240', 'SESSION MONITORING', 1, '/admin/session-monitoring', 'IconActivity');

-- ============================================================================
-- 4. GRANT DEFAULT FULL ACCESS TO ALL EXISTING USERS FOR NEW PAGES
-- ============================================================================
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
