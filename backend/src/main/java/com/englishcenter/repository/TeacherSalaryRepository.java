package com.englishcenter.repository;

import com.englishcenter.entity.TeacherSalary;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TeacherSalaryRepository extends JpaRepository<TeacherSalary, Long> {
    @Query("select coalesce(sum(t.amount), 0) from TeacherSalary t where t.status = 'PAID'")
    BigDecimal sumPaidSalaries();
}
