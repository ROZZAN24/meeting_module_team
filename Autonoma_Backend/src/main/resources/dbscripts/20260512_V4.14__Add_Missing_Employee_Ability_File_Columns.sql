-- V4.14__Add_Missing_Employee_Ability_File_Columns
ALTER TABLE [dbo].[hrm_employee_master] ADD 
    [chaired_file_info] NVARCHAR(MAX),
    [host_file_info] NVARCHAR(MAX),
    [participants_file_info] NVARCHAR(MAX);
