-- =============================================
-- V2 - Manual transfer reconciliation for tuition payments
-- Date: 2026-05-19
-- =============================================

-- 1) Extra reconciliation fields for transfer payments
ALTER TABLE payment
    ADD COLUMN transfer_ref VARCHAR(120) NULL COMMENT 'Noi dung/ma tham chieu giao dich, uu tien chua student_id'
    AFTER method,
    ADD COLUMN verified_by BIGINT UNSIGNED NULL COMMENT 'Admin da doi soat giao dich'
    AFTER received_by,
    ADD COLUMN verified_at DATETIME NULL COMMENT 'Thoi diem admin xac nhan doi soat'
    AFTER verified_by;

ALTER TABLE payment
    ADD CONSTRAINT fk_payment_verified_by
        FOREIGN KEY (verified_by) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE payment
    ADD KEY idx_payment_transfer_ref (transfer_ref),
    ADD KEY idx_payment_verified_by (verified_by),
    ADD KEY idx_payment_verified_at (verified_at);
