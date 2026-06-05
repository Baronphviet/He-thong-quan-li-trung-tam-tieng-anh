package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "vw_uc_a08_student_change_by_month")
public class StudentChangeMonthlyView {
    @Id
    public String id;

    public Integer year;
    public Integer month;

    @Column(name = "unique_new_students")
    public Long uniqueNewStudents;

    @Column(name = "total_new_enrollments")
    public Long totalNewEnrollments;

    @Column(name = "dropped_students")
    public Long droppedStudents;
}
