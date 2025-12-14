package com.ertriage.dto;

import com.ertriage.model.Status;

public class PatientView {
    public long id;
    public String name;
    public int age;
    public String gender;
    public String symptoms;

    public Integer bpSys;
    public Integer bpDia;
    public Integer hr;
    public Integer rr;
    public Integer spo2;
    public Double temp;

    public int triageLevel;
    public int triageScore;
    public boolean redFlag;
    public String triageReason;
    public Status status;
}