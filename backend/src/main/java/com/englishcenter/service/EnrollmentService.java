package com.englishcenter.service;

import com.englishcenter.entity.ClassEntity;
import com.englishcenter.entity.Enrollment;
import com.englishcenter.entity.MonthlyFee;
import com.englishcenter.exception.NotFoundException;
import com.englishcenter.repository.ClassRepository;
import com.englishcenter.repository.EnrollmentRepository;
import com.englishcenter.repository.MonthlyFeeRepository;
import com.englishcenter.repository.StudentRepository;
import com.englishcenter.repository.UserRepository;
import com.englishcenter.repository.ClassSessionRepository;
import com.englishcenter.repository.AttendanceRepository;
import com.englishcenter.repository.PaymentRepository;
import com.englishcenter.entity.Attendance;
import com.englishcenter.entity.Payment;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EnrollmentService {
    private final EnrollmentRepository enrollments;
    private final StudentRepository students;
    private final ClassRepository classes;
    private final UserRepository users;
    private final MonthlyFeeRepository monthlyFees;
    private final ClassService classService;
    private final ClassSessionRepository sessions;
    private final AttendanceRepository attendances;
    private final PaymentRepository payments;

    public EnrollmentService(
            EnrollmentRepository enrollments,
            StudentRepository students,
            ClassRepository classes,
            UserRepository users,
            MonthlyFeeRepository monthlyFees,
            ClassService classService,
            ClassSessionRepository sessions,
            AttendanceRepository attendances,
            PaymentRepository payments
    ) {
        this.enrollments = enrollments;
        this.students = students;
        this.classes = classes;
        this.users = users;
        this.monthlyFees = monthlyFees;
        this.classService = classService;
        this.sessions = sessions;
        this.attendances = attendances;
        this.payments = payments;
    }

    public record EnrollmentRequest(
            Long studentId,
            Long classId,
            BigDecimal discountRate,
            LocalDate enrollDate,
            String status,
            Integer totalSessions
    ) {
    }

    public List<Map<String, Object>> listEnrollments() {
        return enrollments.findAll().stream().map(this::toMap).toList();
    }

    @Transactional
    public Map<String, Object> createEnrollment(EnrollmentRequest request) {
        ClassEntity classEntity = validateReferences(request.studentId(), request.classId());
        if (!"OPEN".equals(classEntity.status)) {
            throw new IllegalArgumentException("Class is not open for enrollment");
        }
        long activeCount = enrollments.countByClassIdAndStatus(request.classId(), "ACTIVE");
        if (classEntity.maxStudents != null && classEntity.maxStudents > 0 && activeCount >= classEntity.maxStudents) {
            throw new IllegalArgumentException("Class has reached maximum students");
        }

        Enrollment enrollment = enrollments.findByStudentIdAndClassId(request.studentId(), request.classId()).orElse(null);
        if (enrollment != null) {
            if ("ACTIVE".equals(enrollment.status)) {
                throw new IllegalArgumentException("Student already enrolled in this class");
            } else if ("DROPPED".equals(enrollment.status)) {
                enrollment.status = isBlank(request.status()) ? "ACTIVE" : request.status();
                enrollment.discountRate = defaultRate(request.discountRate());
                enrollment.enrollDate = request.enrollDate() == null ? LocalDate.now() : request.enrollDate();
                Enrollment saved = enrollments.save(enrollment);
                generateMonthlyFee(saved, request.totalSessions() == null ? 0 : request.totalSessions());
                return toMap(saved);
            } else {
                throw new IllegalArgumentException("Student enrollment has status: " + enrollment.status);
            }
        }

        Enrollment newEnrollment = new Enrollment();
        newEnrollment.studentId = request.studentId();
        newEnrollment.classId = request.classId();
        newEnrollment.discountRate = defaultRate(request.discountRate());
        newEnrollment.enrollDate = request.enrollDate() == null ? LocalDate.now() : request.enrollDate();
        newEnrollment.status = isBlank(request.status()) ? "ACTIVE" : request.status();
        Enrollment saved = enrollments.save(newEnrollment);
        generateMonthlyFee(saved, request.totalSessions() == null ? 0 : request.totalSessions());
        return toMap(saved);
    }

    @Transactional
    public Map<String, Object> updateEnrollment(Long id, EnrollmentRequest request) {
        Enrollment enrollment = requireEnrollment(id);
        validateReferences(request.studentId() == null ? enrollment.studentId : request.studentId(), request.classId() == null ? enrollment.classId : request.classId());

        enrollment.studentId = request.studentId() == null ? enrollment.studentId : request.studentId();
        enrollment.classId = request.classId() == null ? enrollment.classId : request.classId();
        BigDecimal oldDiscount = enrollment.discountRate;
        enrollment.discountRate = request.discountRate() == null ? enrollment.discountRate : request.discountRate();
        enrollment.enrollDate = request.enrollDate() == null ? enrollment.enrollDate : request.enrollDate();
        enrollment.status = isBlank(request.status()) ? enrollment.status : request.status();
        Enrollment saved = enrollments.save(enrollment);

        if (oldDiscount == null || saved.discountRate.compareTo(oldDiscount) != 0) {
            recalculateUnpaidFeesForEnrollment(saved);
        }
        return toMap(saved);
    }

    @Transactional
    public MonthlyFee generateMonthlyFee(Enrollment enrollment, int totalSessions) {
        LocalDate date = enrollment.enrollDate == null ? LocalDate.now() : enrollment.enrollDate;
        return monthlyFees.findByEnrollmentIdAndMonthAndYear(enrollment.id, date.getMonthValue(), date.getYear())
                .orElseGet(() -> {
                    ClassEntity classEntity = classes.findById(enrollment.classId)
                            .orElseThrow(() -> new NotFoundException("Class not found: " + enrollment.classId));
                    MonthlyFee fee = new MonthlyFee();
                    fee.enrollmentId = enrollment.id;
                    fee.month = date.getMonthValue();
                    fee.year = date.getYear();
                    fee.totalSessions = totalSessions;
                    fee.dueDate = LocalDate.of(date.getYear(), date.getMonth(), date.lengthOfMonth());
                    fee.status = "UNPAID";
                    classService.applyAmounts(fee, classEntity.tuitionFee, enrollment.discountRate);
                    return monthlyFees.save(fee);
                });
    }

    @Transactional
    public int recalculateUnpaidFeesForEnrollment(Enrollment enrollment) {
        ClassEntity classEntity = classes.findById(enrollment.classId)
                .orElseThrow(() -> new NotFoundException("Class not found: " + enrollment.classId));
        int updated = 0;
        for (MonthlyFee fee : monthlyFees.findByEnrollmentIdAndStatusIn(enrollment.id, List.of("UNPAID"))) {
            classService.applyAmounts(fee, classEntity.tuitionFee, enrollment.discountRate);
            monthlyFees.save(fee);
            updated++;
        }
        return updated;
    }

    private ClassEntity validateReferences(Long studentId, Long classId) {
        if (studentId == null || !students.existsById(studentId)) {
            throw new NotFoundException("Student not found: " + studentId);
        }
        if (classId == null) {
            throw new NotFoundException("Class not found: " + classId);
        }
        return classes.findById(classId).orElseThrow(() -> new NotFoundException("Class not found: " + classId));
    }

    private Enrollment requireEnrollment(Long id) {
        return enrollments.findById(id).orElseThrow(() -> new NotFoundException("Enrollment not found: " + id));
    }

    private Map<String, Object> toMap(Enrollment enrollment) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", enrollment.id);
        map.put("studentId", enrollment.studentId);
        map.put("studentName", users.findById(enrollment.studentId).map(user -> user.fullName).orElse(null));
        map.put("classId", enrollment.classId);
        map.put("className", classes.findById(enrollment.classId).map(classEntity -> classEntity.className).orElse(null));
        map.put("discountRate", enrollment.discountRate);
        map.put("enrollDate", enrollment.enrollDate);
        map.put("status", enrollment.status);
        return map;
    }

    private BigDecimal defaultRate(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    @Transactional
    public void dropEnrollment(Long id) {
        Enrollment enrollment = requireEnrollment(id);

        // 1. Kiểm tra điều kiện: Chưa học buổi nào (PRESENT hoặc LATE)
        List<Long> sessionIds = sessions.findByClassIdOrderBySessionDateDescSessionNumberDesc(enrollment.classId)
                .stream().map(s -> s.id).toList();
        long presentCount = 0;
        if (!sessionIds.isEmpty()) {
            presentCount = attendances.findAll().stream()
                    .filter(a -> a.studentId.equals(enrollment.studentId) 
                            && sessionIds.contains(a.sessionId) 
                            && ("PRESENT".equals(a.status) || "LATE".equals(a.status)))
                    .count();
        }
        if (presentCount > 0) {
            throw new IllegalArgumentException("Học sinh này đã tham gia học, không thể xóa khỏi lớp!");
        }

        // 2. Xóa các bản ghi điểm danh khác nếu có (ví dụ: các bản ghi ABSENT)
        if (!sessionIds.isEmpty()) {
            List<Attendance> studentAtts = attendances.findAll().stream()
                    .filter(a -> a.studentId.equals(enrollment.studentId) && sessionIds.contains(a.sessionId))
                    .toList();
            attendances.deleteAll(studentAtts);
        }

        // 3. Xóa các thanh toán liên quan và học phí (để không bị mất học phí/không nợ phí)
        List<MonthlyFee> studentFees = monthlyFees.findByEnrollmentId(enrollment.id);
        for (MonthlyFee fee : studentFees) {
            List<Payment> feePayments = payments.findByFeeIdOrderByPaymentDateDesc(fee.id);
            if (!feePayments.isEmpty()) {
                payments.deleteAll(feePayments);
            }
        }
        monthlyFees.deleteAll(studentFees);

        // 4. Cập nhật trạng thái xóa mềm Enrollment sang DROPPED
        enrollment.status = "DROPPED";
        enrollments.save(enrollment);
    }
}
