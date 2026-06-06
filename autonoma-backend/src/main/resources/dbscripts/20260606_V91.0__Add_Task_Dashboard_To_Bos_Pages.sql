-- Register Task Dashboard page in bos_pages

SET IDENTITY_INSERT bos_pages ON;

IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'DB1160')
BEGIN
    INSERT INTO bos_pages 
        (page_id, mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon) 
    VALUES 
        (111, 15, 151, 'DB1160', 'Task Dashboard', 1, NULL, NULL);
END

SET IDENTITY_INSERT bos_pages OFF;
