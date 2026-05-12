-- V4.5 QMS Data Consistency and Status Repair
USE [AUTONOMA];

-- 1. Ensure all Master Checklists have a valid verify_status
-- Legacy data often has NULL, which hides them from the Verification UI
UPDATE qms_checklist_master 
SET verify_status = 'Verified' 
WHERE verify_status IS NULL OR verify_status = '';

-- 2. Ensure all Master Checklists have a lifecycle status
UPDATE qms_checklist_master 
SET status = 'Active' 
WHERE status IS NULL OR status = '';

-- 3. Fix Checklist Assignments without a status
-- First, get the ID of the 'Pending' status
DECLARE @PendingStatusId INT;
SELECT @PendingStatusId = id FROM ad_status_master WHERE name = 'Pending';

IF @PendingStatusId IS NOT NULL
BEGIN
    UPDATE qms_checklist_assignment 
    SET status_id = @PendingStatusId 
    WHERE status_id IS NULL;
END

-- 4. Sync display fields for Master Checklist assignments
-- This ensures the 'assigned_to' column in the master table matches the actual assignments
UPDATE m
SET m.assign_to = (
    SELECT STRING_AGG(a.assigned_to, ', ')
    FROM qms_checklist_assignment a
    WHERE a.checklist_id = m.id
)
FROM qms_checklist_master m
WHERE EXISTS (SELECT 1 FROM qms_checklist_assignment a WHERE a.checklist_id = m.id);

-- 5. Standardize dual_check and carry_forward flags
UPDATE qms_checklist_master SET dual_check = 'NO' WHERE dual_check IS NULL OR dual_check = '';
UPDATE qms_checklist_master SET carry_forward = 'NO' WHERE carry_forward IS NULL OR carry_forward = '';
