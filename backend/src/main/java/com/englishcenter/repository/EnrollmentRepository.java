package com.englishcenter.repository;

import com.englishcenter.entity.Enrollment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByClassId(Long classId);

    List<Enrollment> findByClassIdAndStatus(Long classId, String status);

    List<Enrollment> findByStudentId(Long studentId);

    long countByClassIdAndStatus(Long classId, String status);

    Optional<Enrollment> findByStudentIdAndClassId(Long studentId, Long classId);

    long countByStatus(String status);
}
