package com.englishcenter.controller;

import com.englishcenter.service.UserManagementService;
import com.englishcenter.service.UserManagementService.LinkParentRequest;
import com.englishcenter.service.UserManagementService.ParentRequest;
import com.englishcenter.service.UserManagementService.StudentRequest;
import com.englishcenter.service.UserManagementService.TeacherRequest;
import java.util.List;
import java.util.Map;
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
public class UserController {
    private final UserManagementService service;

    public UserController(UserManagementService service) {
        this.service = service;
    }

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

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void softDelete(@PathVariable Long id) {
        service.softDelete(id);
    }
}
