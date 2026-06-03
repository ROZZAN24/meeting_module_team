import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class TestDB {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:sqlserver://localhost:1433;databaseName=AUTONOMA;trustServerCertificate=true;sendStringParametersAsUnicode=true;responseBuffering=adaptive";
        try (Connection conn = DriverManager.getConnection(url, "nutech", "nutech@2026");
             Statement stmt = conn.createStatement()) {
            
            String dropFunc = "IF OBJECT_ID('dbo.InitCap', 'FN') IS NOT NULL DROP FUNCTION dbo.InitCap";
            stmt.execute(dropFunc);

            String createFunc = "CREATE FUNCTION dbo.InitCap(@String VARCHAR(MAX)) " +
                                "RETURNS VARCHAR(MAX) " +
                                "AS " +
                                "BEGIN " +
                                "  DECLARE @Index INT, @Char CHAR(1), @PrevChar CHAR(1), @Output VARCHAR(MAX); " +
                                "  SET @Output = LOWER(@String); " +
                                "  SET @Index = 1; " +
                                "  SET @PrevChar = ' '; " +
                                "  WHILE @Index <= LEN(@String) " +
                                "  BEGIN " +
                                "    SET @Char = SUBSTRING(@String, @Index, 1); " +
                                "    IF @PrevChar IN (' ', ';', ':', '!', '?', ',', '.', '_', '-', '/', '&', '''', '(') " +
                                "    BEGIN " +
                                "      IF @Char != ' ' SET @Output = STUFF(@Output, @Index, 1, UPPER(@Char)); " +
                                "    END " +
                                "    SET @PrevChar = @Char; " +
                                "    SET @Index = @Index + 1; " +
                                "  END " +
                                "  RETURN @Output; " +
                                "END";
            stmt.execute(createFunc);
            System.out.println("Function created.");
        }
    }
}
