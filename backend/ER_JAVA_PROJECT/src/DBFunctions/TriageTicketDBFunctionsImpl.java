package DBFunctions;

import Config.DatabaseConfig;
import model.entity.TriageTicket;
import model.enums.PriorityLevel;
import model.enums.TicketStatus;

import java.sql.*;
//import java.time.LocalDateTime;   // Could be used later ??? , Yazn decide.
import java.util.ArrayList;
import java.util.List;

public class TriageTicketDBFunctionsImpl implements TriageTicketDBFunctions {

    @Override
    public boolean createTicket(TriageTicket ticket) {
        String sql = "INSERT INTO triage_tickets(" +
                "patient_id, priority, status, created_at" +
                ") VALUES(?,?,?,?)";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, ticket.getPatientId());
            stmt.setString(2, ticket.getPriority().name());
            stmt.setString(3, ticket.getStatus().name());
            stmt.setTimestamp(4, Timestamp.valueOf(ticket.getCreatedAt()));

            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            System.out.println("DB Error (createTicket): " + e.getMessage());
            return false;
        }
    }

    @Override
    public TriageTicket getTicketById(int id) {
        String sql = "SELECT * FROM triage_tickets WHERE id = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return mapRowToTicket(rs);
            }

        } catch (SQLException e) {
            System.out.println("DB Error (getTicketById): " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<TriageTicket> getTicketsByStatus(TicketStatus status) {
        List<TriageTicket> list = new ArrayList<>();
        String sql = "SELECT * FROM triage_tickets WHERE status = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, status.name());
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                list.add(mapRowToTicket(rs));
            }

        } catch (SQLException e) {
            System.out.println("DB Error (getTicketsByStatus): " + e.getMessage());
        }

        return list;
    }

    @Override
    public boolean updateTicketStatus(int id, TicketStatus newStatus) {
        String sql = "UPDATE triage_tickets SET status = ? WHERE id = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, newStatus.name());
            stmt.setInt(2, id);

            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            System.out.println("DB Error (updateTicketStatus): " + e.getMessage());
            return false;
        }
    }

    // ---------- helper ----------

    private TriageTicket mapRowToTicket(ResultSet rs) throws SQLException {
        TriageTicket ticket = new TriageTicket();

        ticket.setId(rs.getInt("id"));
        ticket.setPatientId(rs.getInt("patient_id"));

        String priorityStr = rs.getString("priority");
        if (priorityStr != null) {
            ticket.setPriority(PriorityLevel.valueOf(priorityStr));
        }

        String statusStr = rs.getString("status");
        if (statusStr != null) {
            ticket.setStatus(TicketStatus.valueOf(statusStr));
        }

        Timestamp createdTs = rs.getTimestamp("created_at");
        if (createdTs != null) {
            ticket.setCreatedAt(createdTs.toLocalDateTime());
        }

        Timestamp startedTs = rs.getTimestamp("started_at");
        if (startedTs != null) {
            ticket.setStartedAt(startedTs.toLocalDateTime());
        }

        Timestamp completedTs = rs.getTimestamp("completed_at");
        if (completedTs != null) {
            ticket.setCompletedAt(completedTs.toLocalDateTime());
        }

        return ticket;
    }
}
