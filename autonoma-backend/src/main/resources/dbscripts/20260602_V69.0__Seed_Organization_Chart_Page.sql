-- V69.0 Seed Organization Chart Page

IF NOT EXISTS (SELECT 1 FROM BOS_PAGES WHERE page_code = 'AD1190')
BEGIN
    INSERT INTO BOS_PAGES (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (14, 141, 'AD1190', 'Organization Chart', 1, '/admin/organization-chart', 'IconUsers');
END
GO

-- Grant default access to all users for the new page
INSERT INTO BOS_USER_PAGE_AUTH (user_id, page_id, sub_mod_id, mod_id, enable, read_acs, [write], delete_acs, export, approval, manager, additional1, additional2)
SELECT 
    u.user_id, 
    p.page_id, 
    p.sub_mod_id, 
    p.mod_id, 
    1, 1, 1, 1, 1, 1, 1, 1, 1
FROM BOS_PAGES p
CROSS JOIN AD_USER_CREDENTIAL u
WHERE p.page_code = 'AD1190'
  AND NOT EXISTS (
      SELECT 1 FROM BOS_USER_PAGE_AUTH a 
      WHERE a.user_id = u.user_id AND a.page_id = p.page_id
  );
GO
