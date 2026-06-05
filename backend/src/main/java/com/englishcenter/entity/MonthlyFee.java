package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "monthly_fee")
public class MonthlyFee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fee_id")
    public Long id;

    @Column(name = "enrollment_id")
    public Long enrollmentId;

    public Integer month;
    public Integer year;

    @Column(name = "total_sessions")
    public Integer totalSessions = 0;

    @Column(name = "original_amount")
    public BigDecimal originalAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount")
    public BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "final_amount")
    public BigDecimal finalAmount = BigDecimal.ZERO;

    @Column(name = "due_date")
    public LocalDate dueDate;

    public String status = "UNPAID";
}
