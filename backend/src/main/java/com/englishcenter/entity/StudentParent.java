package com.englishcenter.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "student_parent")
public class StudentParent {
    @EmbeddedId
    public StudentParentId id;
}
