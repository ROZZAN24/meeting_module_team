-- Flyway migration to add missing page_id columns
-- Version: V20260527__add_missing_page_id.sql

ALTER TABLE ticket_tracability_center ADD page_id BIGINT NULL;
ALTER TABLE file_traceability_management ADD page_id BIGINT NULL;
-- Add other tables if needed
