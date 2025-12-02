package com.ertriage.dao;

import com.ertriage.model.AuditLog;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

public class AuditLogDAO {

    private Connection getConnection() throws SQLException {
        String url  = "jdbc:mysql://localhost:3306/er_triage_db";
        String user = "root";      // same as MainDemo
        String pass = "Yaznbash2002@";  // same as MainDemo
        return DriverManager.getConnection(url, user, pass);
    }

    // 7.9.1 save()
    public void save(AuditLog log) {
        String sql = """
            INSERT INTO audit_log (patient_id, actor, action, details)
            VALUES (?, ?, ?, ?)
            """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            // ensure actor is never null
            String actorValue = (log.actor == null || log.actor.isBlank())
                    ? "SYSTEM"
                    : log.actor;

            ps.setLong(1, log.patientId);
            ps.setString(2, actorValue);         // <-- safe actor value
            ps.setString(3, log.action);
            ps.setString(4, log.detailsJson);

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    log.id = rs.getLong(1);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error saving audit log", e);
        }
    }

    // 7.9.2 findByPatient()
    public List<AuditLog> findByPatient(long patientId) {
        List<AuditLog> result = new ArrayList<>();

        String sql = """
            SELECT id, patient_id, actor, action, details, created_at
            FROM audit_log
            WHERE patient_id = ?
            ORDER BY created_at
            """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, patientId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    AuditLog log = new AuditLog();
                    log.id = rs.getLong("id");
                    log.patientId = rs.getLong("patient_id");
                    log.actor = rs.getString("actor");
                    log.action = rs.getString("action");
                    log.detailsJson = rs.getString("details");

                    Timestamp ts = rs.getTimestamp("created_at");
                    if (ts != null) {
                        log.createdAt = LocalDateTime.ofInstant(
                                ts.toInstant(), ZoneId.systemDefault());
                    }

                    result.add(log);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error loading audit logs for patientId=" + patientId, e);
        }

        return result;
    }
}