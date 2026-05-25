-- V9.5__Grant_Sidebar_Access_To_All.sql

-- Grant full sidebar access to ALL users currently in the system
-- This ensures the sidebar renders regardless of whether the user is 'Admin' or 'admin' or '001'
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
