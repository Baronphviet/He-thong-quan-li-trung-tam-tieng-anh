package com.englishcenter.repository;

import com.englishcenter.entity.StudentByClassView;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentByClassViewRepository extends JpaRepository<StudentByClassView, Long> {
    List<StudentByClassView> findByClassIdOrderByFullNameAsc(Long classId);
}
