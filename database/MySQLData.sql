<<<<<<< HEAD
-- ================================
--  ER Triage Database Schema
--  File: ER_Triage_Schema.sql
-- ================================

-- 1) Create database
CREATE DATABASE IF NOT EXISTS er_triage_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE er_triage_db;

-- ================================
-- Drop tables if exist (clean reset)
-- ================================
DROP TABLE IF EXISTS vitals_history;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS patients;

-- ================================
-- 2) Main table: patients
-- ================================
CREATE TABLE patients (
    id              INT AUTO_INCREMENT PRIMARY KEY,

    -- Basic info
    name            VARCHAR(100)     NOT NULL,
    national_id     VARCHAR(20)      NULL,
    age             INT              NOT NULL,
    gender          ENUM('M','F','Other') NOT NULL,
    phone           VARCHAR(20)      NULL,

    -- Medical background
    current_medications   VARCHAR(255) NULL,
    past_medical_history  VARCHAR(255) NULL,

    -- Vitals
    bp_sys          INT              NULL,   -- systolic BP
    bp_dia          INT              NULL,   -- diastolic BP
    hr              INT              NULL,   -- heart rate
    rr              INT              NULL,   -- respiratory rate
    spo2            INT              NULL,   -- oxygen saturation %
    temp            DECIMAL(4,1)     NULL,   -- temperature

    -- Symptoms / description
    symptom         VARCHAR(255)     NOT NULL,

    -- Triage results
    triage_level    TINYINT          NOT NULL,    -- 1,2,3,...
    triage_score    INT              NOT NULL,    -- total score
    red_flag        BOOLEAN          NOT NULL DEFAULT FALSE,
    triage_reason   VARCHAR(255)     NOT NULL,    -- explanation

    -- Status & timing
    status          ENUM('WAITING','IN_TREATMENT','TREATED')
                                    NOT NULL DEFAULT 'WAITING',
    created_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Index for fast queue sorting
CREATE INDEX idx_queue
ON patients (status, triage_level, triage_score, created_at, age);

-- ================================
-- 3) Audit log table
-- ================================
CREATE TABLE audit_log (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    patient_id      INT           NOT NULL,

    action          VARCHAR(50)   NOT NULL,  -- e.g. 'CREATE', 'UPDATE_VITALS'
    old_status      ENUM('WAITING','IN_TREATMENT','TREATED') NULL,
    new_status      ENUM('WAITING','IN_TREATMENT','TREATED') NULL,
    details         VARCHAR(255)  NULL,

    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_patient
      FOREIGN KEY (patient_id) REFERENCES patients(id)
      ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================
-- 4) Optional: vitals history (trends)
-- ================================
CREATE TABLE vitals_history (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    patient_id      INT           NOT NULL,

    bp_sys          INT           NULL,
    bp_dia          INT           NULL,
    hr              INT           NULL,
    rr              INT           NULL,
    spo2            INT           NULL,
    temp            DECIMAL(4,1)  NULL,

    recorded_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vitals_patient
      FOREIGN KEY (patient_id) REFERENCES patients(id)
      ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================
-- 5) Sample data for testing
-- ================================
INSERT INTO patients
(name, national_id, age, gender, phone,
 current_medications, past_medical_history,
 bp_sys, bp_dia, hr, rr, spo2, temp,
 symptom, triage_level, triage_score, red_flag, triage_reason, status)
VALUES
-- Noura - Level 2, waiting
('Noura', '1234567890', 70, 'F', '0500000001',
 'Aspirin', 'Hypertension',
 102, 65, 96, 22, 93, 37.8,
 'Chest pain, shortness of breath',
 2, 8, FALSE, 'SBP 102; SpO2 93%; chest pain', 'WAITING'),

-- Ali - Level 3, stable
('Ali', '2234567890', 30, 'M', '0500000002',
 NULL, 'None',
 120, 80, 88, 18, 97, 37.0,
 'Mild abdominal pain',
 3, 3, FALSE, 'Stable vitals, mild abdominal pain', 'WAITING'),

-- Sara - Level 1, red flag
('Sara', '3234567890', 55, 'F', '0500000003',
 'Metformin', 'Diabetes Type 2',
 85, 55, 120, 30, 84, 38.2,
 'Severe chest pain, sweating',
 1, 12, TRUE, 'SpO2 84%; SBP 85; severe chest pain', 'IN_TREATMENT');
=======
-- ================================
--  ER Triage Database Schema
--  File: ER_Triage_Schema.sql
-- ================================

-- 1) Create database
CREATE DATABASE IF NOT EXISTS er_triage_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE er_triage_db;

-- ================================
-- Drop tables if exist (clean reset)
-- ================================
DROP TABLE IF EXISTS vitals_history;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS patients;

-- ================================
-- 2) Main table: patients
-- ================================
CREATE TABLE patients (
    id              INT AUTO_INCREMENT PRIMARY KEY,

    -- Basic info
    name            VARCHAR(100)     NOT NULL,
    national_id     VARCHAR(20)      NULL,
    age             INT              NOT NULL,
    gender          ENUM('M','F','Other') NOT NULL,
    phone           VARCHAR(20)      NULL,

    -- Medical background
    current_medications   VARCHAR(255) NULL,
    past_medical_history  VARCHAR(255) NULL,

    -- Vitals
    bp_sys          INT              NULL,   -- systolic BP
    bp_dia          INT              NULL,   -- diastolic BP
    hr              INT              NULL,   -- heart rate
    rr              INT              NULL,   -- respiratory rate
    spo2            INT              NULL,   -- oxygen saturation %
    temp            DECIMAL(4,1)     NULL,   -- temperature

    -- Symptoms / description
    symptom         VARCHAR(255)     NOT NULL,

    -- Triage results
    triage_level    TINYINT          NOT NULL,    -- 1,2,3,...
    triage_score    INT              NOT NULL,    -- total score
    red_flag        BOOLEAN          NOT NULL DEFAULT FALSE,
    triage_reason   VARCHAR(255)     NOT NULL,    -- explanation

    -- Status & timing
    status          ENUM('WAITING','IN_TREATMENT','TREATED')
                                    NOT NULL DEFAULT 'WAITING',
    created_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Index for fast queue sorting
CREATE INDEX idx_queue
ON patients (status, triage_level, triage_score, created_at, age);

-- ================================
-- 3) Audit log table
-- ================================
CREATE TABLE audit_log (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    patient_id      INT           NOT NULL,

    action          VARCHAR(50)   NOT NULL,  -- e.g. 'CREATE', 'UPDATE_VITALS'
    old_status      ENUM('WAITING','IN_TREATMENT','TREATED') NULL,
    new_status      ENUM('WAITING','IN_TREATMENT','TREATED') NULL,
    details         VARCHAR(255)  NULL,

    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_patient
      FOREIGN KEY (patient_id) REFERENCES patients(id)
      ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================
-- 4) Optional: vitals history (trends)
-- ================================
CREATE TABLE vitals_history (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    patient_id      INT           NOT NULL,

    bp_sys          INT           NULL,
    bp_dia          INT           NULL,
    hr              INT           NULL,
    rr              INT           NULL,
    spo2            INT           NULL,
    temp            DECIMAL(4,1)  NULL,

    recorded_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vitals_patient
      FOREIGN KEY (patient_id) REFERENCES patients(id)
      ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================
-- 5) Sample data for testing
-- ================================
INSERT INTO patients
(name, national_id, age, gender, phone,
 current_medications, past_medical_history,
 bp_sys, bp_dia, hr, rr, spo2, temp,
 symptom, triage_level, triage_score, red_flag, triage_reason, status)
VALUES
-- Noura - Level 2, waiting
('Noura', '1234567890', 70, 'F', '0500000001',
 'Aspirin', 'Hypertension',
 102, 65, 96, 22, 93, 37.8,
 'Chest pain, shortness of breath',
 2, 8, FALSE, 'SBP 102; SpO2 93%; chest pain', 'WAITING'),

-- Ali - Level 3, stable
('Ali', '2234567890', 30, 'M', '0500000002',
 NULL, 'None',
 120, 80, 88, 18, 97, 37.0,
 'Mild abdominal pain',
 3, 3, FALSE, 'Stable vitals, mild abdominal pain', 'WAITING'),

-- Sara - Level 1, red flag
('Sara', '3234567890', 55, 'F', '0500000003',
 'Metformin', 'Diabetes Type 2',
 85, 55, 120, 30, 84, 38.2,
 'Severe chest pain, sweating',
 1, 12, TRUE, 'SpO2 84%; SBP 85; severe chest pain', 'IN_TREATMENT');
>>>>>>> main
