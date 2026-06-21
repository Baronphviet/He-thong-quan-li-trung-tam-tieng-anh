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
    // ==========================================================================================
    // CẬP NHẬT: Lấy cả Email phụ huynh và Tên học sinh (Trả về danh sách mảng Object)
    // ==========================================================================================
    @Query(value = "SELECT pu.email, su.full_name " +
            "FROM student_parent sp " +
            "JOIN users pu ON sp.parent_id = pu.user_id " +
            "JOIN users su ON sp.student_id = su.user_id " +
            "JOIN enrollment e ON sp.student_id = e.student_id " +
            "WHERE e.class_id = :classId " +
            "  AND e.status = 'ACTIVE' " +
            "  AND pu.email IS NOT NULL",
            nativeQuery = true)
    // TRẢ LẠI THÀNH STRING: Java không báo lỗi incompatible types nữa, MySQL sẽ tự ép kiểu
    List<Object[]> findParentEmailsAndStudentNamesByClassId(@Param("classId") String classId);
    void deleteByIdStudentId(Long studentId);
    void deleteByIdParentId(Long parentId);
}