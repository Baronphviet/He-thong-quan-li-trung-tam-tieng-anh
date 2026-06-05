-- Demo data for local development and frontend smoke testing.

INSERT INTO users (user_id, username, password_hash, full_name, email, phone, role, is_active) VALUES
    (1, 'admin', 'admin123', 'Center Admin', 'admin@english.local', '0900000001', 'ADMIN', TRUE),
    (2, 'teacher.mai', 'teacher123', 'Mai Nguyen', 'mai@english.local', '0900000002', 'TEACHER', TRUE),
    (3, 'teacher.nam', 'teacher123', 'Nam Tran', 'nam@english.local', '0900000003', 'TEACHER', TRUE),
    (4, 'student.an', 'student123', 'An Pham', 'an@english.local', '0900000004', 'STUDENT', TRUE),
    (5, 'student.binh', 'student123', 'Binh Le', 'binh@english.local', '0900000005', 'STUDENT', TRUE),
    (6, 'parent.huong', 'parent123', 'Huong Pham', 'huong@english.local', '0900000006', 'PARENT', TRUE),
    (7, 'parent.lan', 'parent123', 'Lan Le', 'lan@english.local', '0900000007', 'PARENT', TRUE);

INSERT INTO teacher (teacher_id, degree, specialization, salary_rate, join_date) VALUES
    (2, 'TESOL', 'Primary English', 12000000.00, '2024-08-01'),
    (3, 'IELTS 8.0', 'Academic English', 15000000.00, '2023-06-15');

INSERT INTO student (student_id, date_of_birth, address, enroll_date) VALUES
    (4, '2015-03-12', 'District 1, Ho Chi Minh City', '2026-06-01'),
    (5, '2014-10-02', 'District 3, Ho Chi Minh City', '2026-06-01');

INSERT INTO parent (parent_id, zalo_id, facebook_id, relationship) VALUES
    (6, 'zalo-huong', 'fb-huong', 'Mother'),
    (7, 'zalo-lan', 'fb-lan', 'Mother');

INSERT INTO student_parent (student_id, parent_id) VALUES
    (4, 6),
    (5, 7);

INSERT INTO academic_year (year_id, year_name, start_date, end_date, is_active) VALUES
    (1, '2026-2027', '2026-06-01', '2027-05-31', TRUE);

INSERT INTO age_group (group_id, group_name, description) VALUES
    (1, 'Primary 3', 'Students around grade 3'),
    (2, 'Primary 4', 'Students around grade 4'),
    (3, 'IELTS Foundation', 'Teen IELTS preparation');

INSERT INTO classes (class_id, class_name, age_group_id, academic_year_id, teacher_id, max_students, schedule, tuition_fee, status) VALUES
    (1, 'P3 Evening 1', 1, 1, 2, 18, 'T2-T4-T6|18:00-19:30', 1800000.00, 'OPEN'),
    (2, 'IELTS Foundation A', 3, 1, 3, 16, 'T3-T5|19:00-20:30', 2400000.00, 'OPEN');

INSERT INTO enrollment (enrollment_id, student_id, class_id, discount_rate, enroll_date, status) VALUES
    (1, 4, 1, 0.1000, '2026-06-01', 'ACTIVE'),
    (2, 5, 1, 0.0000, '2026-06-01', 'ACTIVE');

INSERT INTO monthly_fee (fee_id, enrollment_id, month, year, total_sessions, original_amount, discount_amount, final_amount, due_date, status) VALUES
    (1, 1, 6, 2026, 12, 1800000.00, 180000.00, 1620000.00, '2026-06-10', 'PARTIAL'),
    (2, 2, 6, 2026, 12, 1800000.00, 0.00, 1800000.00, '2026-06-10', 'UNPAID');

INSERT INTO payment (payment_id, fee_id, amount, payment_date, method, transfer_ref, received_by, verified_by, verified_at, note) VALUES
    (1, 1, 1000000.00, '2026-06-01 09:00:00', 'TRANSFER', 'AN-202606', 1, 1, '2026-06-01 09:05:00', 'Partial transfer');

INSERT INTO teacher_salary (salary_id, teacher_id, month, year, total_sessions, amount, paid_date, status, note) VALUES
    (1, 2, 6, 2026, 12, 12000000.00, NULL, 'PENDING', 'June payroll draft'),
    (2, 3, 6, 2026, 8, 15000000.00, NULL, 'PENDING', 'June payroll draft');

INSERT INTO announcement (announcement_id, title, content, image_url, type, start_date, end_date, is_active, created_by) VALUES
    (1, 'Summer English enrollment is open', 'New evening classes for primary students start this month.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b', 'BANNER', '2026-06-01', '2026-07-31', TRUE, 1),
    (2, 'Parent payment reminder', 'Tuition can be paid by cash or bank transfer with the student code in transfer content.', NULL, 'POPUP', '2026-06-01', '2026-06-30', TRUE, 1);

INSERT INTO system_config (config_key, config_value) VALUES
    ('show_teacher_to_parent', 'true');
