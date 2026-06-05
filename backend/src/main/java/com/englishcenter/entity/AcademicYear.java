package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "academic_year")
public class AcademicYear {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "year_id")
    public Long id;

    @Column(name = "year_name")
    public String yearName;

    @Column(name = "start_date")
    public LocalDate startDate;

    @Column(name = "end_date")
    public LocalDate endDate;

    @Column(name = "is_active")
    public Boolean active = false;
}
