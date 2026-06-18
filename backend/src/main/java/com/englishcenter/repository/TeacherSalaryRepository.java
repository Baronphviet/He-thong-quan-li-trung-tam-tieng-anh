package com.englishcenter.repository;

import com.englishcenter.entity.TeacherSalary;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TeacherSalaryRepository extends JpaRepository<TeacherSalary, Long> {
    @Query("select coalesce(sum(t.amount), 0) from TeacherSalary t where t.status = 'PAID'")
    BigDecimal sumPaidSalaries();

    List<TeacherSalary> findByMonthAndYear(Integer month, Integer year);
    List<TeacherSalary> findByTeacherIdOrderByYearDescMonthDesc(Long teacherId);
    java.util.Optional<TeacherSalary> findByTeacherIdAndMonthAndYear(Long teacherId, Integer month, Integer year);
}
