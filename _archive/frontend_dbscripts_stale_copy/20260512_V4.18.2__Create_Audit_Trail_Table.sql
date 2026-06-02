-- V4.18 Create Global Audit Trail Table
USE [AUTONOMA];

CREATE TABLE ad_audit_trail (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id NVARCHAR(100),
    page_name NVARCHAR(255),
    action_type NVARCHAR(50), -- INSERT, UPDATE, DELETE
    table_name NVARCHAR(255),
    record_id NVARCHAR(100),
    previous_value NVARCHAR(MAX),
    current_value NVARCHAR(MAX),
    comments NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);

-- Index for performance
CREATE INDEX IDX_AUDIT_TRAIL_USER ON ad_audit_trail(user_id);
CREATE INDEX IDX_AUDIT_TRAIL_TABLE ON ad_audit_trail(table_name);
CREATE INDEX IDX_AUDIT_TRAIL_DATE ON ad_audit_trail(created_at DESC);
