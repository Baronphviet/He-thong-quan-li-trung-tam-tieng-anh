package com.englishcenter.service;

import com.englishcenter.entity.AgeGroup;
import com.englishcenter.entity.ClassEntity;
import com.englishcenter.entity.Enrollment;
import com.englishcenter.entity.MonthlyFee;
import com.englishcenter.entity.UserAccount;
import com.englishcenter.exception.NotFoundException;
import com.englishcenter.repository.AcademicYearRepository;
import com.englishcenter.repository.AgeGroupRepository;
import com.englishcenter.repository.ClassRepository;
import com.englishcenter.repository.EnrollmentRepository;
import com.englishcenter.repository.MonthlyFeeRepository;
import com.englishcenter.repository.TeacherRepository;
import com.englishcenter.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClassService {
    private final ClassRepository classes;
    private final AcademicYearRepository academicYears;
    private final AgeGroupRepository ageGroups;
    private final TeacherRepository teachers;
    private final UserRepository users;
    private final EnrollmentRepository enrollments;
    private final MonthlyFeeRepository monthlyFees;

    public ClassService(
            ClassRepository classes,
            AcademicYearRepository academicYears,
            AgeGroupRepository ageGroups,
            TeacherRepository teachers,
            UserRepository users,
            EnrollmentRepository enrollments,
            MonthlyFeeRepository monthlyFees
    ) {
        this.classes = classes;
        this.academicYears = academicYears;
        this.ageGroups = ageGroups;
        this.teachers = teachers;
        this.users = users;
        this.enrollments = enrollments;
        this.monthlyFees = monthlyFees;
    }

    public record ClassRequest(
            String className,
            Long ageGroupId,
            Long academicYearId,
            Long teacherId,
            Integer maxStudents,
            String schedule,
            BigDecimal tuitionFee,
            String status
    ) {
    }

    public List<Map<String, Object>> listClasses() {
        return classes.findAllByOrderByCreatedAtDesc().stream().map(this::toMap).toList();
    }

    public Map<String, Object> getClass(Long id) {
        return toMap(requireClass(id));
    }

    @Transactional
    public Map<String, Object> createClass(ClassRequest request) {
        validateClassReferences(request);
        ClassEntity entity = new ClassEntity();
        apply(entity, request);
        return toMap(classes.save(entity));
    }

    @Transactional
    public Map<String, Object> updateClass(Long id, ClassRequest request) {
        ClassEntity entity = requireClass(id);
        validateClassReferences(request);
        BigDecimal oldFee = entity.tuitionFee;
        apply(entity, request);
        ClassEntity saved = classes.save(entity);
        if (oldFee == null || request.tuitionFee() == null || oldFee.compareTo(request.tuitionFee()) != 0) {
            recalculateUnpaidFeesForClass(saved.id);
        }
        return toMap(saved);
    }

    @Transactional
    public void closeClass(Long id) {
        ClassEntity entity = requireClass(id);
        entity.status = "CLOSED";
        classes.save(entity);
    }

    @Transactional
    public int recalculateUnpaidFeesForClass(Long classId) {
        ClassEntity classEntity = requireClass(classId);
        int updated = 0;
        for (Enrollment enrollment : enrollments.findByClassId(classId)) {
            for (MonthlyFee fee : monthlyFees.findByEnrollmentIdAndStatusIn(enrollment.id, List.of("UNPAID"))) {
                applyAmounts(fee, classEntity.tuitionFee, enrollment.discountRate);
                monthlyFees.save(fee);
                updated++;
            }
        }
        return updated;
    }

    public void applyAmounts(MonthlyFee fee, BigDecimal tuitionFee, BigDecimal discountRate) {
        BigDecimal original = money(tuitionFee);
        BigDecimal discount = original.multiply(rate(discountRate)).setScale(2, RoundingMode.HALF_UP);
        fee.originalAmount = original;
        fee.discountAmount = discount;
        fee.finalAmount = original.subtract(discount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    private void apply(ClassEntity entity, ClassRequest request) {
        if (isBlank(request.className())) {
            throw new IllegalArgumentException("className is required");
        }
        entity.className = request.className().trim();
        entity.ageGroupId = request.ageGroupId();
        entity.academicYearId = request.academicYearId();
        entity.teacherId = request.teacherId();
        entity.maxStudents = request.maxStudents() == null ? 0 : request.maxStudents();
        entity.schedule = request.schedule();
        entity.tuitionFee = money(request.tuitionFee());
        entity.status = isBlank(request.status()) ? "OPEN" : request.status();
    }

    private void validateClassReferences(ClassRequest request) {
        if (request.ageGroupId() == null || !ageGroups.existsById(request.ageGroupId())) {
            throw new NotFoundException("Age group not found: " + request.ageGroupId());
        }
        if (request.academicYearId() == null || !academicYears.existsById(request.academicYearId())) {
            throw new NotFoundException("Academic year not found: " + request.academicYearId());
        }
        if (request.teacherId() != null && !teachers.existsById(request.teacherId())) {
            throw new NotFoundException("Teacher not found: " + request.teacherId());
        }
    }

    private ClassEntity requireClass(Long id) {
        return classes.findById(id).orElseThrow(() -> new NotFoundException("Class not found: " + id));
    }

    private Map<String, Object> toMap(ClassEntity entity) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", entity.id);
        map.put("className", entity.className);
        map.put("ageGroupId", entity.ageGroupId);
        map.put("ageGroupName", ageGroups.findById(entity.ageGroupId).map(group -> group.groupName).orElse(null));
        map.put("academicYearId", entity.academicYearId);
        map.put("academicYearName", academicYears.findById(entity.academicYearId).map(year -> year.yearName).orElse(null));
        map.put("teacherId", entity.teacherId);
        map.put("teacherName", entity.teacherId == null ? null : users.findById(entity.teacherId).map(user -> user.fullName).orElse(null));
        map.put("maxStudents", entity.maxStudents);
        map.put("schedule", entity.schedule);
        map.put("tuitionFee", entity.tuitionFee);
        map.put("status", entity.status);
        map.put("createdAt", entity.createdAt);
        map.put("updatedAt", entity.updatedAt);
        return map;
    }

    private BigDecimal money(BigDecimal value) {
        return value == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : value.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal rate(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
