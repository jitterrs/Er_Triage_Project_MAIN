package DBFunctions;

import model.entity.Patient;
import Config.DatabaseConfig;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PatientDBFunctionsImpl implements PatientDBFunctions {

    @Override
    public boolean createPatient(Patient patient) {
        String sql = "INSERT INTO patients(name, age, nationalId, phone) VALUES(?,?,?,?)";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, patient.getName());
            stmt.setInt(2, patient.getAge());
            stmt.setString(3, patient.getNationalId());
            stmt.setString(4, patient.getPhone());

            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            System.out.println("DB Error (createPatient): " + e.getMessage());
            return false;
        }
    }

    @Override
    public Patient getPatientById(int id) {
        String sql = "SELECT * FROM patients WHERE id = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return new Patient(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getInt("age"),
                    rs.getString("nationalId"),
                    rs.getString("phone")
                );
            }

        } catch (SQLException e) {
            System.out.println("DB Error (getPatientById): " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<Patient> getAllPatients() {
        List<Patient> list = new ArrayList<>();
        String sql = "SELECT * FROM patients";

        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                list.add(new Patient(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getInt("age"),
                    rs.getString("nationalId"),
                    rs.getString("phone")
                ));
            }

        } catch (SQLException e) {
            System.out.println("DB Error (getAllPatients): " + e.getMessage());
        }

        return list;
    }
}
