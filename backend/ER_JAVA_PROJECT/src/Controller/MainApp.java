package Controller;

import DBFunctions.PatientDBFunctionsImpl;
import DBFunctions.TriageTicketDBFunctionsImpl;
import model.entity.TriageTicket;
import model.enums.PriorityLevel;
import service.SimpleTriageService;
import service.TriageService;

import java.util.List;

public class MainApp {

    public static void main(String[] args) {
        // 1) Create repositories
        PatientDBFunctionsImpl patientRepo = new PatientDBFunctionsImpl();
        TriageTicketDBFunctionsImpl ticketRepo = new TriageTicketDBFunctionsImpl();

        // 2) Create service
        TriageService triageService = new SimpleTriageService(patientRepo, ticketRepo);

        // 3) Create controller
        TriageController controller = new TriageController(triageService);

        // 4) Example usage (later frontend will do similar calls)
        System.out.println("=== ER Triage System Demo ===");

        // Register patient + create ticket
        TriageTicket ticket = controller.registerAndCreateTicket(
                "Turki Hamad",
                23,
                "1234567890",
                "0500000000",
                PriorityLevel.LEVEL_2
        );

        System.out.println("Created ticket: " + ticket);

        // Get waiting queue
        List<TriageTicket> queue = controller.getWaitingQueue();
        System.out.println("Current waiting queue:");
        for (TriageTicket t : queue) {
            System.out.println(t);
        }

        // Call next patient
        TriageTicket next = controller.callNextPatient();
        System.out.println("Next patient to treat: " + next);
    }
}
