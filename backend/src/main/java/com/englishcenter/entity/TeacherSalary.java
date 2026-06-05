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
@Table(name = "teacher_salary")
public class TeacherSalary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "salary_id")
    public Long id;

    @Column(name = "teacher_id")
    public Long teacherId;

    public Integer month;
    public Integer year;

    @Column(name = "total_sessions")
    public Integer totalSessions = 0;

    public BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "paid_date")
    public LocalDate paidDate;

    public String status = "PENDING";
    public String note;
}
