-- V5.4 Add Performance Indexes
USE [AUTONOMA];
GO

SET QUOTED_IDENTIFIER ON;
GO

-- Audit Schedule Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_audit_schedule_status' AND object_id = OBJECT_ID('audit_schedule'))
    CREATE INDEX IX_audit_schedule_status ON audit_schedule(status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_audit_schedule_date' AND object_id = OBJECT_ID('audit_schedule'))
    CREATE INDEX IX_audit_schedule_date ON audit_schedule(audit_date);

-- Audit Observation Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_audit_observation_status' AND object_id = OBJECT_ID('audit_observation'))
    CREATE INDEX IX_audit_observation_status ON audit_observation(status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_audit_observation_date' AND object_id = OBJECT_ID('audit_observation'))
    CREATE INDEX IX_audit_observation_date ON audit_observation(observation_date);

-- Employee Lookup Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_employee_master_empcode' AND object_id = OBJECT_ID('hrm_employee_master'))
    CREATE INDEX IX_employee_master_empcode ON hrm_employee_master(emp_code);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_employee_master_status' AND object_id = OBJECT_ID('hrm_employee_master'))
    CREATE INDEX IX_employee_master_status ON hrm_employee_master(status);

GO
