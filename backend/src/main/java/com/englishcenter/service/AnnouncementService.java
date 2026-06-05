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
            Long createdBy
    ) {
    }

    public List<Announcement> listAll() {
        return announcements.findAllByOrderByCreatedAtDesc();
    }

    public List<Announcement> listActive() {
        return announcements.findActiveForDate(LocalDate.now());
    }

    @Transactional
    public Announcement save(Long id, AnnouncementRequest request) {
        Announcement announcement = id == null ? new Announcement() : announcements.findById(id)
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
        announcement.active = request.active() != null && request.active();
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

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
