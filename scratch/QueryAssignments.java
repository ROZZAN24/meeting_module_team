package scratch;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;

public class QueryAssignments {
    public static void main(String[] args) {
        String dbUrl = "jdbc:sqlserver://localhost:1433;databaseName=AUTONOMA;trustServerCertificate=true";
        String user = "nutech";
        String pass = "nutech@2026";
        
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
            try (Connection conn = DriverManager.getConnection(dbUrl, user, pass);
                 Statement stmt = conn.createStatement()) {
                System.out.println("Connected to SQL Server successfully.");
                
                System.out.println("--- USERS ---");
                try (ResultSet rs = stmt.executeQuery("SELECT USER_ID, EMP_ID, STATUS FROM AD_USER_CREDENTIAL")) {
                    while (rs.next()) {
                        System.out.println(rs.getString("USER_ID") + "\t" + rs.getString("EMP_ID") + "\t" + rs.getString("STATUS"));
                    }
                }
                
                System.out.println("--- EMPLOYEES ---");
                try (ResultSet rs = stmt.executeQuery("SELECT ID, employee_name, status FROM HR_EMPLOYEE_MASTER")) {
                    while (rs.next()) {
                        System.out.println(rs.getString("ID") + "\t" + rs.getString("employee_name") + "\t" + rs.getString("status"));
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
