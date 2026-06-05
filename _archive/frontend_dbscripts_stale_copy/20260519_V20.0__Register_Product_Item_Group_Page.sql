-- 20260519_V20.0__Register_Product_Item_Group_Page.sql

-- 1. Register HRA Induction Submodule under HRA Module (Mod ID 30) if not exists
SET IDENTITY_INSERT bos_sub_modules ON;
IF NOT EXISTS (SELECT 1 FROM bos_sub_modules WHERE sub_mod_id = 302)
BEGIN
    INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon)
    VALUES (302, 30, NULL, 'HRA_IND', 'Induction', 'IconUserCheck');
END
SET IDENTITY_INSERT bos_sub_modules OFF;

-- 2. Register the 5 new pages in bos_pages if not exists
-- Induction Criteria (Masters -> ATS)
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'HR_ATS_01')
BEGIN
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (1, 5, 'HR_ATS_01', 'INDUCTION CRITERIA', 1, '/master/hr/ats/induction-criteria', 'IconUserPlus');
END

-- Induction Pending (HRA -> Induction)
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'HRA_IND_01')
BEGIN
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (30, 302, 'HRA_IND_01', 'INDUCTION PENDING', 1, '/master/hr/ats/induction-assignment', 'IconCalendarEvent');
END

-- Induction Training (HRA -> Induction)
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'HRA_IND_02')
BEGIN
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (30, 302, 'HRA_IND_02', 'INDUCTION TRAINING', 1, '/master/hr/ats/induction-training', 'IconClipboardCheck');
END

-- Induction Trainee (HRA -> Induction)
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'HRA_IND_03')
BEGIN
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (30, 302, 'HRA_IND_03', 'INDUCTION TRAINEE', 1, '/master/hr/ats/induction-trainee', 'IconUserCheck');
END

-- Product Item Group (Masters -> Product)
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'M3110')
BEGIN
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (1, 11, 'M3110', 'PRODUCT ITEM GROUP', 1, '/master/npd/product-group', 'IconCategory');
END

-- 3. Grant Default Administrator and User Authorizations for the new pages
INSERT INTO bos_user_page_auth (user_id, page_id, sub_mod_id, mod_id, enable, read_acs, [write], delete_acs, export, approval, manager, additional1, additional2)
SELECT 
    u.user_id, 
    p.page_id, 
    p.sub_mod_id, 
    p.mod_id, 
    1, 1, 1, 1, 1, 1, 1, 1, 1
FROM bos_pages p
CROSS JOIN ad_user_credential u
WHERE p.page_code IN ('HR_ATS_01', 'HRA_IND_01', 'HRA_IND_02', 'HRA_IND_03', 'M3110')
  AND NOT EXISTS (
      SELECT 1 FROM bos_user_page_auth a 
      WHERE a.user_id = u.user_id AND a.page_id = p.page_id
  );
