package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "class_session")
public class ClassSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    public Long id;

    @Column(name = "class_id")
    public Long classId;

    @Column(name = "session_date")
    public LocalDate sessionDate;

    @Column(name = "session_number")
    public Integer sessionNumber;

    public String note;

    @Column(name = "created_by")
    public Long createdBy;
}
