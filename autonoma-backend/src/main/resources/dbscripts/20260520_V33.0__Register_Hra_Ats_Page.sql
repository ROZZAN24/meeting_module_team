-- 20260520_V33.0__Register_Hra_Ats_Page.sql

-- 1. Create a Sub-Module for ATS under HRA module (mod_id = 2)
SET IDENTITY_INSERT bos_sub_modules ON;
IF NOT EXISTS (SELECT 1 FROM bos_sub_modules WHERE sub_mod_id = 201)
BEGIN
    INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name, icon)
    VALUES (201, 2, NULL, 'HA1100', 'ATS', 'IconSearch');
END
SET IDENTITY_INSERT bos_sub_modules OFF;

-- 2. Register ATS page (pageCode = 'HA1110')
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'HA1110')
BEGIN
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (2, 201, 'HA1110', 'Application Tracking System', 1, '/hra/ats', 'IconSearch');
END

-- 3. Grant default access to all users for the new page
INSERT INTO bos_user_page_auth (user_id, page_id, sub_mod_id, mod_id, enable, read_acs, [write], delete_acs, export, approval, manager, additional1, additional2)
SELECT 
    u.user_id, 
    p.page_id, 
    p.sub_mod_id, 
    p.mod_id, 
    1, 1, 1, 1, 1, 1, 1, 1, 1
FROM bos_pages p
CROSS JOIN ad_user_credential u
WHERE p.page_code = 'HA1110'
  AND NOT EXISTS (
      SELECT 1 FROM bos_user_page_auth a 
      WHERE a.user_id = u.user_id AND a.page_id = p.page_id
  );
