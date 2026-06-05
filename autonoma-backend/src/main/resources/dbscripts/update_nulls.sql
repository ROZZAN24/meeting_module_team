DECLARE @Sql NVARCHAR(MAX) = '';

SELECT @Sql = @Sql + 
    'UPDATE ' + TABLE_NAME + ' SET CREATED_BY = ''admin'' WHERE CREATED_BY IS NULL;' + CHAR(13) + CHAR(10)
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME = 'CREATED_BY';

IF LEN(@Sql) > 0
BEGIN
    EXEC sp_executesql @Sql;
    SELECT 'All tables updated successfully' AS Message;
END
ELSE
BEGIN
    SELECT 'No tables found with CREATED_BY column' AS Message;
END
