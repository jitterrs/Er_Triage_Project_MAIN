package com.ertriage.dao;

import com.ertriage.model.Patient;
import com.ertriage.model.Status;
import com.ertriage.model.Vitals;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PatientDAO {

    private Connection getConnection() throws SQLException {
        String url = "jdbc:mysql://localhost:3306/er_triage_db";
        String user = "root";      // TODO: change to your DB username
        String pass = "Yaznbash2002@";  // TODO: change to your DB password
        return DriverManager.getConnection(url, user, pass);
    }

    // 7.8.1 save()
public Patient save(Patient p) {
    String sql = """
        INSERT INTO patients
            (name, age, gender, symptoms,
             bp_sys, bp_dia, hr, rr, spo2, temp,
             triage_level, triage_score, red_flag, triage_reason,
             status, created_at)
        VALUES (?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, NOW())
        """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

        // Basic info
        ps.setString(1, p.name);
        ps.setInt(2, p.age);
        ps.setString(3, p.gender);
        ps.setString(4, p.symptoms);

        // Vitals (nullable)
        if (p.vitals != null) {
            ps.setObject(5, p.vitals.bpSys, Types.INTEGER);
            ps.setObject(6, p.vitals.bpDia, Types.INTEGER);
            ps.setObject(7, p.vitals.hr, Types.INTEGER);
            ps.setObject(8, p.vitals.rr, Types.INTEGER);
            ps.setObject(9, p.vitals.spo2, Types.INTEGER);
            ps.setObject(10, p.vitals.temp, Types.DOUBLE);
        } else {
            ps.setNull(5, Types.INTEGER);
            ps.setNull(6, Types.INTEGER);
            ps.setNull(7, Types.INTEGER);
            ps.setNull(8, Types.INTEGER);
            ps.setNull(9, Types.INTEGER);
            ps.setNull(10, Types.DOUBLE);
        }

        // Triage fields
        ps.setInt(11, p.triageLevel);
        ps.setInt(12, p.triageScore);
        ps.setBoolean(13, p.redFlag);
        ps.setString(14, p.triageReason);

        // Status (default to WAITING if null)
        String statusStr = (p.status != null) ? p.status.name() : Status.WAITING.name();
        ps.setString(15, statusStr);

        // Execute insert
        ps.executeUpdate();

        // Read generated ID
        try (ResultSet rs = ps.getGeneratedKeys()) {
            if (rs.next()) {
                p.id = rs.getLong(1);
            }
        }

    } catch (SQLException e) {
        throw new RuntimeException("Error saving patient", e);
    }

    return p;
}

// 7.8.2 update()
public Patient update(Patient p) {
    String sql = """
        UPDATE patients
        SET name = ?,
            age = ?,
            gender = ?,
            symptoms = ?,
            bp_sys = ?,
            bp_dia = ?,
            hr = ?,
            rr = ?,
            spo2 = ?,
            temp = ?,
            triage_level = ?,
            triage_score = ?,
            red_flag = ?,
            triage_reason = ?,
            status = ?
        WHERE id = ?
        """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        // Basic info
        ps.setString(1, p.name);
        ps.setInt(2, p.age);
        ps.setString(3, p.gender);
        ps.setString(4, p.symptoms);

        // Vitals (nullable)
        if (p.vitals != null) {
            ps.setObject(5, p.vitals.bpSys, Types.INTEGER);
            ps.setObject(6, p.vitals.bpDia, Types.INTEGER);
            ps.setObject(7, p.vitals.hr, Types.INTEGER);
            ps.setObject(8, p.vitals.rr, Types.INTEGER);
            ps.setObject(9, p.vitals.spo2, Types.INTEGER);
            ps.setObject(10, p.vitals.temp, Types.DOUBLE);
        } else {
            ps.setNull(5, Types.INTEGER);
            ps.setNull(6, Types.INTEGER);
            ps.setNull(7, Types.INTEGER);
            ps.setNull(8, Types.INTEGER);
            ps.setNull(9, Types.INTEGER);
            ps.setNull(10, Types.DOUBLE);
        }

        // Triage fields
        ps.setInt(11, p.triageLevel);
        ps.setInt(12, p.triageScore);
        ps.setBoolean(13, p.redFlag);
        ps.setString(14, p.triageReason);

        // Status
        String statusStr = (p.status != null) ? p.status.name() : Status.WAITING.name();
        ps.setString(15, statusStr);

        // WHERE id = ?
        ps.setLong(16, p.id);

        ps.executeUpdate();

    } catch (SQLException e) {
        throw new RuntimeException("Error updating patient id=" + p.id, e);
    }

    return p;
}



    // 7.8.3 findById()
    public Patient findById(long id) {
        String sql = "SELECT * FROM patients WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToPatient(rs);
                }
                return null;
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error finding patient id=" + id, e);
        }
    }

    // 7.8.4 listWaiting()
    public List<Patient> listWaiting(int offset, int limit, String nameFilter) {
        List<Patient> result = new ArrayList<>();

        StringBuilder sb = new StringBuilder(
            "SELECT * FROM patients WHERE status = 'WAITING'"
        );

        boolean hasFilter = nameFilter != null && !nameFilter.isBlank();
        if (hasFilter) {
            sb.append(" AND name LIKE ?");
        }
        sb.append(" ORDER BY triage_level, triage_score DESC, created_at, age DESC");
        sb.append(" LIMIT ? OFFSET ?");

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sb.toString())) {

            int index = 1;
            if (hasFilter) {
                ps.setString(index++, "%" + nameFilter + "%");
            }
            ps.setInt(index++, limit);
            ps.setInt(index, offset);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    result.add(mapRowToPatient(rs));
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error listing waiting patients", e);
        }

        return result;
    }

    // 7.8.5 mapRowToPatient()
    private Patient mapRowToPatient(ResultSet rs) throws SQLException {
        Patient p = new Patient();
        p.id = rs.getLong("id");
        p.name = rs.getString("name");
        p.age = rs.getInt("age");
        p.gender = rs.getString("gender");
        p.symptoms = rs.getString("symptoms");

        Vitals v = new Vitals();
        v.bpSys = (Integer) rs.getObject("bp_sys");
        v.bpDia = (Integer) rs.getObject("bp_dia");
        v.hr = (Integer) rs.getObject("hr");
        v.rr = (Integer) rs.getObject("rr");
        v.spo2 = (Integer) rs.getObject("spo2");
        v.temp = (Double) rs.getObject("temp");
        p.vitals = v;

        p.triageLevel = rs.getInt("triage_level");
        p.triageScore = rs.getInt("triage_score");
        p.redFlag = rs.getBoolean("red_flag");
        p.triageReason = rs.getString("triage_reason");

        String statusStr = rs.getString("status");
        if (statusStr != null) {
            p.status = Status.valueOf(statusStr);
        }

        return p;
    }
}
