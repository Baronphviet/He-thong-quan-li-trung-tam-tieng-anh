package com.englishcenter.repository;

import com.englishcenter.entity.AcademicYear;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {
    List<AcademicYear> findAllByOrderByStartDateDesc();
}
