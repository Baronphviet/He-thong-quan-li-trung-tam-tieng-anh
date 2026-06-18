package com.englishcenter.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    // Tự động đọc cấu hình từ file application.yml của bạn
    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async // Gửi email bất đồng bộ để không làm chậm ứng dụng web
    public void sendEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                message, 
                MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, 
                StandardCharsets.UTF_8.name()
            );

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true); // true nghĩa là cho phép gửi nội dung dạng HTML (chữ đậm, màu sắc, link...)
            helper.setFrom(fromEmail, fromName);

            mailSender.send(message);
            System.out.println("👉 Email đã được gửi thành công tới: " + to);
        } catch (Exception e) {
            System.err.println("❌ Lỗi gửi email: " + e.getMessage());
        }
    }
}