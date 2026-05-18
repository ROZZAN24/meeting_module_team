import pymssql

try:
    conn = pymssql.connect(
        server='localhost',
        port=1433,
        user='nutech',
        password='nutech@2026',
        database='AUTONOMA'
    )
    cursor = conn.cursor()
    
    print("=== Table: sm_segment ===")
    cursor.execute("SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sm_segment'")
    for row in cursor.fetchall():
        print(row)
        
    print("\n=== Table: hrm_employee_asset ===")
    cursor.execute("SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'hrm_employee_asset'")
    for row in cursor.fetchall():
        print(row)
        
    conn.close()
except Exception as e:
    print("Error:", e)
