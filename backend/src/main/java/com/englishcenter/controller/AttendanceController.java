package com.englishcenter.controller;

import com.englishcenter.service.AttendanceService;
import com.englishcenter.service.AttendanceService.AttendanceItemRequest;
import com.englishcenter.service.AttendanceService.SessionRequest;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AttendanceController {
    private final AttendanceService service;

    public AttendanceController(AttendanceService service) {
        this.service = service;
    }

    @GetMapping("/classes/{classId}/sessions")
    public List<Map<String, Object>> listSessions(@PathVariable Long classId) {
        return service.listSessions(classId);
    }

    @PostMapping("/classes/{classId}/sessions")
    public Map<String, Object> createSession(@PathVariable Long classId, @RequestBody SessionRequest request) {
        return service.createSession(classId, request);
    }

    @GetMapping("/sessions/{sessionId}/attendance")
    public List<Map<String, Object>> attendanceSheet(@PathVariable Long sessionId) {
        return service.attendanceSheet(sessionId);
    }

    @PutMapping("/sessions/{sessionId}/attendance")
    public List<Map<String, Object>> saveAttendance(
            @PathVariable Long sessionId,
            @RequestBody List<AttendanceItemRequest> items
    ) {
        return service.saveAttendance(sessionId, items);
    }

    @GetMapping("/students/{studentId}/attendance")
    public List<Map<String, Object>> studentAttendance(@PathVariable Long studentId) {
        return service.studentAttendanceHistory(studentId);
    }
}
