package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    public Long id;

    @Column(name = "fee_id")
    public Long feeId;

    public BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "payment_date")
    public LocalDateTime paymentDate;

    public String method;

    @Column(name = "transfer_ref")
    public String transferRef;

    @Column(name = "received_by")
    public Long receivedBy;

    @Column(name = "verified_by")
    public Long verifiedBy;

    @Column(name = "verified_at")
    public LocalDateTime verifiedAt;

    public String note;
}
