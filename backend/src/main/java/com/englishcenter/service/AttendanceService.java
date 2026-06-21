package com.englishcenter.service;

import com.englishcenter.entity.Attendance;
import com.englishcenter.entity.ClassEntity;
import com.englishcenter.entity.ClassSession;
import com.englishcenter.entity.Enrollment;
import com.englishcenter.exception.NotFoundException;
import com.englishcenter.repository.AttendanceRepository;
import com.englishcenter.repository.ClassRepository;
import com.englishcenter.repository.ClassSessionRepository;
import com.englishcenter.repository.EnrollmentRepository;
import com.englishcenter.repository.UserRepository;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttendanceService {
    private final ClassSessionRepository sessions;
    private final AttendanceRepository attendances;
    private final ClassRepository classes;
    private final EnrollmentRepository enrollments;
    private final UserRepository users;
    // 1. Inject EmailService vào đây
    private final EmailService emailService;

    public AttendanceService(
            ClassSessionRepository sessions,
            AttendanceRepository attendances,
            ClassRepository classes,
            EnrollmentRepository enrollments,
            UserRepository users,
            EmailService emailService // 2. Thêm vào Constructor
    ) {
        this.sessions = sessions;
        this.attendances = attendances;
        this.classes = classes;
        this.enrollments = enrollments;
        this.users = users;
        this.emailService = emailService;
    }

    public record SessionRequest(
            LocalDate sessionDate,
            Integer sessionNumber,
            String note,
            Long createdBy
    ) {
    }

    public record AttendanceItemRequest(
            Long studentId,
            String status,
            String note
    ) {
    }

    public List<Map<String, Object>> listSessions(Long classId) {
        requireClass(classId);
        return sessions.findByClassIdOrderBySessionDateDescSessionNumberDesc(classId)
                .stream()
                .map(this::sessionMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> createSession(Long classId, SessionRequest request) {
        ClassEntity classEntity = requireClass(classId);
        if (!"OPEN".equals(classEntity.status)) {
            throw new IllegalArgumentException("Cannot create session for a closed class");
        }

        LocalDate sessionDate = request.sessionDate() == null ? LocalDate.now() : request.sessionDate();
        Integer sessionNumber = request.sessionNumber();
        if (sessionNumber == null) {
            sessionNumber = sessions.findTopByClassIdOrderBySessionNumberDesc(classId)
                    .map(session -> session.sessionNumber + 1)
                    .orElse(1);
        }

        sessions.findByClassIdAndSessionDateAndSessionNumber(classId, sessionDate, sessionNumber).ifPresent(existing -> {
            throw new IllegalArgumentException("Session already exists for this class/date/number");
        });

        ClassSession session = new ClassSession();
        session.classId = classId;
        session.sessionDate = sessionDate;
        session.sessionNumber = sessionNumber;
        session.note = request.note();
        session.createdBy = request.createdBy() == null ? 1L : request.createdBy();
        return sessionMap(sessions.save(session));
    }

    public List<Map<String, Object>> attendanceSheet(Long sessionId) {
        ClassSession session = requireSession(sessionId);
        List<Enrollment> activeEnrollments = enrollments.findByClassIdAndStatus(session.classId, "ACTIVE");
        Map<Long, Attendance> byStudent = new LinkedHashMap<>();
        for (Attendance attendance : attendances.findBySessionId(sessionId)) {
            byStudent.put(attendance.studentId, attendance);
        }

        return activeEnrollments.stream().map(enrollment -> {
            Attendance attendance = byStudent.get(enrollment.studentId);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("attendanceId", attendance == null ? null : attendance.id);
            row.put("studentId", enrollment.studentId);
            row.put("studentName", users.findById(enrollment.studentId).map(user -> user.fullName).orElse(null));
            row.put("status", attendance == null ? null : attendance.status);
            row.put("note", attendance == null ? null : attendance.note);
            return row;
        }).toList();
    }

    @Transactional
    public List<Map<String, Object>> saveAttendance(Long sessionId, List<AttendanceItemRequest> items) {
        ClassSession session = requireSession(sessionId); // Lấy session ra để lấy thông tin ngày học và classId
        ClassEntity classEntity = requireClass(session.classId); // Lấy thông tin tên lớp học

        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("attendance items are required");
        }

        for (AttendanceItemRequest item : items) {
            if (item.studentId() == null) {
                throw new IllegalArgumentException("studentId is required");
            }
            String status = normalizeStatus(item.status());
            
            Attendance attendance = attendances.findBySessionIdAndStudentId(sessionId, item.studentId())
                    .orElseGet(() -> {
                        Attendance created = new Attendance();
                        created.sessionId = sessionId;
                        created.studentId = item.studentId();
                        return created;
                    });
            
            attendance.status = status;
            attendance.note = item.note();
            attendances.save(attendance);

            // 3. Logic gửi Email kiểm tra nếu Học viên VẮNG MẶT (ABSENT)
            if ("ABSENT".equals(status)) {
                users.findById(item.studentId()).ifPresent(student -> {
                    if (student.email != null && !student.email.isBlank()) {
                        String subject = "Thông báo vắng học - Lớp " + classEntity.className;
                        
                        // Nội dung viết bằng mã HTML giúp hiển thị chuyên nghiệp
                        String content = String.format(
                            "<h3>Thông báo từ Trung tâm Tiếng Anh</h3>" +
                            "<p>Chào bạn <b>%s</b>,</p>" +
                            "<p>Hệ thống ghi nhận bạn đã <b>VẮNG MẶT</b> trong buổi học ngày %s (Buổi số %d) của lớp <b>%s</b>.</p>" +
                            "<p>Nếu có bất kỳ nhầm lẫn nào hoặc cần xin phép nghỉ bù, vui lòng liên hệ sớm với bộ phận Giáo vụ của Trung tâm nhé.</p>" +
                            "<br><p>Thân ái,</p><p>Ban quản trị Trung tâm Tiếng Anh.</p>",
                            student.fullName,
                            session.sessionDate.toString(),
                            session.sessionNumber,
                            classEntity.className
                        );
                        
                        // Gọi hàm gửi mail chạy ngầm (Async) đã viết
                        emailService.sendEmail(student.email, subject, content);
                    }
                });
            }
        }

        return attendanceSheet(sessionId);
    }

    public List<Map<String, Object>> studentAttendanceHistory(Long studentId) {
        if (!users.existsById(studentId)) {
            throw new NotFoundException("Student not found: " + studentId);
        }

        return attendances.findByStudentIdOrderBySessionIdDesc(studentId).stream().map(attendance -> {
            ClassSession session = sessions.findById(attendance.sessionId).orElse(null);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("attendanceId", attendance.id);
            row.put("sessionId", attendance.sessionId);
            row.put("studentId", attendance.studentId);
            row.put("studentName", users.findById(attendance.studentId).map(u -> u.fullName).orElse(null));
            row.put("status", attendance.status);
            row.put("note", attendance.note);
            if (session != null) {
                row.put("sessionDate", session.sessionDate);
                row.put("sessionNumber", session.sessionNumber);
                row.put("sessionTopic", session.note); // Adding sessionTopic here as well, since they might want to use it or not
                row.put("classId", session.classId);
                row.put("className", classes.findById(session.classId).map(classEntity -> classEntity.className).orElse(null));
            }
            return row;
        }).toList();
    }

    private ClassEntity requireClass(Long classId) {
        return classes.findById(classId).orElseThrow(() -> new NotFoundException("Class not found: " + classId));
    }

    private ClassSession requireSession(Long sessionId) {
        return sessions.findById(sessionId).orElseThrow(() -> new NotFoundException("Session not found: " + sessionId));
    }

    private Map<String, Object> sessionMap(ClassSession session) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", session.id);
        map.put("classId", session.classId);
        map.put("className", classes.findById(session.classId).map(classEntity -> classEntity.className).orElse(null));
        map.put("sessionDate", session.sessionDate);
        map.put("sessionNumber", session.sessionNumber);
        map.put("note", session.note);
        map.put("createdBy", session.createdBy);
        map.put("createdByName", session.createdBy == null ? null : users.findById(session.createdBy).map(user -> user.fullName).orElse(null));
        return map;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "PRESENT";
        }
        String normalized = status.trim().toUpperCase();
        if (!List.of("PRESENT", "ABSENT", "LATE").contains(normalized)) {
            throw new IllegalArgumentException("Invalid attendance status: " + status);
        }
        return normalized;
    }
}