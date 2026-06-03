import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDB {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:sqlserver://localhost:1433;databaseName=AUTONOMA;trustServerCertificate=true;sendStringParametersAsUnicode=true;responseBuffering=adaptive";
        try (Connection conn = DriverManager.getConnection(url, "nutech", "nutech@2026");
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT USER_ID FROM AD_USER_CREDENTIAL")) {
            while (rs.next()) {
                System.out.println("USER_ID: " + rs.getString("USER_ID"));
            }
        }
    }
}
