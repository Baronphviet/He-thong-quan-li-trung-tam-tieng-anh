package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "vw_uc_a03_students_by_class")
public class StudentByClassView {
    @Id
    @Column(name = "enrollment_id")
    public Long enrollmentId;

    @Column(name = "class_id")
    public Long classId;

    @Column(name = "class_name")
    public String className;

    @Column(name = "student_id")
    public Long studentId;

    @Column(name = "full_name")
    public String fullName;

    public String phone;
    public String status;

    @Column(name = "discount_rate")
    public BigDecimal discountRate;
}
