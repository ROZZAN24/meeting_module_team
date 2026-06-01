-- ALTER SCRIPT FOR qms_checklist_department Table

-- 1. Remove the department name column if exists
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('qms_checklist_department') AND name = 'DEPARTMENT_NAME')
BEGIN
    ALTER TABLE qms_checklist_department 
    DROP COLUMN DEPARTMENT_NAME;
END

-- 2. Add the department ID column if not exists (matching BIGINT type of Department ID)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('qms_checklist_department') AND name = 'DEPARTMENT_ID')
BEGIN
    ALTER TABLE qms_checklist_department 
    ADD DEPARTMENT_ID BIGINT;
END

-- 3. Create the foreign key constraint referencing hrm_department_master if not exists
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID('FK_qms_checklist_department_hrm_department_master') AND parent_object_id = OBJECT_ID('qms_checklist_department'))
BEGIN
    ALTER TABLE qms_checklist_department 
    ADD CONSTRAINT FK_qms_checklist_department_hrm_department_master 
    FOREIGN KEY (DEPARTMENT_ID) REFERENCES hrm_department_master(id)
    ON DELETE CASCADE;
END
