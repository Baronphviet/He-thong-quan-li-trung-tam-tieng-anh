package com.englishcenter.repository;

import com.englishcenter.entity.Payment;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByFeeIdOrderByPaymentDateDesc(Long feeId);

    List<Payment> findAllByOrderByPaymentDateDesc();

    @Query(value = "select coalesce(sum(amount), 0) from payment where fee_id = :feeId", nativeQuery = true)
    BigDecimal sumPaidByFeeId(@Param("feeId") Long feeId);
}
