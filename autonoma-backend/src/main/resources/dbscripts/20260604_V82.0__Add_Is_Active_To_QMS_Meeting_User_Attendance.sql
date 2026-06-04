-- ============================================================
-- Migration: Add IS_ACTIVE column to QMS_MEETING_USER_ATTENDANCE
-- Purpose: Support isActive field in MeetingUserAttendance model
-- Date: 2026-06-04
-- ============================================================

IF OBJECT_ID('QMS_MEETING_USER_ATTENDANCE', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('QMS_MEETING_USER_ATTENDANCE', 'IS_ACTIVE') IS NULL
    BEGIN
        ALTER TABLE QMS_MEETING_USER_ATTENDANCE ADD IS_ACTIVE BIT DEFAULT 1;
    END
END
GO

-- Backfill existing records
IF OBJECT_ID('QMS_MEETING_USER_ATTENDANCE', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('QMS_MEETING_USER_ATTENDANCE', 'IS_ACTIVE') IS NOT NULL
    BEGIN
        UPDATE QMS_MEETING_USER_ATTENDANCE SET IS_ACTIVE = 1 WHERE IS_ACTIVE IS NULL;
    END
END
GO
