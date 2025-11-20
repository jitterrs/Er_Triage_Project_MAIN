package Config;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * YAZN ONLY
 * Central place for database connection details.
 * Plain JDBC, no frameworks.
 */
public class DatabaseConfig {

    // TODO: Yazn Fill these 
    private static final String URL = "jdbc:mysql://localhost:3306/er_db";
    private static final String USER = "root";
    private static final String PASSWORD = "password";

    /**
     * Returns a new database connection.
     * Repository classes will call this.
     */
    public static Connection getConnection() throws SQLException {
        // If driver not auto-loaded, Yazn can add:
        // Class.forName("com.mysql.cj.jdbc.Driver");
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    // small helper for testing connection
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null;
        } catch (SQLException e) {
            return false;
        }
    }

    
    private DatabaseConfig() {}
}
