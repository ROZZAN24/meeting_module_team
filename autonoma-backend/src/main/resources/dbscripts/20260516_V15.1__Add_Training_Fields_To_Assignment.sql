-- 20260516_V15.1__Add_Training_Fields_To_Assignment.sql
-- Adds trainer identity + training lifecycle timestamps to assignment table

IF COL_LENGTH('hr_induction_assignment', 'trainer_emp_code') IS NULL
BEGIN
    ALTER TABLE hr_induction_assignment ADD trainer_emp_code NVARCHAR(50);
END
GO

IF COL_LENGTH('hr_induction_assignment', 'average_rating') IS NULL
BEGIN
    ALTER TABLE hr_induction_assignment ADD average_rating DECIMAL(5,2);
END
GO

IF COL_LENGTH('hr_induction_assignment', 'training_started_at') IS NULL
BEGIN
    ALTER TABLE hr_induction_assignment ADD training_started_at DATETIME;
END
GO

IF COL_LENGTH('hr_induction_assignment', 'training_completed_at') IS NULL
BEGIN
    ALTER TABLE hr_induction_assignment ADD training_completed_at DATETIME;
END
GO
