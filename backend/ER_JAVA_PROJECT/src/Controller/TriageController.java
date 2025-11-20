package Controller;

import model.entity.Patient;
import model.entity.TriageTicket;
import model.enums.PriorityLevel;
import service.TriageService;

import java.util.List;

/**
 * Controller = what the UI / frontend calls.  >> Rakan work
 * It delegates work to the TriageService.
 */
public class TriageController {

    private final TriageService triageService;

    public TriageController(TriageService triageService) {
        this.triageService = triageService;
    }

    // 1) Register a patient only
    public Patient registerPatient(String name, int age, String nationalId, String phone) {
        Patient p = new Patient();
        p.setName(name);
        p.setAge(age);
        p.setNationalId(nationalId);
        p.setPhone(phone);

        return triageService.registerPatient(p);
    }

    // 2) Register + create ticket in one go
    public TriageTicket registerAndCreateTicket(String name,
                                                int age,
                                                String nationalId,
                                                String phone,
                                                PriorityLevel priority) {
        Patient p = new Patient();
        p.setName(name);
        p.setAge(age);
        p.setNationalId(nationalId);
        p.setPhone(phone);

        return triageService.registerPatientAndCreateTicket(p, priority);
    }

    // 3) Get the waiting queue
    public List<TriageTicket> getWaitingQueue() {
        return triageService.getWaitingQueue();
    }

    // 4) Call next patient
    public TriageTicket callNextPatient() {
        return triageService.callNextPatient();
    }
}
