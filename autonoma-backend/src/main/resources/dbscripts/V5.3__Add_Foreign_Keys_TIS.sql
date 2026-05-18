-- V5.3 Add Foreign Keys
USE [AUTONOMA];
GO

-- Add FK from audit_schedule_criteria to audit_schedule
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_audit_schedule_criteria_audit_schedule')
BEGIN
    ALTER TABLE audit_schedule_criteria WITH NOCHECK
    ADD CONSTRAINT FK_audit_schedule_criteria_audit_schedule FOREIGN KEY (audit_schedule_id)
    REFERENCES audit_schedule(id);
END

-- Add FK from audit_observation_detail to audit_observation
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_audit_observation_detail_audit_observation')
BEGIN
    ALTER TABLE audit_observation_detail WITH NOCHECK
    ADD CONSTRAINT FK_audit_observation_detail_audit_observation FOREIGN KEY (observation_id)
    REFERENCES audit_observation(id);
END

-- Add FK from audit_observation to audit_schedule
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_audit_observation_audit_schedule')
BEGIN
    -- We need to check if there's a column for schedule id, actually audit_observation has audit_schedule_no
    -- Since it's a string, we might not be able to easily add FK to id if it stores the 'schedule_no' string instead of 'id'.
    -- We will skip this one if it's not linking directly to the primary key.
    PRINT 'Skipping FK_audit_observation_audit_schedule as it uses schedule_no string instead of id';
END

GO
