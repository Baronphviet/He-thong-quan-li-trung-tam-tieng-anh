package com.englishcenter.controller;

import com.englishcenter.service.UserManagementService;
import com.englishcenter.service.UserManagementService.AdminRequest;
import com.englishcenter.service.UserManagementService.ChangePasswordRequest;
import com.englishcenter.service.UserManagementService.LinkParentRequest;
import com.englishcenter.service.UserManagementService.ParentRequest;
import com.englishcenter.service.UserManagementService.StudentRequest;
import com.englishcenter.service.UserManagementService.TeacherRequest;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserManagementService service;

    public UserController(UserManagementService service) {
        this.service = service;
    }

    // ── Admins ──────────────────────────────────────────
    @GetMapping("/admins")
    public List<Map<String, Object>> admins() {
        return service.listAdmins();
    }

    @PostMapping("/admins")
    public Map<String, Object> createAdmin(@RequestBody AdminRequest request) {
        return service.createAdmin(request);
    }

    @PutMapping("/admins/{id}")
    public Map<String, Object> updateAdmin(@PathVariable Long id, @RequestBody AdminRequest request) {
        return service.updateAdmin(id, request);
    }

    // ── Teachers ─────────────────────────────────────────
    @GetMapping("/teachers")
    public List<Map<String, Object>> teachers() {
        return service.listTeachers();
    }

    @PostMapping("/teachers")
    public Map<String, Object> createTeacher(@RequestBody TeacherRequest request) {
        return service.createTeacher(request);
    }

    @PutMapping("/teachers/{id}")
    public Map<String, Object> updateTeacher(@PathVariable Long id, @RequestBody TeacherRequest request) {
        return service.updateTeacher(id, request);
    }

    // ── Students ─────────────────────────────────────────
    @GetMapping("/students")
    public List<Map<String, Object>> students() {
        return service.listStudents();
    }

    @PostMapping("/students")
    public Map<String, Object> createStudent(@RequestBody StudentRequest request) {
        return service.createStudent(request);
    }

    @PutMapping("/students/{id}")
    public Map<String, Object> updateStudent(@PathVariable Long id, @RequestBody StudentRequest request) {
        return service.updateStudent(id, request);
    }

    // ── Parents ──────────────────────────────────────────
    @GetMapping("/parents")
    public List<Map<String, Object>> parents() {
        return service.listParents();
    }

    @PostMapping("/parents")
    public Map<String, Object> createParent(@RequestBody ParentRequest request) {
        return service.createParent(request);
    }

    @PutMapping("/parents/{id}")
    public Map<String, Object> updateParent(@PathVariable Long id, @RequestBody ParentRequest request) {
        return service.updateParent(id, request);
    }

    @PostMapping("/parents/link-student")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void linkParent(@RequestBody LinkParentRequest request) {
        service.linkParent(request);
    }

    // ── Users (chung) ────────────────────────────────────
    @GetMapping("/users/{id}/profile")
    public Map<String, Object> profile(@PathVariable Long id) {
        return service.getProfile(id);
    }

    @PatchMapping("/users/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        service.changePassword(id, request);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void softDelete(@PathVariable Long id) {
        service.softDelete(id);
    }

    @PutMapping("/users/{id}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(@PathVariable Long id) {
        service.activate(id);
    }

    @DeleteMapping("/users/{id}/hard")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void hardDelete(@PathVariable Long id) {
        service.hardDelete(id);
    }
}