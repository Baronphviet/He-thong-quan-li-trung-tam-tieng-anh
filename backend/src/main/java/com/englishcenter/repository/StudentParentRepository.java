package com.englishcenter.repository;

import com.englishcenter.entity.StudentParent;
import com.englishcenter.entity.StudentParentId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentParentRepository extends JpaRepository<StudentParent, StudentParentId> {
    List<StudentParent> findByIdStudentId(Long studentId);

    List<StudentParent> findByIdParentId(Long parentId);
}
