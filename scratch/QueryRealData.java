import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class QueryRealData {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:h2:file:./autonoma-backend/db/AUTONOMA;DB_CLOSE_DELAY=-1;MODE=MSSQLServer;NON_KEYWORDS=VALUE,KEY,LEVEL,USER;AUTO_SERVER=TRUE";
        Class.forName("org.h2.Driver");
        try (Connection conn = DriverManager.getConnection(url, "sa", "");
             Statement stmt = conn.createStatement()) {

            System.out.println("=== PENDING EMPLOYEES DETAILS ===");
            try (ResultSet rs = stmt.executeQuery(
                "SELECT EMP_CODE, EMPLOYEE_NAME, GRADE_CODE, STATUS, INDUCTION_STATUS FROM HR_EMPLOYEE WHERE EMP_CODE IN ('EMP-002', 'EMP-003', 'EMP-004', 'EMP-006')")) {
                while (rs.next()) {
                    System.out.printf("Code: %s | Name: %s | Grade: %s | Status: %s | InductionStatus: %s\n",
                        rs.getString("EMP_CODE"),
                        rs.getString("EMPLOYEE_NAME"),
                        rs.getString("GRADE_CODE"),
                        rs.getString("STATUS"),
                        rs.getString("INDUCTION_STATUS")
                    );
                }
            } catch (Exception e) {
                System.out.println("Error: " + e.getMessage());
            }
        }
    }
}
