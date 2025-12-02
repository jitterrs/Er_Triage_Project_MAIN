package com.ertriage.model;

public class TriageResult {
    public int level;
    public int score;
    public boolean redFlag;
    public String reason;

    public TriageResult(int level, int score, boolean redFlag, String reason) {
        this.level = level;
        this.score = score;
        this.redFlag = redFlag;
        this.reason = reason;
    }
}