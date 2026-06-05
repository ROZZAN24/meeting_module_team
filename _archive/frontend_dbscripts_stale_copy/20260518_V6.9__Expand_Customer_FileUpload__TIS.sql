-- V3.6 EXPAND FILE UPLOAD COLUMN LENGTH
-- Increases the length of file_upload in SM_CUSTOMER_MASTER and SM_CONTACT_MASTER to support multiple attachments.

ALTER TABLE [dbo].[SM_CUSTOMER_MASTER] ALTER COLUMN [file_upload] NVARCHAR(2000);
ALTER TABLE [dbo].[SM_CONTACT_MASTER] ALTER COLUMN [file_upload] NVARCHAR(2000);
