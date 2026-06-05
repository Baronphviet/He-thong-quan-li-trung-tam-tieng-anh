package com.englishcenter.repository;

import com.englishcenter.entity.FinanceMonthlyView;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinanceMonthlyViewRepository extends JpaRepository<FinanceMonthlyView, String> {
    List<FinanceMonthlyView> findAllByOrderByYearDescMonthDesc();
}
