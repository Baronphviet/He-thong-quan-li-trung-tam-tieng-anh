package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bank_payment_config")
public class BankPaymentConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id")
    public Long id;

    @Column(name = "qr_code_image")
    public String qrCodeImage;

    @Column(name = "bank_name")
    public String bankName;

    @Column(name = "account_number")
    public String accountNumber;

    @Column(name = "account_holder")
    public String accountHolder;
}
