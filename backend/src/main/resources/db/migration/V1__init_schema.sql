-- =============================================
-- English Center Management - Initial Schema
-- Database: MySQL 8+
-- Purpose : Create all core tables from README entities.
-- =============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------
-- 1) USERS (base table for all roles: ADMIN, TEACHER, STUDENT, PARENT)
-- -----------------------------------------------------
CREATE TABLE users (
    user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key của người dùng',
    username VARCHAR(50) NOT NULL COMMENT 'Tên đăng nhập duy nhất',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã băm',
    full_name VARCHAR(150) NOT NULL COMMENT 'Họ và tên',
    email VARCHAR(120) NULL COMMENT 'Email liên hệ',
    phone VARCHAR(20) NULL COMMENT 'Số điện thoại liên hệ',
    role ENUM('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') NOT NULL COMMENT 'Vai trò tài khoản',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Trạng thái hoạt động',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời điểm cập nhật gần nhất',
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_phone (phone),
    KEY idx_users_role_active (role, is_active)
) ENGINE = InnoDB COMMENT = 'Bảng người dùng gốc';

-- -----------------------------------------------------
-- 2) ACADEMIC_YEAR
-- -----------------------------------------------------
CREATE TABLE academic_year (
    year_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key năm học',
    year_name VARCHAR(20) NOT NULL COMMENT 'Tên năm học (VD: 2024-2025)',
    start_date DATE NOT NULL COMMENT 'Ngày bắt đầu năm học',
    end_date DATE NOT NULL COMMENT 'Ngày kết thúc năm học',
    is_active BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đánh dấu năm học đang sử dụng',
    PRIMARY KEY (year_id),
    UNIQUE KEY uk_academic_year_name (year_name),
    KEY idx_academic_year_active (is_active)
) ENGINE = InnoDB COMMENT = 'Danh mục năm học';

-- -----------------------------------------------------
-- 3) AGE_GROUP
-- -----------------------------------------------------
CREATE TABLE age_group (
    group_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key cấp độ/lứa tuổi',
    group_name VARCHAR(80) NOT NULL COMMENT 'Tên cấp độ (VD: Lớp 3, Beginner)',
    description VARCHAR(255) NULL COMMENT 'Mô tả thêm về cấp độ',
    PRIMARY KEY (group_id),
    UNIQUE KEY uk_age_group_name (group_name)
) ENGINE = InnoDB COMMENT = 'Danh mục cấp độ/lứa tuổi';

-- -----------------------------------------------------
-- 4) TEACHER (extends users)
-- -----------------------------------------------------
CREATE TABLE teacher (
    teacher_id BIGINT UNSIGNED NOT NULL COMMENT 'PK/FK sang users.user_id',
    degree VARCHAR(120) NULL COMMENT 'Bằng cấp/chứng chỉ',
    specialization VARCHAR(120) NULL COMMENT 'Chuyên môn giảng dạy',
    salary DECIMAL(12,2) NULL COMMENT 'Mức lương cơ bản',
    join_date DATE NULL COMMENT 'Ngày vào làm',
    PRIMARY KEY (teacher_id),
    CONSTRAINT fk_teacher_user
        FOREIGN KEY (teacher_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = 'Thông tin riêng của giáo viên';

-- -----------------------------------------------------
-- 5) STUDENT (extends users)
-- -----------------------------------------------------
CREATE TABLE student (
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'PK/FK sang users.user_id',
    date_of_birth DATE NULL COMMENT 'Ngày sinh học sinh',
    address VARCHAR(255) NULL COMMENT 'Địa chỉ liên hệ',
    enroll_date DATE NULL COMMENT 'Ngày nhập học',
    PRIMARY KEY (student_id),
    CONSTRAINT fk_student_user
        FOREIGN KEY (student_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = 'Thông tin riêng của học sinh';

-- -----------------------------------------------------
-- 6) PARENT (extends users)
-- -----------------------------------------------------
CREATE TABLE parent (
    parent_id BIGINT UNSIGNED NOT NULL COMMENT 'PK/FK sang users.user_id',
    zalo_id VARCHAR(100) NULL COMMENT 'Định danh Zalo',
    facebook_id VARCHAR(100) NULL COMMENT 'Định danh Facebook',
    relationship VARCHAR(30) NULL COMMENT 'Quan hệ với học sinh (Bố/Mẹ/...)',
    PRIMARY KEY (parent_id),
    CONSTRAINT fk_parent_user
        FOREIGN KEY (parent_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = 'Thông tin riêng của phụ huynh';

-- -----------------------------------------------------
-- 7) CLASSES
-- -----------------------------------------------------
CREATE TABLE classes (
    class_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key lớp học',
    class_name VARCHAR(80) NOT NULL COMMENT 'Tên lớp (VD: Lớp 3.1)',
    age_group_id BIGINT UNSIGNED NOT NULL COMMENT 'FK sang age_group',
    academic_year_id BIGINT UNSIGNED NOT NULL COMMENT 'FK sang academic_year',
    teacher_id BIGINT UNSIGNED NULL COMMENT 'FK sang teacher (giáo viên phụ trách)',
    max_students INT NOT NULL DEFAULT 0 COMMENT 'Sĩ số tối đa',
    schedule VARCHAR(255) NULL COMMENT 'Lịch học (VD: T2-T4-T6, 18:00-19:30)',
    tuition_fee DECIMAL(12,2) NOT NULL COMMENT 'Học phí gốc mỗi tháng',
    status ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN' COMMENT 'Trạng thái lớp',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo lớp',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời điểm cập nhật lớp',
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
) ENGINE = InnoDB COMMENT = 'Danh sách lớp học';

-- -----------------------------------------------------
-- 8) STUDENT_PARENT (many-to-many link)
-- -----------------------------------------------------
CREATE TABLE student_parent (
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'FK sang student',
    parent_id BIGINT UNSIGNED NOT NULL COMMENT 'FK sang parent',
    PRIMARY KEY (student_id, parent_id),
    KEY idx_student_parent_parent (parent_id),
    CONSTRAINT fk_student_parent_student
        FOREIGN KEY (student_id) REFERENCES student(student_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_student_parent_parent
        FOREIGN KEY (parent_id) REFERENCES parent(parent_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = 'Liên kết học sinh - phụ huynh';

-- -----------------------------------------------------
-- 9) ENROLLMENT
-- -----------------------------------------------------
CREATE TABLE enrollment (
    enrollment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key đăng ký học',
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'FK sang student',
    class_id BIGINT UNSIGNED NOT NULL COMMENT 'FK sang classes',
    discount_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000 COMMENT 'Tỷ lệ giảm học phí (0.10 = 10%)',
    enroll_date DATE NOT NULL COMMENT 'Ngày đăng ký',
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'Trạng thái đăng ký',
    PRIMARY KEY (enrollment_id),
    UNIQUE KEY uk_enrollment_student_class (student_id, class_id),
    KEY idx_enrollment_class_status (class_id, status),
    CONSTRAINT fk_enrollment_student
        FOREIGN KEY (student_id) REFERENCES student(student_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_class
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB COMMENT = 'Đăng ký học của học sinh vào lớp';

-- -----------------------------------------------------
-- 10) CLASS_SESSION
-- -----------------------------------------------------
CREATE TABLE class_session (
    session_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key buổi học',
    class_id BIGINT UNSIGNED NOT NULL COMMENT 'FK sang classes',
    session_date DATE NOT NULL COMMENT 'Ngày học',
    session_number INT NOT NULL COMMENT 'Số thứ tự buổi học trong kỳ',
    note VARCHAR(255) NULL COMMENT 'Ghi chú buổi học',
    created_by BIGINT UNSIGNED NOT NULL COMMENT 'Người tạo (FK users)',
    PRIMARY KEY (session_id),
    UNIQUE KEY uk_class_session_unique (class_id, session_date, session_number),
    KEY idx_class_session_created_by (created_by),
    CONSTRAINT fk_class_session_class
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_class_session_created_by
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB COMMENT = 'Danh sách buổi học của mỗi lớp';

-- -----------------------------------------------------
-- 11) ATTENDANCE
-- -----------------------------------------------------
CREATE TABLE attendance (
    attendance_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key điểm danh',
    session_id BIGINT UNSIGNED NOT NULL COMMENT 'FK sang class_session',
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'FK sang student',
    status ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL COMMENT 'Trạng thái đi học',
    note VARCHAR(255) NULL COMMENT 'Ghi chú điểm danh',
    PRIMARY KEY (attendance_id),
    UNIQUE KEY uk_attendance_session_student (session_id, student_id),
    KEY idx_attendance_student (student_id),
    KEY idx_attendance_status (status),
    CONSTRAINT fk_attendance_session
        FOREIGN KEY (session_id) REFERENCES class_session(session_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_attendance_student
        FOREIGN KEY (student_id) REFERENCES student(student_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = 'Điểm danh theo từng buổi học';

-- -----------------------------------------------------
-- 12) MONTHLY_FEE
-- -----------------------------------------------------
CREATE TABLE monthly_fee (
    fee_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key học phí tháng',
    enrollment_id BIGINT UNSIGNED NOT NULL COMMENT 'FK sang enrollment',
    month INT NOT NULL COMMENT 'Tháng tính phí (1-12)',
    year INT NOT NULL COMMENT 'Năm tính phí',
    total_sessions INT NOT NULL DEFAULT 0 COMMENT 'Tổng số buổi học trong tháng',
    original_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền gốc trước giảm',
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền được giảm',
    final_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền cần thu sau giảm',
    due_date DATE NULL COMMENT 'Hạn thanh toán',
    PRIMARY KEY (fee_id),
    UNIQUE KEY uk_monthly_fee_period (enrollment_id, month, year),
    KEY idx_monthly_fee_due_date (due_date),
    CONSTRAINT fk_monthly_fee_enrollment
        FOREIGN KEY (enrollment_id) REFERENCES enrollment(enrollment_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = 'Học phí theo tháng cho từng đăng ký';

-- -----------------------------------------------------
-- 13) PAYMENT
-- -----------------------------------------------------
CREATE TABLE payment (
    payment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key thanh toán',
    fee_id BIGINT UNSIGNED NOT NULL COMMENT 'FK sang monthly_fee',
    amount DECIMAL(12,2) NOT NULL COMMENT 'Số tiền đã đóng',
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm đóng tiền',
    method ENUM('CASH', 'TRANSFER') NOT NULL COMMENT 'Hình thức thanh toán',
    received_by BIGINT UNSIGNED NOT NULL COMMENT 'Người nhận tiền (FK users)',
    note VARCHAR(255) NULL COMMENT 'Ghi chú giao dịch',
    PRIMARY KEY (payment_id),
    KEY idx_payment_fee (fee_id),
    KEY idx_payment_received_by (received_by),
    KEY idx_payment_date (payment_date),
    CONSTRAINT fk_payment_fee
        FOREIGN KEY (fee_id) REFERENCES monthly_fee(fee_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_payment_received_by
        FOREIGN KEY (received_by) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB COMMENT = 'Lịch sử thanh toán học phí';

-- -----------------------------------------------------
-- 14) TEACHER_SALARY
-- -----------------------------------------------------
CREATE TABLE teacher_salary (
    salary_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key lương giáo viên',
    teacher_id BIGINT UNSIGNED NOT NULL COMMENT 'FK sang teacher',
    month INT NOT NULL COMMENT 'Tháng lương (1-12)',
    year INT NOT NULL COMMENT 'Năm lương',
    total_sessions INT NOT NULL DEFAULT 0 COMMENT 'Tổng số buổi dạy trong kỳ lương',
    amount DECIMAL(12,2) NOT NULL COMMENT 'Số tiền lương',
    paid_date DATE NULL COMMENT 'Ngày trả lương',
    status ENUM('PENDING', 'PAID') NOT NULL DEFAULT 'PENDING' COMMENT 'Trạng thái trả lương',
    PRIMARY KEY (salary_id),
    UNIQUE KEY uk_teacher_salary_period (teacher_id, month, year),
    KEY idx_teacher_salary_status (status),
    CONSTRAINT fk_teacher_salary_teacher
        FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = 'Lương giáo viên theo tháng';

-- -----------------------------------------------------
-- 15) ANNOUNCEMENT
-- -----------------------------------------------------
CREATE TABLE announcement (
    announcement_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key thông báo/quảng cáo',
    title VARCHAR(200) NOT NULL COMMENT 'Tiêu đề thông báo',
    content TEXT NULL COMMENT 'Nội dung thông báo',
    image_url VARCHAR(500) NULL COMMENT 'Ảnh hiển thị',
    type ENUM('POPUP', 'SLIDER', 'BANNER') NOT NULL COMMENT 'Loại hiển thị',
    start_date DATE NULL COMMENT 'Ngày bắt đầu hiển thị',
    end_date DATE NULL COMMENT 'Ngày kết thúc hiển thị',
    is_active BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Trạng thái kích hoạt',
    created_by BIGINT UNSIGNED NOT NULL COMMENT 'Người tạo (FK users)',
    PRIMARY KEY (announcement_id),
    KEY idx_announcement_active_period (is_active, start_date, end_date),
    KEY idx_announcement_created_by (created_by),
    CONSTRAINT fk_announcement_created_by
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB COMMENT = 'Thông báo / quảng cáo hiển thị ở trang chủ';

-- -----------------------------------------------------
-- 16) NOTIFICATION
-- -----------------------------------------------------
CREATE TABLE notification (
    notification_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key tin nhắn tự động',
    recipient_id BIGINT UNSIGNED NOT NULL COMMENT 'Người nhận (FK users)',
    channel ENUM('ZALO', 'FACEBOOK', 'SMS', 'EMAIL') NOT NULL COMMENT 'Kênh gửi',
    message TEXT NOT NULL COMMENT 'Nội dung tin nhắn',
    status ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT 'Trạng thái gửi',
    sent_at DATETIME NULL COMMENT 'Thời điểm gửi thực tế',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo bản ghi',
    PRIMARY KEY (notification_id),
    KEY idx_notification_recipient (recipient_id),
    KEY idx_notification_channel_status (channel, status),
    KEY idx_notification_created_at (created_at),
    CONSTRAINT fk_notification_recipient
        FOREIGN KEY (recipient_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = 'Lịch sử gửi thông báo tự động';

-- -----------------------------------------------------
-- 17) SYSTEM_CONFIG
-- -----------------------------------------------------
CREATE TABLE system_config (
    config_key VARCHAR(100) NOT NULL COMMENT 'Khóa cấu hình (VD: show_teacher_to_parent)',
    config_value VARCHAR(500) NULL COMMENT 'Giá trị cấu hình',
    PRIMARY KEY (config_key)
) ENGINE = InnoDB COMMENT = 'Cấu hình hệ thống dạng key-value';

SET FOREIGN_KEY_CHECKS = 1;
