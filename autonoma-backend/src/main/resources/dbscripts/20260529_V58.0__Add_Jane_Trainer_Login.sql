-- 20260529_V58.0__Add_Jane_Trainer_Login.sql
-- Create a login for Jane Trainer with access ONLY to the Induction Training page.

-- Ensure Jane Trainer exists in HR_EMPLOYEE_MASTER (if not already present)
IF NOT EXISTS (SELECT 1 FROM [dbo].[HR_EMPLOYEE_MASTER] WHERE [id] = 2 OR [employee_name] = 'Jane Trainer')
BEGIN
    SET IDENTITY_INSERT [dbo].[HR_EMPLOYEE_MASTER] ON;
    INSERT INTO [dbo].[HR_EMPLOYEE_MASTER] ([id], [emp_code], [employee_name], [status])
    VALUES (2, 'EMP-002', 'Jane Trainer', 'ACTIVE');
    SET IDENTITY_INSERT [dbo].[HR_EMPLOYEE_MASTER] OFF;
END

-- Ensure user credentials exist for Jane Trainer (password is encrypted 'jane123')
IF NOT EXISTS (SELECT 1 FROM [dbo].[AD_USER_CREDENTIAL] WHERE [user_id] = 'jane')
BEGIN
    INSERT INTO [dbo].[AD_USER_CREDENTIAL] (
        [user_id], [emp_id], [password], [created_by], [created_at], [status], [is_bos_admin], [auth_method], [auto_logout_on_face_absence]
    ) VALUES (
        'jane', 2, 'izehu8wcTqDemGHgN0mexg==', 'Admin', GETDATE(), 1, 0, 'PASSWORD', 0
    );
END

-- Ensure default company mapping for Jane Trainer
IF NOT EXISTS (SELECT 1 FROM [dbo].[AD_USER_COMPANY_MAPPING] WHERE [user_id] = 'jane')
BEGIN
    INSERT INTO [dbo].[AD_USER_COMPANY_MAPPING] ([user_id], [company_id], [created_by], [created_at])
    VALUES ('jane', 1, 'Admin', GETDATE());
END

-- Ensure default division mapping for Jane Trainer
IF NOT EXISTS (SELECT 1 FROM [dbo].[AD_USER_DIVISION_MAPPING] WHERE [user_id] = 'jane')
BEGIN
    INSERT INTO [dbo].[AD_USER_DIVISION_MAPPING] ([user_id], [division_id], [created_by], [created_at])
    VALUES ('jane', 1, 'Admin', GETDATE());
END

-- Setup page permissions (Only Induction Training - Page 113)
DELETE FROM [dbo].[BOS_USER_PAGE_AUTH] WHERE [user_id] = 'jane';

INSERT INTO [dbo].[BOS_USER_PAGE_AUTH] (
    [user_id], [page_id], [sub_mod_id], [mod_id], [enable], [read_acs], [write], [delete_acs], [export], [approval], [manager], [additional1], [additional2], [add_task_enable]
) VALUES (
    'jane', 113, 21, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0
);
