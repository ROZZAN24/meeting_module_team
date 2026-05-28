IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('AD_PREFIX_CREDENTIALS') AND name = 'task_prefix'
)
BEGIN
    ALTER TABLE AD_PREFIX_CREDENTIALS
    ADD task_prefix VARCHAR(20),
        task_suffix VARCHAR(20),
        task_digit INT;
END

UPDATE AD_PREFIX_CREDENTIALS
SET task_prefix = 'INT/',
    task_suffix = '/2627',
    task_digit = 4;
