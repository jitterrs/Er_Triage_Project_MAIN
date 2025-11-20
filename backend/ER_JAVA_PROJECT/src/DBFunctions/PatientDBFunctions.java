package DBFunctions;

import model.entity.Patient;
import java.util.List;

public interface PatientDBFunctions {

    boolean createPatient(Patient patient);

    Patient getPatientById(int id);

    List<Patient> getAllPatients();
}
