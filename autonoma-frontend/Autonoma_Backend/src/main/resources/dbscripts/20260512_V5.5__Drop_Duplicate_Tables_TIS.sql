-- V5.5 Drop Duplicate Tables
USE [AUTONOMA];
GO

-- Drop Old Employee and Designation Tables
IF OBJECT_ID('EmployeeMaster', 'U') IS NOT NULL DROP TABLE EmployeeMaster;
IF OBJECT_ID('DesignationMaster', 'U') IS NOT NULL DROP TABLE DesignationMaster;
IF OBJECT_ID('designation_master', 'U') IS NOT NULL DROP TABLE designation_master;

-- Drop Duplicate Audit Tables (Plural vs Singular)
IF OBJECT_ID('audit_types', 'U') IS NOT NULL DROP TABLE audit_types;
IF OBJECT_ID('audit_areas', 'U') IS NOT NULL DROP TABLE audit_areas;
IF OBJECT_ID('audit_criteria', 'U') IS NOT NULL DROP TABLE audit_criteria;
IF OBJECT_ID('audit_schedules', 'U') IS NOT NULL DROP TABLE audit_schedules;
IF OBJECT_ID('audit_observations', 'U') IS NOT NULL DROP TABLE audit_observations;
IF OBJECT_ID('audit_observation_details', 'U') IS NOT NULL DROP TABLE audit_observation_details;

GO
