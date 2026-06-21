package com.englishcenter.controller;

import com.englishcenter.service.EmailService;
import com.englishcenter.repository.StudentParentRepository; // Import đúng repository trung gian
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/email")
@CrossOrigin(origins = "http://localhost:3000")
public class EmailController {

    private final EmailService emailService;
    private final StudentParentRepository studentParentRepository; // Đổi sang repository trung gian

    // Constructor injection
    public EmailController(EmailService emailService, StudentParentRepository studentParentRepository) {
        this.emailService = emailService;
        this.studentParentRepository = studentParentRepository;
    }

    @PostMapping("/send-custom")
    public ResponseEntity<?> sendCustomEmail(@RequestBody Map<String, String> request) {
        String toEmail = request.get("to");
        String subject = request.get("subject");
        String content = request.get("content");
        emailService.sendEmail(toEmail, subject, content);
        return ResponseEntity.ok(Map.of("message", "Email đang được gửi ngầm hệ thống!"));
    }

    @PostMapping("/send-bulk")
    public ResponseEntity<?> sendBulkEmail(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> emails = (List<String>) request.get("emails");
        String subject = (String) request.get("subject");
        String content = (String) request.get("content");

        if (emails == null || emails.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Danh sách email nhận trống!"));
        }

        for (String toEmail : emails) {
            emailService.sendEmail(toEmail, subject, content);
        }
        return ResponseEntity.ok(Map.of("message", "Đã kích hoạt lệnh gửi email đồng loạt!"));
    }

    // ========================================================
    // API XỬ LÝ CHUYÊN BIỆT: 3 LOẠI THÔNG BÁO CHO PHỤ HUYNH
    // ========================================================
    @PostMapping("/send-parent-notify")
    public ResponseEntity<?> sendParentNotify(@RequestBody Map<String, Object> request) {
        String type = (String) request.get("type");
        
        if (type == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Loại thông báo không hợp lệ!"));
        }

        switch (type) {
            case "DEBT_ABSENT": // Loại 1: Số buổi vắng + học phí (Nhập tay trực tiếp nhóm email từ Form)
                @SuppressWarnings("unchecked")
                List<String> emails = (List<String>) request.get("emails");
                String subjectDebt = (String) request.get("subject");
                String contentDebt = (String) request.get("content");

                if (emails == null || emails.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Danh sách Email phụ huynh trống!"));
                }

                for (String email : emails) {
                    emailService.sendEmail(email, subjectDebt, contentDebt);
                }
                return ResponseEntity.ok(Map.of("message", "Đã kích hoạt gửi thông báo công nợ tới " + emails.size() + " phụ huynh!"));

            case "CLASS_OFF": // Loại 2: Tự động truy vấn quét DB tìm phụ huynh theo Lớp học
                String classId = (String) request.get("classId");
                String subjectOff = (String) request.get("subject");
                String contentOff = (String) request.get("content");

                // ĐỒNG BỘ: Gọi đúng tên hàm mới trả về List<Object[]> chứa cả Email và Tên học viên
                List<Object[]> dataList = studentParentRepository.findParentEmailsAndStudentNamesByClassId(classId);

                if (dataList == null || dataList.isEmpty()) {
                    return ResponseEntity.ok(Map.of("message", "Lớp " + classId + " chưa có thông tin dữ liệu phụ huynh hoặc học viên!"));
                }

                // Tiến hành duyệt danh sách để gửi mail cá nhân hóa
                for (Object[] row : dataList) {
                    String parentEmail = (String) row[0];
                    String studentName = (String) row[1];

                    // Tự động chèn tên học viên một cách rõ ràng ở đầu nội dung thư gửi phụ huynh
                    String personalizedContent = "<h3>Học viên: " + studentName + "</h3>" + contentOff;

                    emailService.sendEmail(parentEmail, subjectOff, personalizedContent);
                }
                
                return ResponseEntity.ok(Map.of("message", "Đã kích hoạt gửi mail thông báo tới " + dataList.size() + " phụ huynh của lớp " + classId));

            case "CUSTOM_EMAIL": // Loại 3: Gửi email tự do
                @SuppressWarnings("unchecked")
                List<String> customEmails = (List<String>) request.get("emails");
                String customSubject = (String) request.get("subject");
                String customContent = (String) request.get("content");

                if (customEmails == null || customEmails.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Danh sách Email nhận trống!"));
                }

                for (String email : customEmails) {
                    emailService.sendEmail(email, customSubject, customContent);
                }
                
                return ResponseEntity.ok(Map.of("message", "Đã gửi email thành công tới " + customEmails.size() + " địa chỉ!"));

            default:
                return ResponseEntity.badRequest().body(Map.of("message", "Nghiệp vụ không được hỗ trợ!"));
        }
    }
}