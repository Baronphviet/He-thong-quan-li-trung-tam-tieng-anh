package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "vw_uc_a07_finance_monthly")
public class FinanceMonthlyView {
    @Id
    public String id;

    public Integer year;
    public Integer month;

    @Column(name = "tuition_expected")
    public BigDecimal tuitionExpected;

    @Column(name = "tuition_collected")
    public BigDecimal tuitionCollected;

    @Column(name = "tuition_outstanding")
    public BigDecimal tuitionOutstanding;

    @Column(name = "teacher_salary_cost")
    public BigDecimal teacherSalaryCost;
}
