package model.entity;

/**
 * Basic patient info.
 * Pure data holder (POJO).
 */
public class Patient {

    private int id;             // DB primary key  //Yazn
    private String name;
    private int age;
    private String nationalId;  // or hospital ID  // If it is there
    private String phone;

    // TODO > GENDER AND ADRESS , etc....

    public Patient() {
    }

    public Patient(int id, String name, int age, String nationalId, String phone) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.nationalId = nationalId;
        this.phone = phone;
    }

    // Getters & setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getNationalId() {
        return nationalId;
    }

    public void setNationalId(String nationalId) {
        this.nationalId = nationalId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    @Override
    public String toString() {
        return "Patient{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", age=" + age +
                ", nationalId='" + nationalId + '\'' +
                ", phone='" + phone + '\'' +
                '}';
    }
}
