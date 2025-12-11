package com.ertriage.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import com.ertriage.model.Nurse;

public class NurseDAO {

    private final Connection conn;

    public NurseDAO(Connection conn) {
        this.conn = conn;
    }

    public Nurse authenticate(String username, String password) {
        try {
            String sql = "SELECT * FROM nurses WHERE username = ? AND password = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, username);
            stmt.setString(2, password);

            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Nurse nurse = new Nurse();
                nurse.setId(rs.getInt("id"));
                nurse.setUsername(rs.getString("username"));
                nurse.setPassword(rs.getString("password"));
                return nurse;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null; // login failed
    }
}
