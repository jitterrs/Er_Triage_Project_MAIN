package com.ertriage.model;

public class Patient {
    public long id;
    public String name;
    public int age;
    public String gender;
    public String symptoms;

    public Vitals vitals;

    public int triageLevel;
    public int triageScore;
    public boolean redFlag;
    public String triageReason;

    public Status status;
}