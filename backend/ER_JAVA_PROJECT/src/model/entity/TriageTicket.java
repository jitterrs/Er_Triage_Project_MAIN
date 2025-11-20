package model.entity;

import java.time.LocalDateTime;
import model.enums.PriorityLevel;
import model.enums.TicketStatus;

/**
 * Represents a patient's position in the triage queue.
 */
public class TriageTicket {

    private int id;                   // DB primary key = Yazn
    private int patientId;            // FK to Patient.id
    private PriorityLevel priority;
    private TicketStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;  // when treatment starts
    private LocalDateTime completedAt;

    public TriageTicket() {
    }

    public TriageTicket(int id,
                        int patientId,
                        PriorityLevel priority,
                        TicketStatus status,
                        LocalDateTime createdAt) {

        this.id = id;
        this.patientId = patientId;
        this.priority = priority;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters & setters

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getPatientId() {
        return patientId;
    }

    public void setPatientId(int patientId) {
        this.patientId = patientId;
    }

    public PriorityLevel getPriority() {
        return priority;
    }

    public void setPriority(PriorityLevel priority) {
        this.priority = priority;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    @Override
    public String toString() {
        return "TriageTicket{" +
                "id=" + id +
                ", patientId=" + patientId +
                ", priority=" + priority +
                ", status=" + status +
                ", createdAt=" + createdAt +
                ", startedAt=" + startedAt +
                ", completedAt=" + completedAt +
                '}';
    }
}
