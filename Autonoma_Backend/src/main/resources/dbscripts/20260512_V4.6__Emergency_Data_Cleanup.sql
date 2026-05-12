-- V4.6 Emergency Data Cleanup (Truncate inconsistent records)
USE [AUTONOMA];

-- Disable foreign key constraints to allow truncation/deletion
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';

-- 1. QMS Checklist Module
DELETE FROM qms_checklist_verification;
DELETE FROM qms_checklist_assignment;
DELETE FROM qms_checklist_department;
DELETE FROM qms_checklist_master;

-- 2. QMS Audit Module
DELETE FROM audit_observation_detail;
DELETE FROM audit_observation;
DELETE FROM audit_schedule_criteria;
DELETE FROM audit_schedule;
DELETE FROM audit_criterion;
DELETE FROM audit_attendance;

-- 3. Reset identities
DBCC CHECKIDENT ('qms_checklist_verification', RESEED, 0);
DBCC CHECKIDENT ('qms_checklist_assignment', RESEED, 0);
DBCC CHECKIDENT ('qms_checklist_department', RESEED, 0);
DBCC CHECKIDENT ('qms_checklist_master', RESEED, 0);
DBCC CHECKIDENT ('audit_observation_detail', RESEED, 0);
DBCC CHECKIDENT ('audit_observation', RESEED, 0);
DBCC CHECKIDENT ('audit_schedule_criteria', RESEED, 0);
DBCC CHECKIDENT ('audit_schedule', RESEED, 0);
DBCC CHECKIDENT ('audit_criterion', RESEED, 0);

-- Re-enable constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
