package com.englishcenter.controller;

import com.englishcenter.service.TeacherSalaryService;
import com.englishcenter.service.TeacherSalaryService.SalaryRequest;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teacher-salary")
public class TeacherSalaryController {
    private final TeacherSalaryService service;

    public TeacherSalaryController(TeacherSalaryService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> getByMonth(
            @RequestParam Integer month,
            @RequestParam Integer year
    ) {
        return service.getSalariesByMonth(month, year);
    }

    @GetMapping("/teacher")
    public List<Map<String, Object>> getByTeacher(@RequestParam Long teacherId) {
        return service.getSalariesByTeacher(teacherId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void save(@RequestBody SalaryRequest request) {
        service.saveSalary(request);
    }
}
