-- Rename M4110 in bos_pages from 'Supplier Master' to 'Vendor Master'
UPDATE bos_pages 
SET page_name = 'Vendor Master' 
WHERE page_code = 'M4110';
GO
