package Config;

/**
 * Global application constants and settings.
 * No logic here, just "settings" used everywhere.
 */


public class AppConfig {


    public static final int MAX_PRIORITY_LEVEL = 5;    //1 = Highest, 5 = Lowest

    public static final int MAX_PATIENTS_IN_QUEUE = 200;

    public static final int DB_TIMEOUT_MS = 5000;

    private AppConfig() {}
}
