import java.sql.*;

public class Inspect {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:sqlserver://autonoma-db.c274kqgw8lfr.us-east-1.rds.amazonaws.com:1433;databaseName=AUTONOMA;trustServerCertificate=true;encrypt=true";
        String user = "sa";
        String password = "Eashwar2005";
        
        try (Connection con = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connection successful!");
            DatabaseMetaData meta = con.getMetaData();
            System.out.println("Columns in QMS_AUDIT_SCHEDULE_CRITERIA:");
            try (ResultSet rs = meta.getColumns(null, null, "QMS_AUDIT_SCHEDULE_CRITERIA", null)) {
                boolean found = false;
                while (rs.next()) {
                    found = true;
                    System.out.println("- " + rs.getString("COLUMN_NAME") + " (" + rs.getString("TYPE_NAME") + ")");
                }
                if (!found) {
                    System.out.println("Table not found (or no columns) with uppercase name. Checking lowercase...");
                    try (ResultSet rs2 = meta.getColumns(null, null, "audit_schedule_criteria", null)) {
                        while (rs2.next()) {
                            System.out.println("- " + rs2.getString("COLUMN_NAME") + " (" + rs2.getString("TYPE_NAME") + ")");
                        }
                    }
                }
            }
        }
    }
}
