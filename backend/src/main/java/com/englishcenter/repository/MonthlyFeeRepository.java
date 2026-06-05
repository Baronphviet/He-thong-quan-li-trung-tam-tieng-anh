package com.englishcenter.repository;

import com.englishcenter.entity.MonthlyFee;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonthlyFeeRepository extends JpaRepository<MonthlyFee, Long> {
    Optional<MonthlyFee> findByEnrollmentIdAndMonthAndYear(Long enrollmentId, Integer month, Integer year);

    List<MonthlyFee> findByEnrollmentId(Long enrollmentId);

    List<MonthlyFee> findByEnrollmentIdAndStatusIn(Long enrollmentId, Collection<String> statuses);

    List<MonthlyFee> findByStatusIn(Collection<String> statuses);

    List<MonthlyFee> findAllByOrderByYearDescMonthDesc();
}
