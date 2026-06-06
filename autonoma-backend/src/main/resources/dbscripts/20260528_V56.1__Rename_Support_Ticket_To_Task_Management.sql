-- 1. Rename the sub-module in BOS_SUB_MODULES
UPDATE bos_sub_modules
SET sub_mod_name = 'Task Management'
WHERE mod_id = 13 AND sub_mod_code = 'S1100';

-- 2. Update the existing 'Support Ticket' page to 'Raised By Me'
UPDATE bos_pages
SET page_name = 'Raised By Me',
    page_url = '/support/ticket-by-me'
WHERE page_code = 'S1110';

-- 3. Insert the new 'Raised For Me' page if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'S1120')
BEGIN
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (13, 131, 'S1120', 'Raised For Me', 1, '/support/raised-for-me', 'IconHelp');
END

-- 4. Grant access to the new page for all existing users
INSERT INTO bos_user_page_auth (user_id, page_id, sub_mod_id, mod_id, enable, read_acs, [write], delete_acs, export, approval, manager, additional1, additional2)
SELECT 
    u.user_id, 
    p.page_id, 
    p.sub_mod_id, 
    p.mod_id, 
    1, 1, 1, 1, 1, 1, 1, 1, 1
FROM bos_pages p
CROSS JOIN ad_user_credential u
WHERE p.page_code = 'S1120'
  AND NOT EXISTS (
      SELECT 1 FROM bos_user_page_auth a 
      WHERE a.user_id = u.user_id AND a.page_id = p.page_id
  );
