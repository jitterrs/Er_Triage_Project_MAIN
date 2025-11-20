package service;

import DBFunctions.PatientDBFunctions;
import DBFunctions.TriageTicketDBFunctions;
import model.entity.Patient;
import model.entity.TriageTicket;
import model.enums.PriorityLevel;
import model.enums.TicketStatus;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Basic implementation of triage logic.
 * Uses repositories to talk to the database.
 */
public class SimpleTriageService implements TriageService {

    private final PatientDBFunctions patientRepository;
    private final TriageTicketDBFunctions ticketRepository;

    public SimpleTriageService(PatientDBFunctions patientRepository, TriageTicketDBFunctions ticketRepository) {
        this.patientRepository = patientRepository;
        this.ticketRepository = ticketRepository;
        
    }

    @Override
    public Patient registerPatient(Patient patient) {
        boolean ok = patientRepository.createPatient(patient);
        if (!ok) {
            // later you can throw a custom exception
            System.out.println("Failed to register patient");
        }
        // In a real app, you’d return with the DB-generated id.
        // Yazn will adjust createPatient to return the inserted entity.
        return patient;
    }

    @Override
    public TriageTicket createTicketForPatient(int patientId, PriorityLevel priority) {
        TriageTicket ticket = new TriageTicket();
        ticket.setPatientId(patientId);
        ticket.setPriority(priority);
        ticket.setStatus(TicketStatus.WAITING);
        ticket.setCreatedAt(LocalDateTime.now());

        boolean ok = ticketRepository.createTicket(ticket);
        if (!ok) {
            System.out.println("Failed to create triage ticket");
        }
        return ticket;
    }

    @Override
    public TriageTicket registerPatientAndCreateTicket(Patient patient, PriorityLevel priority) {
        // 1) register patient
        Patient savedPatient = registerPatient(patient);
        // assume ID is set by DB later; for now, caller can set it beforehand
        int patientId = savedPatient.getId();

        // 2) create ticket
        return createTicketForPatient(patientId, priority);
    }

    @Override
    public List<TriageTicket> getWaitingQueue() {
        List<TriageTicket> waiting = ticketRepository.getTicketsByStatus(TicketStatus.WAITING);

        // Sort by:
        // 1) priority (LEVEL_1 highest)
        // 2) createdAt (oldest first)
        return waiting.stream()
                .sorted(Comparator
                        .comparingInt((TriageTicket t) -> priorityRank(t.getPriority()))
                        .thenComparing(TriageTicket::getCreatedAt))
                .collect(Collectors.toList());
    }

    @Override
    public TriageTicket callNextPatient() {
        List<TriageTicket> queue = getWaitingQueue();
        if (queue.isEmpty()) {
            return null;
        }

        TriageTicket next = queue.get(0);
        next.setStatus(TicketStatus.IN_TREATMENT);
        next.setStartedAt(LocalDateTime.now());

        boolean ok = ticketRepository.updateTicketStatus(next.getId(), TicketStatus.IN_TREATMENT);
        if (!ok) {
            System.out.println("Failed to update ticket status to IN_TREATMENT");
        }

        return next;
    }

    // ---------- helper ----------

    private int priorityRank(PriorityLevel level) {
        if (level == null) return 999; // worst case
        switch (level) {
            case LEVEL_1: return 1;
            case LEVEL_2: return 2;
            case LEVEL_3: return 3;
            case LEVEL_4: return 4;
            case LEVEL_5: return 5;
            default:      return 999;
        }
    }
}
