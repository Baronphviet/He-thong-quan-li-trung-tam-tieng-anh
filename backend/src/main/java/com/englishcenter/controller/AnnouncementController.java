package com.englishcenter.controller;

import com.englishcenter.entity.Announcement;
import com.englishcenter.service.AnnouncementService;
import com.englishcenter.service.AnnouncementService.AnnouncementRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AnnouncementController {
    private final AnnouncementService service;

    public AnnouncementController(AnnouncementService service) {
        this.service = service;
    }

    @GetMapping("/announcements")
    public List<Announcement> listAll() {
        return service.listAll();
    }

    @GetMapping("/public/announcements")
    public List<Announcement> listActive() {
        return service.listActive();
    }

    @PostMapping("/announcements")
    public Announcement create(@RequestBody AnnouncementRequest request) {
        return service.save(null, request);
    }

    @PutMapping("/announcements/{id}")
    public Announcement update(@PathVariable Long id, @RequestBody AnnouncementRequest request) {
        return service.save(id, request);
    }

    @DeleteMapping("/announcements/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        service.deactivate(id);
    }
}
