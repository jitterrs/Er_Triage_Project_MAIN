import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbTest {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/er_triage_db?useSSL=false&serverTimezone=UTC";
        String user = "root";
        String password = "Alya1020"; // replace with your MySQL root password

        try {
            // Load the driver (optional for modern JDK)
            Class.forName("com.mysql.cj.jdbc.Driver");

            // Connect to database
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("Connection successful!");

            // Example query
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM patients");

            while (rs.next()) {
                System.out.println(rs.getInt("id") + " | " +
                                   rs.getString("name") + " | " +
                                   rs.getString("symptom"));
            }

            rs.close();
            stmt.close();
            conn.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
