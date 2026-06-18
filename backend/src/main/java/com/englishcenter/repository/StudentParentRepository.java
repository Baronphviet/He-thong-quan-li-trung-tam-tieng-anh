package com.englishcenter.repository;

import com.englishcenter.entity.StudentParent;
import com.englishcenter.entity.StudentParentId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentParentRepository extends JpaRepository<StudentParent, StudentParentId> {
    
    List<StudentParent> findByIdStudentId(Long studentId);

    List<StudentParent> findByIdParentId(Long parentId);

    // ==========================================================================================
    // CẬP NHẬT: Lấy cả Email phụ huynh và Tên học sinh (Trả về danh sách mảng Object)
    // ==========================================================================================
    @Query(value = "SELECT p.email, s.full_name FROM student_parent sp " +
                   "JOIN parent_profile p ON sp.parent_id = p.id " +
                   "JOIN student_profile s ON sp.student_id = s.id " +
                   "WHERE s.class_id = :classId AND p.email IS NOT NULL", 
           nativeQuery = true)
    List<Object[]> findParentEmailsAndStudentNamesByClassId(@Param("classId") String classId);
}