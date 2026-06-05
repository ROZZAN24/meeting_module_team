import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DBUtil {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:sqlserver://autonoma-db.c274kqgw8lfr.us-east-1.rds.amazonaws.com:1433;databaseName=AUTONOMA;trustServerCertificate=true;encrypt=true";
        try (Connection conn = DriverManager.getConnection(url, "sa", "Eashwar2005");
             Statement stmt = conn.createStatement()) {

            System.out.println("Connected!");

            System.out.println("\n--- All Assignments ---");
            try (ResultSet rs = stmt.executeQuery(
                "SELECT id, EMP_CODE, EMP_NAME, INDUCTION_ROUND, SCREENING_LEVEL, TRAINER_NAME, TRAINER_EMP_CODE, CURRENT_STATUS, INDUCTION_STATUS FROM HR_INDUCTION_ASSIGNMENT ORDER BY id DESC")) {
                while (rs.next()) {
                    System.out.printf("ID: %d | Trainee: %s | Round: %s | Trainer: %s | TrainerCode: %s | CurStatus: %s | IndStatus: %s\n",
                        rs.getLong("id"),
                        rs.getString("EMP_NAME"),
                        rs.getString("INDUCTION_ROUND"),
                        rs.getString("TRAINER_NAME"),
                        rs.getString("TRAINER_EMP_CODE"),
                        rs.getString("CURRENT_STATUS"),
                        rs.getString("INDUCTION_STATUS")
                    );
                }
            }
        }
    }
}
