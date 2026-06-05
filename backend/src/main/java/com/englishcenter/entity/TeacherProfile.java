package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "teacher")
public class TeacherProfile {
    @Id
    @Column(name = "teacher_id")
    public Long id;

    public String degree;
    public String specialization;

    @Column(name = "salary_rate")
    public BigDecimal salaryRate = BigDecimal.ZERO;

    @Column(name = "join_date")
    public LocalDate joinDate;
}
