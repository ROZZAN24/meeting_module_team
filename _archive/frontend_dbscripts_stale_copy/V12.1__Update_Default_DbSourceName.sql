-- Update existing company credentials to use AUTONOMA instead of BOSDBSRC
-- to align with the new default configuration and prevent connection errors
-- if the BOSDBSRC database does not exist.

UPDATE [dbo].[AD_COMPANY_CREDENTIAL]
SET [DB_SOURCE_NAME] = 'AUTONOMA'
WHERE [DB_SOURCE_NAME] = 'BOSDBSRC' OR [DB_SOURCE_NAME] IS NULL;
