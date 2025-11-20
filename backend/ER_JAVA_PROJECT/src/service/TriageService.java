package service;

import model.entity.Patient;
import model.entity.TriageTicket;
import model.enums.PriorityLevel;

import java.util.List;

public interface TriageService {

    // 1) Register a new patient only
    Patient registerPatient(Patient patient);

    // 2) Create a ticket for an existing patient
    TriageTicket createTicketForPatient(int patientId, PriorityLevel priority);

    // 3) Shortcut: register patient + create ticket in one go
    TriageTicket registerPatientAndCreateTicket(Patient patient, PriorityLevel priority);

    // 4) Get all waiting tickets ordered by priority + time
    List<TriageTicket> getWaitingQueue();

    // 5) Pop the next patient to be treated
    TriageTicket callNextPatient();
}
