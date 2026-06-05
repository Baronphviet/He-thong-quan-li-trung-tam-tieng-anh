-- English Center Management - Initial Schema
-- Database: MySQL 8+

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE users (
    user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(120) NULL,
    phone VARCHAR(20) NULL,
    role ENUM('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_phone (phone),
    KEY idx_users_role_active (role, is_active)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE academic_year (
    year_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    year_name VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (year_id),
    UNIQUE KEY uk_academic_year_name (year_name),
    KEY idx_academic_year_active (is_active)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE age_group (
    group_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    group_name VARCHAR(80) NOT NULL,
    description VARCHAR(255) NULL,
    PRIMARY KEY (group_id),
    UNIQUE KEY uk_age_group_name (group_name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE teacher (
    teacher_id BIGINT UNSIGNED NOT NULL,
    degree VARCHAR(120) NULL,
    specialization VARCHAR(120) NULL,
    salary_rate DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    join_date DATE NULL,
    PRIMARY KEY (teacher_id),
    CONSTRAINT fk_teacher_user
        FOREIGN KEY (teacher_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE student (
    student_id BIGINT UNSIGNED NOT NULL,
    date_of_birth DATE NULL,
    address VARCHAR(255) NULL,
    enroll_date DATE NULL,
    PRIMARY KEY (student_id),
    CONSTRAINT fk_student_user
        FOREIGN KEY (student_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE parent (
    parent_id BIGINT UNSIGNED NOT NULL,
    zalo_id VARCHAR(100) NULL,
    facebook_id VARCHAR(100) NULL,
    relationship VARCHAR(30) NULL,
    PRIMARY KEY (parent_id),
    CONSTRAINT fk_parent_user
        FOREIGN KEY (parent_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE classes (
    class_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    class_name VARCHAR(80) NOT NULL,
    age_group_id BIGINT UNSIGNED NOT NULL,
    academic_year_id BIGINT UNSIGNED NOT NULL,
    teacher_id BIGINT UNSIGNED NULL,
    max_students INT NOT NULL DEFAULT 0,
    schedule VARCHAR(255) NULL,
    tuition_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id),
    UNIQUE KEY uk_classes_year_name (academic_year_id, class_name),
    KEY idx_classes_age_group (age_group_id),
    KEY idx_classes_teacher (teacher_id),
    KEY idx_classes_status (status),
    CONSTRAINT fk_classes_age_group
        FOREIGN KEY (age_group_id) REFERENCES age_group(group_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_classes_academic_year
        FOREIGN KEY (academic_year_id) REFERENCES academic_year(year_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_classes_teacher
        FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE student_parent (
    student_id BIGINT UNSIGNED NOT NULL,
    parent_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (student_id, parent_id),
    KEY idx_student_parent_parent (parent_id),
    CONSTRAINT fk_student_parent_student
        FOREIGN KEY (student_id) REFERENCES student(student_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_student_parent_parent
        FOREIGN KEY (parent_id) REFERENCES parent(parent_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE enrollment (
    enrollment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NOT NULL,
    class_id BIGINT UNSIGNED NOT NULL,
    discount_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    enroll_date DATE NOT NULL,
    status ENUM('ACTIVE', 'DROPPED', 'COMPLETED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (enrollment_id),
    UNIQUE KEY uk_enrollment_student_class (student_id, class_id),
    KEY idx_enrollment_class_status (class_id, status),
    KEY idx_enrollment_student_status (student_id, status),
    CONSTRAINT fk_enrollment_student
        FOREIGN KEY (student_id) REFERENCES student(student_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_enrollment_class
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE class_session (
    session_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    class_id BIGINT UNSIGNED NOT NULL,
    session_date DATE NOT NULL,
    session_number INT NOT NULL,
    note VARCHAR(255) NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (session_id),
    UNIQUE KEY uk_class_session_unique (class_id, session_date, session_number),
    KEY idx_class_session_created_by (created_by),
    CONSTRAINT fk_class_session_class
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_class_session_created_by
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE attendance (
    attendance_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    session_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL,
    note VARCHAR(255) NULL,
    PRIMARY KEY (attendance_id),
    UNIQUE KEY uk_attendance_session_student (session_id, student_id),
    KEY idx_attendance_student (student_id),
    KEY idx_attendance_status (status),
    CONSTRAINT fk_attendance_session
        FOREIGN KEY (session_id) REFERENCES class_session(session_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_attendance_student
        FOREIGN KEY (student_id) REFERENCES student(student_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE monthly_fee (
    fee_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    enrollment_id BIGINT UNSIGNED NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    total_sessions INT NOT NULL DEFAULT 0,
    original_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    final_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    due_date DATE NULL,
    status ENUM('UNPAID', 'PARTIAL', 'PAID') NOT NULL DEFAULT 'UNPAID',
    PRIMARY KEY (fee_id),
    UNIQUE KEY uk_monthly_fee_period (enrollment_id, month, year),
    KEY idx_monthly_fee_period_status (year, month, status),
    KEY idx_monthly_fee_due_date (due_date),
    CONSTRAINT fk_monthly_fee_enrollment
        FOREIGN KEY (enrollment_id) REFERENCES enrollment(enrollment_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE payment (
    payment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    fee_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    method ENUM('CASH', 'TRANSFER') NOT NULL,
    received_by BIGINT UNSIGNED NOT NULL,
    note VARCHAR(255) NULL,
    PRIMARY KEY (payment_id),
    KEY idx_payment_fee (fee_id),
    KEY idx_payment_received_by (received_by),
    KEY idx_payment_date (payment_date),
    CONSTRAINT fk_payment_fee
        FOREIGN KEY (fee_id) REFERENCES monthly_fee(fee_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_payment_received_by
        FOREIGN KEY (received_by) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE teacher_salary (
    salary_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    teacher_id BIGINT UNSIGNED NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    total_sessions INT NOT NULL DEFAULT 0,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    paid_date DATE NULL,
    status ENUM('PENDING', 'PAID') NOT NULL DEFAULT 'PENDING',
    note VARCHAR(255) NULL,
    PRIMARY KEY (salary_id),
    UNIQUE KEY uk_teacher_salary_period (teacher_id, month, year),
    KEY idx_teacher_salary_period_status (year, month, status),
    CONSTRAINT fk_teacher_salary_teacher
        FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE announcement (
    announcement_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NULL,
    image_url VARCHAR(500) NULL,
    type ENUM('POPUP', 'SLIDER', 'BANNER') NOT NULL DEFAULT 'BANNER',
    start_date DATE NULL,
    end_date DATE NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (announcement_id),
    KEY idx_announcement_active_period (is_active, start_date, end_date),
    KEY idx_announcement_created_by (created_by),
    CONSTRAINT fk_announcement_created_by
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE notification (
    notification_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    recipient_id BIGINT UNSIGNED NOT NULL,
    channel ENUM('ZALO', 'FACEBOOK', 'SMS', 'EMAIL') NOT NULL,
    message TEXT NOT NULL,
    status ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
    sent_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id),
    KEY idx_notification_recipient (recipient_id),
    KEY idx_notification_channel_status (channel, status),
    KEY idx_notification_created_at (created_at),
    CONSTRAINT fk_notification_recipient
        FOREIGN KEY (recipient_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE system_config (
    config_key VARCHAR(100) NOT NULL,
    config_value VARCHAR(500) NULL,
    PRIMARY KEY (config_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE OR REPLACE VIEW vw_uc_a07_finance_monthly AS
SELECT
    CONCAT(mf.`year`, '-', LPAD(mf.`month`, 2, '0')) AS id,
    mf.`year`,
    mf.`month`,
    SUM(mf.final_amount) AS tuition_expected,
    SUM(COALESCE(pp.paid_amount, 0)) AS tuition_collected,
    SUM(mf.final_amount - COALESCE(pp.paid_amount, 0)) AS tuition_outstanding,
    COALESCE(ts.salary_cost, 0) AS teacher_salary_cost
FROM monthly_fee mf
LEFT JOIN (
    SELECT fee_id, SUM(amount) AS paid_amount
    FROM payment
    GROUP BY fee_id
) pp ON pp.fee_id = mf.fee_id
LEFT JOIN (
    SELECT `year`, `month`, SUM(amount) AS salary_cost
    FROM teacher_salary
    GROUP BY `year`, `month`
) ts ON ts.`year` = mf.`year` AND ts.`month` = mf.`month`
GROUP BY mf.`year`, mf.`month`, ts.salary_cost;

CREATE OR REPLACE VIEW vw_uc_a08_student_change_by_month AS
SELECT
    CONCAT(YEAR(e.enroll_date), '-', LPAD(MONTH(e.enroll_date), 2, '0')) AS id,
    YEAR(e.enroll_date) AS `year`,
    MONTH(e.enroll_date) AS `month`,
    COUNT(DISTINCT e.student_id) AS unique_new_students,
    COUNT(e.enrollment_id) AS total_new_enrollments,
    SUM(CASE WHEN e.status = 'DROPPED' THEN 1 ELSE 0 END) AS dropped_students
FROM enrollment e
GROUP BY YEAR(e.enroll_date), MONTH(e.enroll_date);

CREATE OR REPLACE VIEW vw_uc_a03_students_by_class AS
SELECT
    e.enrollment_id,
    e.class_id,
    c.class_name,
    s.student_id,
    u.full_name,
    u.phone,
    e.status,
    e.discount_rate
FROM enrollment e
JOIN users u ON e.student_id = u.user_id
JOIN student s ON u.user_id = s.student_id
JOIN classes c ON e.class_id = c.class_id;

SET FOREIGN_KEY_CHECKS = 1;
