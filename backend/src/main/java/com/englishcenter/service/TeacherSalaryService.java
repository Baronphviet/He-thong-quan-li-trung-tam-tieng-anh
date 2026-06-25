package com.englishcenter.service;

import com.englishcenter.entity.TeacherProfile;
import com.englishcenter.entity.TeacherSalary;
import com.englishcenter.entity.UserAccount;
import com.englishcenter.repository.TeacherRepository;
import com.englishcenter.repository.TeacherSalaryRepository;
import com.englishcenter.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeacherSalaryService {
    private final TeacherSalaryRepository salaries;
    private final TeacherRepository teacherProfiles;
    private final UserRepository users;
    private final EmailService emailService;

    public TeacherSalaryService(TeacherSalaryRepository salaries, TeacherRepository teacherProfiles, UserRepository users, EmailService emailService) {
        this.salaries = salaries;
        this.teacherProfiles = teacherProfiles;
        this.users = users;
        this.emailService = emailService;
    }

    public record SalaryRequest(
            Long teacherId,
            Integer month,
            Integer year,
            Integer totalSessions,
            BigDecimal amount,
            String status,
            String note
    ) {}

    public List<Map<String, Object>> getSalariesByMonth(Integer month, Integer year) {
        List<Map<String, Object>> result = new ArrayList<>();
        List<TeacherProfile> teachers = teacherProfiles.findAll();
        List<TeacherSalary> existingSalaries = salaries.findByMonthAndYear(month, year);

        for (TeacherProfile teacher : teachers) {
            Map<String, Object> map = new LinkedHashMap<>();
            UserAccount user = users.findById(teacher.id).orElse(null);
            if (user == null || !user.active) continue;

            TeacherSalary salary = existingSalaries.stream()
                    .filter(s -> s.teacherId.equals(teacher.id))
                    .findFirst()
                    .orElse(null);

            map.put("teacherId", teacher.id);
            map.put("teacherName", user.fullName);
            map.put("salaryRate", teacher.salaryRate);
            map.put("month", month);
            map.put("year", year);

            if (salary != null) {
                map.put("salaryId", salary.id);
                map.put("totalSessions", salary.totalSessions);
                map.put("amount", salary.amount);
                map.put("paidDate", salary.paidDate);
                map.put("status", salary.status);
                map.put("note", salary.note);
            } else {
                map.put("salaryId", null);
                map.put("totalSessions", 0);
                map.put("amount", BigDecimal.ZERO);
                map.put("paidDate", null);
                map.put("status", "PENDING");
                map.put("note", null);
            }
            result.add(map);
        }
        return result;
    }

    public List<Map<String, Object>> getSalariesByTeacher(Long teacherId) {
        return salaries.findByTeacherIdOrderByYearDescMonthDesc(teacherId).stream().map(salary -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("salaryId", salary.id);
            map.put("month", salary.month);
            map.put("year", salary.year);
            map.put("totalSessions", salary.totalSessions);
            map.put("amount", salary.amount);
            map.put("paidDate", salary.paidDate);
            map.put("status", salary.status);
            map.put("note", salary.note);
            return map;
        }).toList();
    }

    @Transactional
    public void saveSalary(SalaryRequest req) {
        TeacherSalary salary = salaries.findByTeacherIdAndMonthAndYear(req.teacherId(), req.month(), req.year())
                .orElseGet(() -> {
                    TeacherSalary s = new TeacherSalary();
                    s.teacherId = req.teacherId();
                    s.month = req.month();
                    s.year = req.year();
                    return s;
                });

        boolean isNewlyPaid = "PAID".equals(req.status()) && (salary.id == null || !"PAID".equals(salary.status));

        salary.totalSessions = req.totalSessions() == null ? 0 : req.totalSessions();
        salary.amount = req.amount() == null ? BigDecimal.ZERO : req.amount();
        salary.note = req.note();
        salary.status = req.status() == null ? "PENDING" : req.status();

        if ("PAID".equals(salary.status) && salary.paidDate == null) {
            salary.paidDate = LocalDate.now();
        } else if ("PENDING".equals(salary.status)) {
            salary.paidDate = null;
        }

        TeacherSalary saved = salaries.save(salary);

        if (isNewlyPaid) {
            try {
                sendSalaryPaidEmail(saved);
            } catch (Exception e) {
                System.err.println("❌ Lỗi kích hoạt gửi email lương giáo viên: " + e.getMessage());
            }
        }
    }

    private void sendSalaryPaidEmail(TeacherSalary salary) {
        UserAccount teacherUser = users.findById(salary.teacherId).orElse(null);
        if (teacherUser == null || teacherUser.email == null || teacherUser.email.trim().isEmpty()) {
            return;
        }

        String paidDateStr = salary.paidDate != null 
            ? salary.paidDate.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"))
            : java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        String subject = "[Trung tâm Anh ngữ] Thông báo thanh toán lương tháng " + salary.month + "/" + salary.year;

        String noteDisplay = salary.note != null && !salary.note.trim().isEmpty() ? salary.note : "Không có";

        String content = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dddddd; border-radius: 8px;">
                <h3 style="color: #1e3a8a; text-align: center;">THÔNG BÁO THANH TOÁN LƯƠNG</h3>
                <p>Xin chào thầy/cô <strong>%s</strong>,</p>
                <p>Trung tâm Anh ngữ xin thông báo lương tháng <strong>%d/%d</strong> của thầy/cô đã được thanh toán thành công. Chi tiết như sau:</p>
                
                <table style="width: 100%%; border-collapse: collapse; margin: 15px 0;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd; width: 35%%; font-weight: bold;">Họ và tên:</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd; font-weight: bold;">Kỳ lĩnh lương:</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">Tháng %d/%d</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd; font-weight: bold;">Số buổi dạy:</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">%d buổi</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd; font-weight: bold;">Tổng số tiền nhận:</td>
                        <td style="padding: 8px; border: 1px solid #dddddd; font-weight: bold; color: #1e3a8a;">%,.0f VND</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd; font-weight: bold;">Ngày thanh toán:</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd; font-weight: bold;">Ghi chú:</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">%s</td>
                    </tr>
                </table>
                
                <p>Nếu có bất kỳ thắc mắc nào về bảng lương này, thầy/cô vui lòng liên hệ trực tiếp với bộ phận kế toán của trung tâm.</p>
                <p>Trân trọng cảm ơn những đóng góp của thầy/cô đối với trung tâm!</p>
                <hr style="border: none; border-top: 1px solid #eeeeee; margin-top: 20px;" />
                <p style="font-size: 12px; color: #888888; text-align: center;">Đây là email tự động từ hệ thống, vui lòng không phản hồi thư này.</p>
            </div>
            """.formatted(
                teacherUser.fullName,
                salary.month,
                salary.year,
                teacherUser.fullName,
                salary.month,
                salary.year,
                salary.totalSessions,
                salary.amount.doubleValue(),
                paidDateStr,
                noteDisplay
            );

        emailService.sendEmail(teacherUser.email, subject, content);
    }
}
