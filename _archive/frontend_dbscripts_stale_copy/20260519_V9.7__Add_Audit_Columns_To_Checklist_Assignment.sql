-- Add audit columns to qms_checklist_assignment table
IF OBJECT_ID('qms_checklist_assignment', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('qms_checklist_assignment') AND name = 'UPDATED_BY')
    BEGIN
        ALTER TABLE qms_checklist_assignment ADD UPDATED_BY NVARCHAR(255);
    END

    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('qms_checklist_assignment') AND name = 'UPDATED_AT')
    BEGIN
        ALTER TABLE qms_checklist_assignment ADD UPDATED_AT DATETIME;
    END
END
GO
