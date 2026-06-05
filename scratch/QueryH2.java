import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class QueryH2 {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:h2:file:./autonoma-backend/db/AUTONOMA;DB_CLOSE_DELAY=-1;MODE=MSSQLServer;NON_KEYWORDS=VALUE,KEY,LEVEL,USER;AUTO_SERVER=TRUE";
        Class.forName("org.h2.Driver");
        try (Connection conn = DriverManager.getConnection(url, "sa", "");
             Statement stmt = conn.createStatement()) {

            System.out.println("Connected to H2!");

            try (ResultSet rs = stmt.executeQuery(
                "SELECT id, EMP_CODE, EMP_NAME, INDUCTION_ROUND, SCREENING_LEVEL, TRAINER_NAME, TRAINER_EMP_CODE, CURRENT_STATUS, INDUCTION_STATUS FROM HR_INDUCTION_ASSIGNMENT WHERE EMP_CODE = 'EMP-006' OR EMP_NAME LIKE '%Gilgamesh%'")) {
                while (rs.next()) {
                    System.out.printf("ID: %d | TraineeCode: %s | TraineeName: %s | Round: %s | Level: %s | Trainer: %s | TrainerCode: %s | CurStatus: %s | IndStatus: %s\n",
                        rs.getLong("id"),
                        rs.getString("EMP_CODE"),
                        rs.getString("EMP_NAME"),
                        rs.getString("INDUCTION_ROUND"),
                        rs.getString("SCREENING_LEVEL"),
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
