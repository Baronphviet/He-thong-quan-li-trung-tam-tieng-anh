package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity(name = "ClassEntity")
@Table(name = "classes")
public class ClassEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_id")
    public Long id;

    @Column(name = "class_name")
    public String className;

    @Column(name = "age_group_id")
    public Long ageGroupId;

    @Column(name = "academic_year_id")
    public Long academicYearId;

    @Column(name = "teacher_id")
    public Long teacherId;

    @Column(name = "max_students")
    public Integer maxStudents = 0;

    public String schedule;

    @Column(name = "tuition_fee")
    public BigDecimal tuitionFee = BigDecimal.ZERO;

    public String status = "OPEN";

    @Column(name = "created_at", insertable = false, updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    public LocalDateTime updatedAt;
}
