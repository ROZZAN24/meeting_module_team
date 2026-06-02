-- V5.2 Standardize Status Values
USE [AUTONOMA];
GO

-- Standardize status strings to UPPERCASE for consistency
UPDATE audit_schedule SET status = UPPER(status) WHERE status IS NOT NULL;
UPDATE audit_observation SET status = UPPER(status) WHERE status IS NOT NULL;
UPDATE audit_observation_detail SET ncr_status = UPPER(ncr_status) WHERE ncr_status IS NOT NULL;
UPDATE audit_observation_detail SET observation_status = UPPER(observation_status) WHERE observation_status IS NOT NULL;
UPDATE audit_observation_detail SET approval_status = UPPER(approval_status) WHERE approval_status IS NOT NULL;
UPDATE audit_attendance SET attendance_status = UPPER(attendance_status) WHERE attendance_status IS NOT NULL;
UPDATE audit_criterion SET status = UPPER(status) WHERE status IS NOT NULL;
UPDATE audit_type SET status = UPPER(status) WHERE status IS NOT NULL;
UPDATE audit_area SET status = UPPER(status) WHERE status IS NOT NULL;

GO
