import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.PreparedStatement;

public class UpdateDarshan {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:sqlserver://autonoma-db.c274kqgw8lfr.us-east-1.rds.amazonaws.com:1433;databaseName=AUTONOMA;trustServerCertificate=true;encrypt=true";
        String user = "sa";
        String password = "Eashwar2005";

        Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            System.out.println("Connected to SQL Server RDS successfully.");

            // 1. Query existing details
            System.out.println("=== Searching for Darshan ===");
            try (ResultSet rs = stmt.executeQuery(
                "SELECT EMP_CODE, EMPLOYEE_NAME, GRADE_CODE, IS_INDUCTION_ELIGIBLE, INDUCTION_STATUS, STATUS FROM HR_EMPLOYEE WHERE EMPLOYEE_NAME LIKE '%Darshan%'")) {
                boolean found = false;
                while (rs.next()) {
                    found = true;
                    System.out.printf("Found -> Code: %s | Name: %s | Grade: %s | Eligible: %s | IndStatus: %s | Status: %s\n",
                        rs.getString("EMP_CODE"), rs.getString("EMPLOYEE_NAME"), rs.getString("GRADE_CODE"),
                        rs.getString("IS_INDUCTION_ELIGIBLE"), rs.getString("INDUCTION_STATUS"), rs.getString("STATUS"));
                }
                if (!found) {
                    System.out.println("No employee named Darshan found.");
                }
            }

            // 2. Perform Update
            System.out.println("\n=== Updating Darshan's status to COMPLETED and eligible to YES ===");
            String updateSql = "UPDATE HR_EMPLOYEE SET INDUCTION_STATUS = 'COMPLETED', IS_INDUCTION_ELIGIBLE = 'YES' WHERE EMPLOYEE_NAME LIKE '%Darshan%'";
            int rowsUpdated = stmt.executeUpdate(updateSql);
            System.out.println("Rows updated: " + rowsUpdated);

            // 3. Query updated details
            System.out.println("\n=== Post-Update Details ===");
            try (ResultSet rs = stmt.executeQuery(
                "SELECT EMP_CODE, EMPLOYEE_NAME, GRADE_CODE, IS_INDUCTION_ELIGIBLE, INDUCTION_STATUS, STATUS FROM HR_EMPLOYEE WHERE EMPLOYEE_NAME LIKE '%Darshan%'")) {
                while (rs.next()) {
                    System.out.printf("Updated -> Code: %s | Name: %s | Grade: %s | Eligible: %s | IndStatus: %s | Status: %s\n",
                        rs.getString("EMP_CODE"), rs.getString("EMPLOYEE_NAME"), rs.getString("GRADE_CODE"),
                        rs.getString("IS_INDUCTION_ELIGIBLE"), rs.getString("INDUCTION_STATUS"), rs.getString("STATUS"));
                }
            }
        }
    }
}
