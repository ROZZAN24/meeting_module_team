package com.autonoma.erp.scratch;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class TestTranslation {

    public static void main(String[] args) throws IOException {
        String testV1 = Files.readString(Paths.get("src/main/resources/dbscripts/20260512_V1.0__Initial_Full_Schema.sql"));
        String testV27 = Files.readString(Paths.get("src/main/resources/dbscripts/20260512_V2.7__Make_Employee_Fields_Nullable.sql"));
        String testV32 = Files.readString(Paths.get("src/main/resources/dbscripts/20260512_V3.2__Update_Checklist_FK_Cascade.sql"));

        System.out.println("=== TRANSLATING V1 ===");
        String resV1 = translateSqlForH2(testV1);
        System.out.println(resV1.substring(0, Math.min(resV1.length(), 500)));

        System.out.println("\n=== TRANSLATING V27 ===");
        String resV27 = translateSqlForH2(testV27);
        System.out.println(resV27);

        System.out.println("\n=== TRANSLATING V32 ===");
        String resV32 = translateSqlForH2(testV32);
        System.out.println(resV32);
    }

    public static String translateSqlForH2(String sql) {
        if (sql == null) {
            return null;
        }

        // Remove single line comments
        sql = sql.replaceAll("--.*?\\n", "\n");
        // Remove block comments
        sql = sql.replaceAll("(?s)/\\*.*?\\*/", "");

        // Normalize spaces
        sql = sql.replaceAll("\\s+", " ").trim();

        // 2. Translate table creation:
        sql = sql.replaceAll(
            "(?is)IF\\s+NOT\\s+EXISTS\\s*\\(\\s*SELECT\\s+\\*\\s+FROM\\s+sys\\.objects\\s+WHERE\\s+object_id\\s*=\\s*OBJECT_ID\\(N'\\[dbo\\]\\.\\[([a-zA-Z0-9_]+)\\]'\\)\\s+AND\\s+type\\s+in\\s+\\(N'U'\\)\\s*\\)\\s*BEGIN\\s*CREATE\\s+TABLE\\s+(\\[dbo\\]\\.)?\\[\\1\\]\\s*\\((.*?)\\)\\s*;?\\s*END",
            "CREATE TABLE IF NOT EXISTS $2[$1] ($3);"
        );

        // 3. Translate IF EXISTS (...) BEGIN DROP TABLE ... END -> DROP TABLE IF EXISTS ...
        sql = sql.replaceAll(
            "(?is)IF\\s+EXISTS\\s*\\(\\s*SELECT\\s+\\*\\s+FROM\\s+sys\\.objects\\s+WHERE\\s+object_id\\s*=\\s*OBJECT_ID\\(N'\\[dbo\\]\\.\\[([a-zA-Z0-9_]+)\\]'\\)\\s+AND\\s+type\\s+in\\s+\\(N'U'\\)\\s*\\)\\s*BEGIN\\s*DROP\\s+TABLE\\s+(\\[dbo\\]\\.)?\\[\\1\\]\\s*;?\\s*END",
            "DROP TABLE IF EXISTS $2[$1];"
        );

        // 4. Translate column checks (ADD COLUMN):
        sql = sql.replaceAll(
            "(?is)IF\\s+NOT\\s+EXISTS\\s*\\(\\s*SELECT\\s+\\*\\s+FROM\\s+sys\\.columns\\s+WHERE\\s+object_id\\s*=\\s*OBJECT_ID\\(N'\\[dbo\\]\\.\\[([a-zA-Z0-9_]+)\\]'\\)\\s+AND\\s+name\\s*=\\s*N?'([a-zA-Z0-9_]+)'\\s*\\)\\s*BEGIN\\s*ALTER\\s+TABLE\\s+(\\[dbo\\]\\.)?\\[\\1\\]\\s+ADD\\s+\\[\\2\\]\\s+(.*?)\\s*;?\\s*END",
            "ALTER TABLE $3[$1] ADD COLUMN IF NOT EXISTS [$2] $4;"
        );

        // 4b. Translate column checks (ALTER/DROP COLUMN):
        sql = sql.replaceAll(
            "(?is)IF\\s+EXISTS\\s*\\(\\s*SELECT\\s+\\*\\s+FROM\\s+sys\\.columns\\s+WHERE\\s+object_id\\s*=\\s*OBJECT_ID\\(N'\\[dbo\\]\\.\\[([a-zA-Z0-9_]+)\\]'\\)\\s+AND\\s+name\\s*=\\s*N?'([a-zA-Z0-9_]+)'\\s*\\)\\s*BEGIN\\s*(ALTER\\s+TABLE\\s+.*?)\\s*;?\\s*END",
            "$3;"
        );

        // 5. Translate constraint drops:
        sql = sql.replaceAll(
            "(?is)IF\\s+EXISTS\\s*\\(\\s*SELECT\\s+\\*\\s+FROM\\s+sys\\.foreign_keys\\s+WHERE\\s+name\\s*=\\s*'([a-zA-Z0-9_]+)'\\s*\\)\\s*BEGIN\\s*ALTER\\s+TABLE\\s+(\\[dbo\\]\\.)?\\[([a-zA-Z0-9_]+)\\]\\s+DROP\\s+CONSTRAINT\\s+\\[\\1\\]\\s*;?\\s*END",
            "ALTER TABLE $2[$3] DROP CONSTRAINT IF EXISTS [$1];"
        );

        // 6. Translate constraint creations:
        sql = sql.replaceAll(
            "(?is)IF\\s+NOT\\s+EXISTS\\s*\\(\\s*SELECT\\s+\\*\\s+FROM\\s+sys\\.foreign_keys\\s+WHERE\\s+name\\s*=\\s*'([a-zA-Z0-9_]+)'\\s*\\)\\s*BEGIN\\s*ALTER\\s+TABLE\\s+(\\[dbo\\]\\.)?\\[([a-zA-Z0-9_]+)\\]\\s+ADD\\s+CONSTRAINT\\s+\\[\\1\\]\\s+(.*?)\\s*;?\\s*END",
            "ALTER TABLE $2[$3] ADD CONSTRAINT IF NOT EXISTS [$1] $4;"
        );

        // 7. Clean up nested IF EXISTS for QMS_CHECKLIST_DEPARTMENT check in V3.2
        sql = sql.replaceAll(
            "(?is)IF\\s+EXISTS\\s*\\(\\s*SELECT\\s+\\*\\s+FROM\\s+sys\\.objects\\s+WHERE\\s+object_id\\s*=\\s*OBJECT_ID\\(N'\\[dbo\\]\\.\\[([a-zA-Z0-9_]+)\\]'\\)\\s+AND\\s+type\\s*=\\s*'U'\\s*\\)\\s*BEGIN\\s*(ALTER\\s+TABLE\\s+.*?)\\s*;?\\s*END",
            "$2;"
        );

        // Clean up [dbo]. prefix and brackets
        sql = sql.replace("[dbo].", "");
        sql = sql.replace("[", "").replace("]", "");

        return sql;
    }
}
