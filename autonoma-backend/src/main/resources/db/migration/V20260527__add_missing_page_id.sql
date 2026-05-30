-- Flyway migration to add missing page_id columns safely
-- Version: V20260527__add_missing_page_id.sql

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ticket_tracability_center]') AND name = 'page_id')
BEGIN
    ALTER TABLE ticket_tracability_center ADD page_id BIGINT NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[file_traceability_management]') AND name = 'page_id')
BEGIN
    ALTER TABLE file_traceability_management ADD page_id BIGINT NULL;
END
GO
