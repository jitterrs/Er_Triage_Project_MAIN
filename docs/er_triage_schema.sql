-- ==========================================================
--   ER TRIAGE SYSTEM DATABASE SCHEMA
--   Matches Java DAOs + SDS component design
-- ==========================================================

-- Create DB
CREATE DATABASE IF NOT EXISTS er_triage_db;
USE er_triage_db;

-- Drop tables (in correct dependency order)
DROP TABLE IF EXISTS vitals_history;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS patients;

-- ==========================================================
--   PATIENTS TABLE
-- ==========================================================

CREATE TABLE patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Patient info
    name        VARCHAR(100) NOT NULL,
    national_id VARCHAR(20) NULL,
    age         INT NOT NULL,
    gender      VARCHAR(10),
    phone       VARCHAR(20),

    -- Medical background (optional)
    current_medications   TEXT NULL,
    past_medical_history  TEXT NULL,

    -- Latest recorded vitals
    bp_sys  INT,
    bp_dia  INT,
    hr      INT,
    rr      INT,
    spo2    INT,
    temp    DECIMAL(4,1),

    -- Symptoms
    symptom TEXT,

    -- Triage result
    triage_level  INT NOT NULL,
    triage_score  INT NOT NULL,
    red_flag      BOOLEAN NOT NULL,
    triage_reason TEXT,

    -- CURRENT status in workflow
    status ENUM('WAITING','IN_TREATMENT','TREATED')
           NOT NULL DEFAULT 'WAITING',

    -- When patient entered the system
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
--   AUDIT LOG TABLE
-- ==========================================================

CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    patient_id BIGINT NOT NULL,
    actor      VARCHAR(50) NOT NULL,
    action     VARCHAR(50) NOT NULL,
    details    TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_patient
        FOREIGN KEY (patient_id) REFERENCES patients(id)
        ON DELETE CASCADE
);

-- ==========================================================
--   VITALS HISTORY TABLE (optional extension)
-- ==========================================================

CREATE TABLE vitals_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,

    bp_sys INT,
    bp_dia INT,
    hr     INT,
    rr     INT,
    spo2   INT,
    temp   DECIMAL(4,1),

    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_patient
        FOREIGN KEY(patient_id) REFERENCES patients(id)
        ON DELETE CASCADE
);

-- ==========================================================
-- SAMPLE DATA (optional)
-- ==========================================================

INSERT INTO patients
(name, national_id, age, gender, phone,
 symptom,
 bp_sys, bp_dia, hr, rr, spo2, temp,
 triage_reason, triage_level, triage_score, red_flag, status)
VALUES
('Sara', '1234567890', 25, 'F', '0500000001',
 'Headache and nausea',
 120, 80, 88, 18, 97, 37.0,
 'Mild headache',
 3, 3, FALSE, 'WAITING'),

('Ali', '2234567890', 30, 'M', '0500000002',
 'Abdominal pain',
 120, 80, 88, 18, 97, 37.0,
 'Mild abdominal pain',
 3, 3, FALSE, 'WAITING'),

('Noura', '3234567890', 40, 'F', '0500000003',
 'Chest pressure',
 150, 100, 110, 24, 90, 38.5,
 'Possible cardiac issue',
 2, 5, TRUE, 'WAITING');
