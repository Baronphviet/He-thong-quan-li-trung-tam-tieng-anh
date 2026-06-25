CREATE TABLE bank_payment_config (
    config_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    qr_code_image LONGTEXT NULL,
    bank_name VARCHAR(255) NULL,
    account_number VARCHAR(100) NULL,
    account_holder VARCHAR(255) NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO bank_payment_config (config_id, qr_code_image, bank_name, account_number, account_holder)
VALUES (1, NULL, 'MB Bank', '0000123456789', 'NGUYEN VAN A');
