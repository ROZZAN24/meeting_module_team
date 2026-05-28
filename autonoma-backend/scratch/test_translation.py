import re

def translate_sql_for_h2(sql):
    # Remove SQL comments
    sql = re.sub(r'--.*?\n', '\n', sql)
    sql = re.sub(r'/\*.*?\*/', '', sql, flags=re.DOTALL)
    
    # Normalize whitespaces
    sql = re.sub(r'\s+', ' ', sql).strip()
    
    # 2. Translate table creation:
    sql = re.sub(
        r"(?i)IF\s+NOT\s+EXISTS\s*\(\s*SELECT\s+\*\s+FROM\s+sys\.objects\s+WHERE\s+object_id\s*=\s*OBJECT_ID\(N'\[dbo\]\.\[([a-zA-Z0-9_]+)\]'\)\s+AND\s+type\s+in\s+\(N'U'\)\s*\)\s*BEGIN\s*CREATE\s+TABLE\s+(\[dbo\]\.)?\[\1\]\s*\((.*?)\)\s*;?\s*END",
        r"CREATE TABLE IF NOT EXISTS \2[\1] (\3);",
        sql
    )

    # 3. Translate IF EXISTS (...) BEGIN DROP TABLE ... END -> DROP TABLE IF EXISTS ...
    sql = re.sub(
        r"(?i)IF\s+EXISTS\s*\(\s*SELECT\s+\*\s+FROM\s+sys\.objects\s+WHERE\s+object_id\s*=\s*OBJECT_ID\(N'\[dbo\]\.\[([a-zA-Z0-9_]+)\]'\)\s+AND\s+type\s+in\s+\(N'U'\)\s*\)\s*BEGIN\s*DROP\s+TABLE\s+(\[dbo\]\.)?\[\1\]\s*;?\s*END",
        r"DROP TABLE IF EXISTS \2[\1];",
        sql
    )

    # 4. Translate column checks (ADD COLUMN):
    sql = re.sub(
        r"(?i)IF\s+NOT\s+EXISTS\s*\(\s*SELECT\s+\*\s+FROM\s+sys\.columns\s+WHERE\s+object_id\s*=\s*OBJECT_ID\(N'\[dbo\]\.\[([a-zA-Z0-9_]+)\]'\)\s+AND\s+name\s*=\s*N?'([a-zA-Z0-9_]+)'\s*\)\s*BEGIN\s*ALTER\s+TABLE\s+(\[dbo\]\.)?\[\1\]\s+ADD\s+\[\2\]\s+(.*?)\s*;?\s*END",
        r"ALTER TABLE \3[\1] ADD COLUMN IF NOT EXISTS [\2] \4;",
        sql
    )

    # 4b. Translate column checks (ALTER/DROP COLUMN):
    sql = re.sub(
        r"(?i)IF\s+EXISTS\s*\(\s*SELECT\s+\*\s+FROM\s+sys\.columns\s+WHERE\s+object_id\s*=\s*OBJECT_ID\(N'\[dbo\]\.\[([a-zA-Z0-9_]+)\]'\)\s+AND\s+name\s*=\s*N?'([a-zA-Z0-9_]+)'\s*\)\s*BEGIN\s*(ALTER\s+TABLE\s+.*?);\s*END",
        r"\3;",
        sql
    )

    # 5. Translate constraint drops:
    sql = re.sub(
        r"(?i)IF\s+EXISTS\s*\(\s*SELECT\s+\*\s+FROM\s+sys\.foreign_keys\s+WHERE\s+name\s*=\s*'([a-zA-Z0-9_]+)'\s*\)\s*BEGIN\s*ALTER\s+TABLE\s+(\[dbo\]\.)?\[([a-zA-Z0-9_]+)\]\s+DROP\s+CONSTRAINT\s+\[\1\]\s*;?\s*END",
        r"ALTER TABLE \2[\3] DROP CONSTRAINT IF EXISTS [\1];",
        sql
    )

    # 6. Translate constraint creations:
    sql = re.sub(
        r"(?i)IF\s+NOT\s+EXISTS\s*\(\s*SELECT\s+\*\s+FROM\s+sys\.foreign_keys\s+WHERE\s+name\s*=\s*'([a-zA-Z0-9_]+)'\s*\)\s*BEGIN\s*ALTER\s+TABLE\s+(\[dbo\]\.)?\[([a-zA-Z0-9_]+)\]\s+ADD\s+CONSTRAINT\s+\[\1\]\s+(.*?)\s*;?\s*END",
        r"ALTER TABLE \2[\3] ADD CONSTRAINT IF NOT EXISTS [\1] \4;",
        sql
    )

    # 7. Clean up nested IF EXISTS for QMS_CHECKLIST_DEPARTMENT check in V3.2
    sql = re.sub(
        r"(?i)IF\s+EXISTS\s*\(\s*SELECT\s+\*\s+FROM\s+sys\.objects\s+WHERE\s+object_id\s*=\s*OBJECT_ID\(N'\[dbo\]\.\[([a-zA-Z0-9_]+)\]'\)\s+AND\s+type\s*=\s*'U'\s*\)\s*BEGIN\s*(ALTER\s+TABLE\s+.*?);\s*END",
        r"\2;",
        sql
    )

    # Clean up [dbo]. prefix and brackets
    sql = sql.replace("[dbo].", "")
    sql = sql.replace("[", "").replace("]", "")
    
    return sql

with open("../src/main/resources/dbscripts/20260512_V2.7__Make_Employee_Fields_Nullable.sql", "r") as f:
    original = f.read()

translated = translate_sql_for_h2(original)
print("=== TRANSLATED V2.7 SQL (NORMALIZED) ===")
print(translated)
