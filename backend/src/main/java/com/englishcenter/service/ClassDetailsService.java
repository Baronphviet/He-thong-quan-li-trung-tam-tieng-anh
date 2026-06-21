package com.englishcenter.service;

import com.englishcenter.entity.Attendance;
import com.englishcenter.entity.ClassSession;
import com.englishcenter.entity.MonthlyFee;
import com.englishcenter.entity.StudentByClassView;
import com.englishcenter.entity.StudentParent;
import com.englishcenter.repository.AttendanceRepository;
import com.englishcenter.repository.ClassSessionRepository;
import com.englishcenter.repository.MonthlyFeeRepository;
import com.englishcenter.repository.PaymentRepository;
import com.englishcenter.repository.StudentByClassViewRepository;
import com.englishcenter.repository.StudentParentRepository;
import com.englishcenter.repository.UserRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class ClassDetailsService {
    private final ClassService classService;
    private final StudentByClassViewRepository studentsView;
    private final MonthlyFeeRepository fees;
    private final ClassSessionRepository sessions;
    private final AttendanceRepository attendances;
    private final StudentParentRepository studentParents;
    private final UserRepository users;
    private final PaymentRepository payments;

    public ClassDetailsService(ClassService classService, StudentByClassViewRepository studentsView,
                               MonthlyFeeRepository fees, ClassSessionRepository sessions,
                               AttendanceRepository attendances, StudentParentRepository studentParents,
                               UserRepository users, PaymentRepository payments) {
        this.classService = classService;
        this.studentsView = studentsView;
        this.fees = fees;
        this.sessions = sessions;
        this.attendances = attendances;
        this.studentParents = studentParents;
        this.users = users;
        this.payments = payments;
    }

    public Map<String, Object> getClassDetails(Long classId) {
        Map<String, Object> details = new LinkedHashMap<>(classService.getClass(classId));
        List<StudentByClassView> classStudents = studentsView.findByClassIdOrderByFullNameAsc(classId);
        List<Long> sessionIds = sessions.findByClassIdOrderBySessionDateDescSessionNumberDesc(classId)
                .stream().map(s -> s.id).toList();

        List<Map<String, Object>> studentDetails = new ArrayList<>();
        for (StudentByClassView student : classStudents) {
            Map<String, Object> sm = new LinkedHashMap<>();
            sm.put("studentId", student.studentId);
            sm.put("fullName", student.fullName);
            sm.put("phone", student.phone);
            sm.put("enrollmentId", student.enrollmentId);
            sm.put("status", student.status);
            sm.put("discountRate", student.discountRate);

            // Fee status
            List<MonthlyFee> studentFees = fees.findByEnrollmentId(student.enrollmentId);
            long unpaidCount = studentFees.stream().filter(f -> !"PAID".equals(f.status)).count();
            BigDecimal unpaidAmount = BigDecimal.ZERO;
            for (MonthlyFee f : studentFees) {
                if (!"PAID".equals(f.status)) {
                    BigDecimal paid = payments.sumPaidByFeeId(f.id);
                    if (paid == null) paid = BigDecimal.ZERO;
                    unpaidAmount = unpaidAmount.add(f.finalAmount.subtract(paid));
                }
            }
            sm.put("unpaidFeeCount", unpaidCount);
            sm.put("unpaidAmount", unpaidAmount);

            // Attendance stats
            long present = 0, absent = 0, late = 0;
            List<Attendance> studentAtts = attendances.findByStudentIdOrderBySessionIdDesc(student.studentId)
                    .stream().filter(a -> sessionIds.contains(a.sessionId)).toList();
            for (Attendance a : studentAtts) {
                if ("PRESENT".equals(a.status)) present++;
                else if ("ABSENT".equals(a.status)) absent++;
                else if ("LATE".equals(a.status)) late++;
            }
            sm.put("presentCount", present);
            sm.put("absentCount", absent);
            sm.put("lateCount", late);

            // Parents info
            List<StudentParent> sps = studentParents.findByIdStudentId(student.studentId);
            List<String> parentNames = new ArrayList<>();
            for (StudentParent sp : sps) {
                users.findById(sp.id.parentId).ifPresent(u -> parentNames.add(u.fullName + " (" + u.phone + ")"));
            }
            sm.put("parents", String.join(", ", parentNames));

            studentDetails.add(sm);
        }
        details.put("students", studentDetails);
        return details;
    }
}
