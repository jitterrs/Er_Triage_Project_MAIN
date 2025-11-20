package DBFunctions;

import model.entity.TriageTicket;
import model.enums.TicketStatus;
import java.util.List;

public interface TriageTicketDBFunctions {

    boolean createTicket(TriageTicket ticket);

    TriageTicket getTicketById(int id);

    List<TriageTicket> getTicketsByStatus(TicketStatus status);

    boolean updateTicketStatus(int id, TicketStatus newStatus);
}
