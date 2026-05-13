-- V4.0 Add NCR No to Observation Details
USE [AUTONOMA];

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'ncr_no')
BEGIN
    ALTER TABLE [dbo].[audit_observation_details] ADD [ncr_no] NVARCHAR(50);
END
