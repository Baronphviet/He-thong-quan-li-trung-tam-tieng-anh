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

    public TeacherSalaryService(TeacherSalaryRepository salaries, TeacherRepository teacherProfiles, UserRepository users) {
        this.salaries = salaries;
        this.teacherProfiles = teacherProfiles;
        this.users = users;
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

        salary.totalSessions = req.totalSessions() == null ? 0 : req.totalSessions();
        salary.amount = req.amount() == null ? BigDecimal.ZERO : req.amount();
        salary.note = req.note();
        salary.status = req.status() == null ? "PENDING" : req.status();

        if ("PAID".equals(salary.status) && salary.paidDate == null) {
            salary.paidDate = LocalDate.now();
        } else if ("PENDING".equals(salary.status)) {
            salary.paidDate = null;
        }

        salaries.save(salary);
    }
}
