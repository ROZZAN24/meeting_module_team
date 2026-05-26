-- ALTER SCRIPT FOR qms_checklist_department Table

-- 1. Remove the department name column
ALTER TABLE qms_checklist_department 
DROP COLUMN DEPARTMENT_NAME;

-- 2. Add the department ID column (matching BIGINT type of Department ID)
ALTER TABLE qms_checklist_department 
ADD DEPARTMENT_ID BIGINT;

-- 3. Create the foreign key constraint referencing hrm_department_master
ALTER TABLE qms_checklist_department 
ADD CONSTRAINT FK_qms_checklist_department_hrm_department_master 
FOREIGN KEY (DEPARTMENT_ID) REFERENCES hrm_department_master(id)
ON DELETE CASCADE;
