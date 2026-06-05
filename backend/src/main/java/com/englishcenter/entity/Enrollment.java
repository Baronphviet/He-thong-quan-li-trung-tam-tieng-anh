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
@Table(name = "enrollment")
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enrollment_id")
    public Long id;

    @Column(name = "student_id")
    public Long studentId;

    @Column(name = "class_id")
    public Long classId;

    @Column(name = "discount_rate")
    public BigDecimal discountRate = BigDecimal.ZERO;

    @Column(name = "enroll_date")
    public LocalDate enrollDate;

    public String status = "ACTIVE";
}
