package scratch;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.io.PrintWriter;
import java.io.FileWriter;
import java.util.Set;
import java.util.HashSet;
import java.util.Arrays;

public class DbInspector {
    public static void main(String[] args) {
        String dbUrl = "jdbc:h2:file:/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend/db/AUTONOMA;MODE=MSSQLServer";
        Set<String> targetTables = new HashSet<>(Arrays.asList(
            "audit_area", "audit_attendance", "audit_criterion", "audit_observation", 
            "audit_observation_detail", "audit_schedule", "audit_schedule_criteria", "audit_type",
            "qms_checklist_assignment", "qms_checklist_department", "qms_checklist_verification", 
            "qms_checklist_master", "ncr_ofi_actions", "ncr_ofi_approval", "ncr_ofi_attachments", 
            "ncr_ofi_master", "qms_meeting_master", "qms_meeting_schedule", 
            "qms_meeting_schedule_department", "qms_meeting_schedule_participant", 
            "qms_meeting_user_attendance", "qms_model_name", "qms_mom_attendance", 
            "qms_mom_detail", "qms_mom_master", "qms_uom",
            "hr_induction_assignment", "hr_induction_master", "hr_induction_training_detail"
        ));
        
        try (Connection conn = DriverManager.getConnection(dbUrl, "sa", "");
             PrintWriter pw = new PrintWriter(new FileWriter("scratch/foreign_keys.txt"))) {
            System.out.println("Connected to H2 successfully.");
            
            for (String tbl : targetTables) {
                pw.println("Table: " + tbl);
                try (ResultSet rs = conn.getMetaData().getImportedKeys(null, null, tbl.toUpperCase())) {
                    while (rs.next()) {
                        String fkName = rs.getString("FK_NAME");
                        String pkTabName = rs.getString("PKTABLE_NAME");
                        String pkColName = rs.getString("PKCOLUMN_NAME");
                        String fkColName = rs.getString("FKCOLUMN_NAME");
                        pw.println("  FK: " + fkName + " (" + fkColName + ") -> " + pkTabName + " (" + pkColName + ")");
                    }
                }
                pw.println();
            }
            System.out.println("Done. Output written to scratch/foreign_keys.txt");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
