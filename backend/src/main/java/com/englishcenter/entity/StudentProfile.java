package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "student")
public class StudentProfile {
    @Id
    @Column(name = "student_id")
    public Long id;

    @Column(name = "date_of_birth")
    public LocalDate dateOfBirth;

    public String address;

    @Column(name = "enroll_date")
    public LocalDate enrollDate;
}
