package com.englishcenter.service;

import com.englishcenter.entity.Announcement;
import com.englishcenter.exception.NotFoundException;
import com.englishcenter.repository.AnnouncementRepository;
import com.englishcenter.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnnouncementService {
    private final AnnouncementRepository announcements;
    private final UserRepository users;

    public AnnouncementService(AnnouncementRepository announcements, UserRepository users) {
        this.announcements = announcements;
        this.users = users;
    }

    public record AnnouncementRequest(
            String title,
            String content,
            String imageUrl,
            String type,
            LocalDate startDate,
            LocalDate endDate,
            Boolean active,
            Long createdBy) {
    }

    public List<Announcement> listAll() {
        return announcements.findAllByOrderByCreatedAtDesc();
    }

    public List<Announcement> listActive() {
        return announcements.findActiveForDate(LocalDate.now());
    }

    public List<Announcement> listSlider() {
        return announcements.findActiveForDate(LocalDate.now()).stream()
                .filter(item -> item.imageUrl != null && !item.imageUrl.isBlank())
                .filter(item -> "SLIDER".equalsIgnoreCase(item.type) || "BANNER".equalsIgnoreCase(item.type))
                .toList();
    }

    @Transactional
    public Announcement save(Long id, AnnouncementRequest request) {
        Announcement announcement = id == null ? new Announcement()
                : announcements.findById(id)
                        .orElseThrow(() -> new NotFoundException("Announcement not found: " + id));
        if (isBlank(request.title())) {
            throw new IllegalArgumentException("title is required");
        }
        Long createdBy = request.createdBy() == null ? 1L : request.createdBy();
        if (!users.existsById(createdBy)) {
            throw new NotFoundException("Creator not found: " + createdBy);
        }

        announcement.title = request.title().trim();
        announcement.content = request.content();
        announcement.imageUrl = request.imageUrl();
        announcement.type = isBlank(request.type()) ? "BANNER" : request.type();
        announcement.startDate = request.startDate();
        announcement.endDate = request.endDate();

        // ── XÓA DÒNG CŨ: announcement.active = request.active() != null &&
        // request.active(); ──
        // ── THAY BẰNG LÒGIC MỚI DƯỚI ĐÂY
        // ──────────────────────────────────────────────────
        if (id != null && !announcement.active && (request.active() == null || request.active())) {
            // Nếu là cập nhật (id != null) VÀ banner cũ đang tắt (INACTIVE)
            // VÀ request gửi lên muốn bật lại (active = true hoặc không truyền lên)
            announcement.active = true;

            // ĐỒNG THỜI: Reset hoặc gia hạn ngày kết thúc nếu ngày cũ đã bị quá hạn (Past
            // Date)
            if (announcement.endDate != null && announcement.endDate.isBefore(LocalDate.now())) {
                announcement.endDate = LocalDate.now().plusDays(7); // Tự động gia hạn thêm 7 ngày hoặc chỉnh tùy ý bạn
            }
        } else {
            // Các trường hợp tạo mới hoặc cập nhật thông thường khác
            announcement.active = request.active() != null ? request.active() : true;
        }

        announcement.createdBy = createdBy;
        return announcements.save(announcement);
    }

    @Transactional
    public void deactivate(Long id) {
        Announcement announcement = announcements.findById(id)
                .orElseThrow(() -> new NotFoundException("Announcement not found: " + id));
        announcement.active = false;
        announcements.save(announcement);
    }

    @Transactional
    public void activate(Long id) {
        Announcement announcement = announcements.findById(id)
                .orElseThrow(() -> new NotFoundException("Announcement not found: " + id));
        announcement.active = true;
        if (announcement.endDate != null && announcement.endDate.isBefore(LocalDate.now())) {
            announcement.endDate = LocalDate.now().plusDays(7);
        }
        announcements.save(announcement);
    }

    @Transactional
    public void delete(Long id) {
        if (!announcements.existsById(id)) {
            throw new NotFoundException("Announcement not found: " + id);
        }
        announcements.deleteById(id);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
