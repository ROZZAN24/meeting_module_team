-- Professionalize existing Department Numbers
-- This script re-formats existing numeric dept_no values into the DEPT-001 format
-- It uses a ROW_NUMBER() to ensure a clean sequence starting from 001

-- 1. Create a temporary mapping of IDs to their new professional codes
WITH DeptMapping AS (
    SELECT 
        id,
        'DEPT-' + RIGHT('000' + CAST(ROW_NUMBER() OVER (ORDER BY id) AS NVARCHAR(10)), 3) as new_code
    FROM hrm_department_master
)
-- 2. Update the main table
UPDATE d
SET d.dept_no = m.new_code
FROM hrm_department_master d
JOIN DeptMapping m ON d.id = m.id;
GO
