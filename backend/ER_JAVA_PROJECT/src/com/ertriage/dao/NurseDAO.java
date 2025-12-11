package com.ertriage.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import com.ertriage.model.Nurse;

public class NurseDAO {

    // NurseDAO handles its own DB connection internally
    private Connection getConnection() throws SQLException {
        // Use the same DB settings pattern as PatientDAO / AuditLogDAO
        String url  = "jdbc:mysql://localhost:3306/er_triage_db";
        String user = "root";      // TODO: adjust to your DB username if needed
        String pass = "Alya1020";  // TODO: adjust to your DB password if needed
        return DriverManager.getConnection(url, user, pass);
    }

    /**
     * Authenticate nurse by username/password.
     * Returns a Nurse object if credentials are valid, otherwise null.
     */
    public Nurse authenticate(String username, String password) {
        String sql = "SELECT * FROM nurses WHERE username = ? AND password = ?";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);
            stmt.setString(2, password);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Nurse nurse = new Nurse();
                    nurse.setId(rs.getInt("id"));
                    nurse.setUsername(rs.getString("username"));
                    nurse.setPassword(rs.getString("password"));
                    return nurse;
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        // login failed
        return null;
    }
}