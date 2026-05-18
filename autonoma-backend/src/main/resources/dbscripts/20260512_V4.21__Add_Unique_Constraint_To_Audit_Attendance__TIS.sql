-- Migration to prevent duplicate attendance records for the same employee in the same audit schedule
-- Version: V4.21
-- Author: TIS

-- First, remove any existing duplicates to avoid constraint failure
WITH CTE AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY audit_schedule_no, employee_code 
            ORDER BY id DESC
        ) as row_num
    FROM audit_attendance
)
DELETE FROM audit_attendance 
WHERE id IN (SELECT id FROM CTE WHERE row_num > 1);

-- Add the unique constraint
ALTER TABLE audit_attendance
ADD CONSTRAINT UC_Audit_Schedule_Employee UNIQUE (audit_schedule_no, employee_code);
