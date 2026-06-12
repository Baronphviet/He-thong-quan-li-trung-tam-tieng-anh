package com.englishcenter.service;

import com.englishcenter.entity.ClassEntity;
import com.englishcenter.entity.Enrollment;
import com.englishcenter.entity.MonthlyFee;
import com.englishcenter.entity.Payment;
import com.englishcenter.exception.NotFoundException;
import com.englishcenter.repository.AnnouncementRepository;
import com.englishcenter.repository.ClassRepository;
import com.englishcenter.repository.EnrollmentRepository;
import com.englishcenter.repository.FinanceMonthlyViewRepository;
import com.englishcenter.repository.MonthlyFeeRepository;
import com.englishcenter.repository.PaymentRepository;
import com.englishcenter.repository.StudentByClassViewRepository;
import com.englishcenter.repository.StudentChangeMonthlyViewRepository;
import com.englishcenter.repository.TeacherSalaryRepository;
import com.englishcenter.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FinanceService {
    private final MonthlyFeeRepository monthlyFees;
    private final PaymentRepository payments;
    private final EnrollmentRepository enrollments;
    private final ClassRepository classes;
    private final UserRepository users;
    private final FinanceMonthlyViewRepository financeReport;
    private final StudentChangeMonthlyViewRepository studentReport;
    private final StudentByClassViewRepository studentsByClass;
    private final AnnouncementRepository announcements;
    private final TeacherSalaryRepository teacherSalaries;
    private final ClassService classService;

    public FinanceService(
            MonthlyFeeRepository monthlyFees,
            PaymentRepository payments,
            EnrollmentRepository enrollments,
            ClassRepository classes,
            UserRepository users,
            FinanceMonthlyViewRepository financeReport,
            StudentChangeMonthlyViewRepository studentReport,
            StudentByClassViewRepository studentsByClass,
            AnnouncementRepository announcements,
            TeacherSalaryRepository teacherSalaries,
            ClassService classService
    ) {
        this.monthlyFees = monthlyFees;
        this.payments = payments;
        this.enrollments = enrollments;
        this.classes = classes;
        this.users = users;
        this.financeReport = financeReport;
        this.studentReport = studentReport;
        this.studentsByClass = studentsByClass;
        this.announcements = announcements;
        this.teacherSalaries = teacherSalaries;
        this.classService = classService;
    }

    public record MonthlyFeeRequest(
            Long enrollmentId,
            Integer month,
            Integer year,
            Integer totalSessions,
            LocalDate dueDate
    ) {
    }

    public record PaymentRequest(
            Long feeId,
            BigDecimal amount,
            String method,
            String transferRef,
            Long receivedBy,
            Long verifiedBy,
            LocalDateTime verifiedAt,
            String note
    ) {
    }

    public Map<String, Object> dashboardSummary() {
        BigDecimal expected = BigDecimal.ZERO;
        BigDecimal collected = BigDecimal.ZERO;
        BigDecimal outstanding = BigDecimal.ZERO;
        BigDecimal salaryCost = BigDecimal.ZERO;
        var months = financeReport.findAllByOrderByYearDescMonthDesc();
        if (!months.isEmpty()) {
            var latest = months.get(0);
            expected = nullToZero(latest.tuitionExpected);
            collected = nullToZero(latest.tuitionCollected);
            outstanding = nullToZero(latest.tuitionOutstanding);
            salaryCost = nullToZero(latest.teacherSalaryCost);
        }
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("activeStudents", users.countByRoleAndActiveTrue("STUDENT"));
        map.put("activeTeachers", users.countByRoleAndActiveTrue("TEACHER"));
        map.put("openClasses", classes.countByStatus("OPEN"));
        map.put("activeEnrollments", enrollments.countByStatus("ACTIVE"));
        map.put("monthExpected", expected);
        map.put("monthCollected", collected);
        map.put("monthOutstanding", outstanding);
        map.put("monthTeacherSalaryCost", salaryCost);
        map.put("activeAnnouncements", announcements.findActiveForDate(LocalDate.now()).size());
        return map;
    }

    public Map<String, Object> statisticsReport() {
        Map<String, Object> map = new LinkedHashMap<>(dashboardSummary());
        BigDecimal totalCollected = nullToZero(payments.sumAllPayments());
        BigDecimal totalSalaryPaid = nullToZero(teacherSalaries.sumPaidSalaries());
        map.put("totalClasses", classes.count());
        map.put("totalTuitionCollected", totalCollected);
        map.put("totalSalaryPaid", totalSalaryPaid);
        map.put("profit", totalCollected.subtract(totalSalaryPaid));
        return map;
    }

    public List<Map<String, Object>> financeMonthlyWithProfit() {
        return financeReport.findAllByOrderByYearDescMonthDesc().stream().map(row -> {
            BigDecimal collected = nullToZero(row.tuitionCollected);
            BigDecimal salary = nullToZero(row.teacherSalaryCost);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", row.id);
            item.put("year", row.year);
            item.put("month", row.month);
            item.put("tuitionExpected", row.tuitionExpected);
            item.put("tuitionCollected", collected);
            item.put("tuitionOutstanding", row.tuitionOutstanding);
            item.put("teacherSalaryCost", salary);
            item.put("profit", collected.subtract(salary));
            return item;
        }).toList();
    }

    public List<Map<String, Object>> listFees() {
        return monthlyFees.findAllByOrderByYearDescMonthDesc().stream().map(this::feeMap).toList();
    }

    @Transactional
    public Map<String, Object> createFee(MonthlyFeeRequest request) {
        Enrollment enrollment = enrollments.findById(request.enrollmentId())
                .orElseThrow(() -> new NotFoundException("Enrollment not found: " + request.enrollmentId()));
        ClassEntity classEntity = classes.findById(enrollment.classId)
                .orElseThrow(() -> new NotFoundException("Class not found: " + enrollment.classId));

        if (request.month() == null || request.year() == null) {
            throw new IllegalArgumentException("month and year are required");
        }
        monthlyFees.findByEnrollmentIdAndMonthAndYear(enrollment.id, request.month(), request.year()).ifPresent(existing -> {
            throw new IllegalArgumentException("Monthly fee already exists for this enrollment and period");
        });

        MonthlyFee fee = new MonthlyFee();
        fee.enrollmentId = enrollment.id;
        fee.month = request.month();
        fee.year = request.year();
        fee.totalSessions = request.totalSessions() == null ? 0 : request.totalSessions();
        fee.dueDate = request.dueDate();
        fee.status = "UNPAID";
        classService.applyAmounts(fee, classEntity.tuitionFee, enrollment.discountRate);
        return feeMap(monthlyFees.save(fee));
    }

    public List<Map<String, Object>> listPayments() {
        return payments.findAllByOrderByPaymentDateDesc().stream().map(this::paymentMap).toList();
    }

    @Transactional
    public Map<String, Object> createPayment(PaymentRequest request) {
        MonthlyFee fee = monthlyFees.findById(request.feeId())
                .orElseThrow(() -> new NotFoundException("Monthly fee not found: " + request.feeId()));
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("amount must be greater than zero");
        }
        Long receivedBy = request.receivedBy() == null ? 1L : request.receivedBy();
        if (!users.existsById(receivedBy)) {
            throw new NotFoundException("Receiver not found: " + receivedBy);
        }

        BigDecimal paidBefore = nullToZero(payments.sumPaidByFeeId(fee.id));
        BigDecimal outstanding = fee.finalAmount.subtract(paidBefore);
        if (request.amount().compareTo(outstanding) > 0) {
            throw new IllegalArgumentException("Payment exceeds outstanding amount: " + outstanding);
        }

        Payment payment = new Payment();
        payment.feeId = fee.id;
        payment.amount = request.amount();
        payment.paymentDate = LocalDateTime.now();
        payment.method = isBlank(request.method()) ? "CASH" : request.method();
        payment.transferRef = request.transferRef();
        payment.receivedBy = receivedBy;
        payment.verifiedBy = request.verifiedBy();
        payment.verifiedAt = request.verifiedAt();
        payment.note = request.note();
        Payment saved = payments.save(payment);

        refreshFeeStatus(fee);
        return paymentMap(saved);
    }

    public List<?> financeMonthlyReport() {
        return financeReport.findAllByOrderByYearDescMonthDesc();
    }

    public List<?> studentChangeReport() {
        return studentReport.findAllByOrderByYearDescMonthDesc();
    }

    public List<?> studentsByClassReport(Long classId) {
        return classId == null ? studentsByClass.findAll() : studentsByClass.findByClassIdOrderByFullNameAsc(classId);
    }

    @Transactional
    public void refreshFeeStatus(MonthlyFee fee) {
        BigDecimal paid = nullToZero(payments.sumPaidByFeeId(fee.id));
        if (paid.compareTo(BigDecimal.ZERO) <= 0) {
            fee.status = "UNPAID";
        } else if (paid.compareTo(fee.finalAmount) >= 0) {
            fee.status = "PAID";
        } else {
            fee.status = "PARTIAL";
        }
        monthlyFees.save(fee);
    }

    private Map<String, Object> feeMap(MonthlyFee fee) {
        BigDecimal paid = nullToZero(payments.sumPaidByFeeId(fee.id));
        Enrollment enrollment = enrollments.findById(fee.enrollmentId).orElse(null);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", fee.id);
        map.put("enrollmentId", fee.enrollmentId);
        map.put("studentId", enrollment == null ? null : enrollment.studentId);
        map.put("studentName", enrollment == null ? null : users.findById(enrollment.studentId).map(user -> user.fullName).orElse(null));
        map.put("classId", enrollment == null ? null : enrollment.classId);
        map.put("className", enrollment == null ? null : classes.findById(enrollment.classId).map(classEntity -> classEntity.className).orElse(null));
        map.put("month", fee.month);
        map.put("year", fee.year);
        map.put("totalSessions", fee.totalSessions);
        map.put("originalAmount", fee.originalAmount);
        map.put("discountAmount", fee.discountAmount);
        map.put("finalAmount", fee.finalAmount);
        map.put("paidAmount", paid);
        map.put("outstandingAmount", fee.finalAmount.subtract(paid));
        map.put("dueDate", fee.dueDate);
        map.put("status", fee.status);
        return map;
    }

    private Map<String, Object> paymentMap(Payment payment) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", payment.id);
        map.put("feeId", payment.feeId);
        map.put("amount", payment.amount);
        map.put("paymentDate", payment.paymentDate);
        map.put("method", payment.method);
        map.put("transferRef", payment.transferRef);
        map.put("receivedBy", payment.receivedBy);
        map.put("receivedByName", payment.receivedBy == null ? null : users.findById(payment.receivedBy).map(user -> user.fullName).orElse(null));
        map.put("verifiedBy", payment.verifiedBy);
        map.put("verifiedAt", payment.verifiedAt);
        map.put("note", payment.note);
        return map;
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
