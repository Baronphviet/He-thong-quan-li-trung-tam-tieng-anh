package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class StudentParentId implements Serializable {
    @Column(name = "student_id")
    public Long studentId;

    @Column(name = "parent_id")
    public Long parentId;

    public StudentParentId() {
    }

    public StudentParentId(Long studentId, Long parentId) {
        this.studentId = studentId;
        this.parentId = parentId;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof StudentParentId that)) {
            return false;
        }
        return Objects.equals(studentId, that.studentId) && Objects.equals(parentId, that.parentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(studentId, parentId);
    }
}
