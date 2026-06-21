package com.englishcenter.controller;

import com.englishcenter.service.FinanceService;
import com.englishcenter.service.FinanceService.MonthlyFeeRequest;
import com.englishcenter.service.FinanceService.PaymentRequest;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class FinanceController {
    private final FinanceService service;

    public FinanceController(FinanceService service) {
        this.service = service;
    }

    @GetMapping("/dashboard/summary")
    public Map<String, Object> dashboardSummary() {
        return service.dashboardSummary();
    }

    @GetMapping("/monthly-fees")
    public List<Map<String, Object>> monthlyFees() {
        return service.listFees();
    }

    @PostMapping("/monthly-fees")
    public Map<String, Object> createMonthlyFee(@RequestBody MonthlyFeeRequest request) {
        return service.createFee(request);
    }

    @GetMapping("/payments")
    public List<Map<String, Object>> payments() {
        return service.listPayments();
    }

    @PostMapping("/payments")
    public Map<String, Object> createPayment(@RequestBody PaymentRequest request) {
        return service.createPayment(request);
    }

    @GetMapping("/reports/finance-monthly")
    public List<?> financeMonthly() {
        return service.financeMonthlyReport();
    }

    @GetMapping("/reports/statistics")
    public Map<String, Object> statistics() {
        return service.statisticsReport();
    }

    @GetMapping("/reports/finance-profit")
    public List<Map<String, Object>> financeProfit() {
        return service.financeMonthlyWithProfit();
    }

    @GetMapping("/reports/student-change")
    public List<?> studentChange() {
        return service.studentChangeReport();
    }

    @GetMapping("/reports/student-growth")
    public List<?> studentGrowth(@RequestParam(required = false, defaultValue = "month") String groupBy) {
        return service.studentGrowthStatistics(groupBy);
    }

    @GetMapping("/reports/students-by-class")
    public List<?> studentsByClass(@RequestParam(required = false) Long classId) {
        return service.studentsByClassReport(classId);
    }
}
