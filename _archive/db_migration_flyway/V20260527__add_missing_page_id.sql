-- Flyway migration to add missing page_id columns safely
-- Version: V20260527__add_missing_page_id.sql

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[TICKET_TRACEABILITY_CENTER]') AND name = 'page_id')
BEGIN
    ALTER TABLE TICKET_TRACEABILITY_CENTER ADD page_id BIGINT NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[FILE_TRACEABILITY_MANAGEMENT]') AND name = 'page_id')
BEGIN
    ALTER TABLE FILE_TRACEABILITY_MANAGEMENT ADD page_id BIGINT NULL;
END
GO
