package scratch;

import java.sql.*;

public class QueryRDS {
    public static void main(String[] args) {
        String url = "jdbc:sqlserver://autonoma-db.c274kqgw8lfr.us-east-1.rds.amazonaws.com:1433;databaseName=AUTONOMA;trustServerCertificate=true;encrypt=true";
        String user = "sa";
        String pass = "Eashwar2005";

        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
            try (Connection conn = DriverManager.getConnection(url, user, pass);
                 Statement stmt = conn.createStatement()) {
                System.out.println("Connected to SQL Server RDS successfully.");

                System.out.println("\n=== HR_INDUCTION_ASSIGNMENT ===");
                String query = "SELECT id, emp_code, emp_name, induction_round, screening_level, trainer_name, trainer_emp_code, current_status, induction_status FROM HR_INDUCTION_ASSIGNMENT";
                try (ResultSet rs = stmt.executeQuery(query)) {
                    System.out.printf("%-5s | %-10s | %-20s | %-10s | %-15s | %-20s | %-15s | %-15s | %-15s\n",
                        "ID", "EmpCode", "EmpName", "Round", "ScreeningLvl", "TrainerName", "TrainerCode", "CurrentStatus", "InductionStatus");
                    System.out.println("--------------------------------------------------------------------------------------------------------------------------------------------");
                    while (rs.next()) {
                        System.out.printf("%-5d | %-10s | %-20s | %-10s | %-15s | %-20s | %-15s | %-15s | %-15s\n",
                            rs.getLong("id"),
                            rs.getString("emp_code"),
                            rs.getString("emp_name"),
                            rs.getString("induction_round"),
                            rs.getString("screening_level"),
                            rs.getString("trainer_name"),
                            rs.getString("trainer_emp_code"),
                            rs.getString("current_status"),
                            rs.getString("induction_status")
                        );
                    }
                }

                System.out.println("\n=== EMPLOYEE ONBOARDING STATUS ===");
                String empQuery = "SELECT emp_code, employee_name, status, induction_status FROM HR_EMPLOYEE WHERE induction_status IS NOT NULL OR emp_code IN ('EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-006')";
                try (ResultSet rs = stmt.executeQuery(empQuery)) {
                    System.out.printf("%-10s | %-25s | %-15s | %-15s\n", "EmpCode", "EmployeeName", "Status", "InductionStatus");
                    System.out.println("-------------------------------------------------------------------------------");
                    while (rs.next()) {
                        System.out.printf("%-10s | %-25s | %-15s | %-15s\n",
                            rs.getString("emp_code"),
                            rs.getString("employee_name"),
                            rs.getString("status"),
                            rs.getString("induction_status")
                        );
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
