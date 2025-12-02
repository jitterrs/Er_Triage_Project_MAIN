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
    public void save(Patient p) {
        String sql = """
            INSERT INTO patients
            (name, national_id, age, gender, phone,
             current_medications, past_medical_history,
             bp_sys, bp_dia, hr, rr, spo2, temp,
             symptom, triage_level, triage_score, red_flag, triage_reason, status)
            VALUES
            (?, NULL, ?, ?, NULL,
             NULL, NULL,
             ?, ?, ?, ?, ?, ?,
             ?, ?, ?, ?, ?, ?)
            """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, p.name);
            ps.setInt(2, p.age);
            ps.setString(3, p.gender);

            // vitals (may be null)
            if (p.vitals != null) {
                ps.setObject(4, p.vitals.bpSys, Types.INTEGER);
                ps.setObject(5, p.vitals.bpDia, Types.INTEGER);
                ps.setObject(6, p.vitals.hr, Types.INTEGER);
                ps.setObject(7, p.vitals.rr, Types.INTEGER);
                ps.setObject(8, p.vitals.spo2, Types.INTEGER);
                if (p.vitals.temp != null) {
                    ps.setDouble(9, p.vitals.temp);
                } else {
                    ps.setNull(9, Types.DECIMAL);
                }
            } else {
                ps.setNull(4, Types.INTEGER);
                ps.setNull(5, Types.INTEGER);
                ps.setNull(6, Types.INTEGER);
                ps.setNull(7, Types.INTEGER);
                ps.setNull(8, Types.INTEGER);
                ps.setNull(9, Types.DECIMAL);
            }

            ps.setString(10, p.symptoms);                 // symptom
            ps.setInt(11, p.triageLevel);
            ps.setInt(12, p.triageScore);
            ps.setBoolean(13, p.redFlag);
            ps.setString(14, p.triageReason);
            ps.setString(15, p.status != null ? p.status.name() : Status.WAITING.name());

            ps.executeUpdate();

            // get generated id
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    p.id = rs.getLong(1);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error saving patient", e);
        }
    }

    // 7.8.2 update()
    public void update(Patient p) {
        String sql = """
            UPDATE patients
            SET name = ?,
                age = ?,
                gender = ?,
                bp_sys = ?, bp_dia = ?, hr = ?, rr = ?, spo2 = ?, temp = ?,
                symptom = ?,
                triage_level = ?, triage_score = ?, red_flag = ?, triage_reason = ?,
                status = ?
            WHERE id = ?
            """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, p.name);
            ps.setInt(2, p.age);
            ps.setString(3, p.gender);

            if (p.vitals != null) {
                ps.setObject(4, p.vitals.bpSys, Types.INTEGER);
                ps.setObject(5, p.vitals.bpDia, Types.INTEGER);
                ps.setObject(6, p.vitals.hr, Types.INTEGER);
                ps.setObject(7, p.vitals.rr, Types.INTEGER);
                ps.setObject(8, p.vitals.spo2, Types.INTEGER);
                if (p.vitals.temp != null) {
                    ps.setDouble(9, p.vitals.temp);
                } else {
                    ps.setNull(9, Types.DECIMAL);
                }
            } else {
                ps.setNull(4, Types.INTEGER);
                ps.setNull(5, Types.INTEGER);
                ps.setNull(6, Types.INTEGER);
                ps.setNull(7, Types.INTEGER);
                ps.setNull(8, Types.INTEGER);
                ps.setNull(9, Types.DECIMAL);
            }

            ps.setString(10, p.symptoms);
            ps.setInt(11, p.triageLevel);
            ps.setInt(12, p.triageScore);
            ps.setBoolean(13, p.redFlag);
            ps.setString(14, p.triageReason);
            ps.setString(15, p.status != null ? p.status.name() : Status.WAITING.name());

            ps.setLong(16, p.id);

            ps.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException("Error updating patient id=" + p.id, e);
        }
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
        sb.append(" ORDER BY triage_level, triage_score DESC, created_at");
        sb.append(" LIMIT ? OFFSET ?");

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sb.toString())) {

            int idx = 1;
            if (hasFilter) {
                ps.setString(idx++, "%" + nameFilter + "%");
            }
            ps.setInt(idx++, limit);
            ps.setInt(idx, offset);

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

    // Helper to map a DB row -> Patient object
    private Patient mapRowToPatient(ResultSet rs) throws SQLException {
        Patient p = new Patient();
        p.id = rs.getLong("id");
        p.name = rs.getString("name");
        p.age = rs.getInt("age");
        p.gender = rs.getString("gender");
        p.symptoms = rs.getString("symptom");

        Vitals v = new Vitals();
        v.bpSys = (Integer) rs.getObject("bp_sys");
        v.bpDia = (Integer) rs.getObject("bp_dia");
        v.hr = (Integer) rs.getObject("hr");
        v.rr = (Integer) rs.getObject("rr");
        v.spo2 = (Integer) rs.getObject("spo2");
        Double temp = rs.getObject("temp") != null ? rs.getDouble("temp") : null;
        v.temp = temp;
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