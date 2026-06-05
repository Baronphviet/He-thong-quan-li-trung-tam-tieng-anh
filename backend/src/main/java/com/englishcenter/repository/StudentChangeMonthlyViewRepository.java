package com.englishcenter.repository;

import com.englishcenter.entity.StudentChangeMonthlyView;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentChangeMonthlyViewRepository extends JpaRepository<StudentChangeMonthlyView, String> {
    List<StudentChangeMonthlyView> findAllByOrderByYearDescMonthDesc();
}
