-- Remove Sub Contractor Master page authorization bindings
DELETE FROM bos_user_page_auth 
WHERE page_id IN (SELECT page_id FROM bos_pages WHERE page_code = 'M4210');

-- Remove Sub Contractor page registration
DELETE FROM bos_pages WHERE page_code = 'M4210';

-- Drop the Sub Contractor Master tables if they exist
IF OBJECT_ID('SM_SUBCONTRACTOR_MASTER', 'U') IS NOT NULL DROP TABLE SM_SUBCONTRACTOR_MASTER;
IF OBJECT_ID('sm_subcontractor_master', 'U') IS NOT NULL DROP TABLE sm_subcontractor_master;
GO
