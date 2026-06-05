package com.englishcenter.controller;

import com.englishcenter.entity.AcademicYear;
import com.englishcenter.entity.AgeGroup;
import com.englishcenter.service.MasterDataService;
import com.englishcenter.service.MasterDataService.AcademicYearRequest;
import com.englishcenter.service.MasterDataService.AgeGroupRequest;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/master")
public class MasterDataController {
    private final MasterDataService service;

    public MasterDataController(MasterDataService service) {
        this.service = service;
    }

    @GetMapping("/academic-years")
    public List<AcademicYear> academicYears() {
        return service.listAcademicYears();
    }

    @PostMapping("/academic-years")
    public AcademicYear createAcademicYear(@RequestBody AcademicYearRequest request) {
        return service.saveAcademicYear(null, request);
    }

    @PutMapping("/academic-years/{id}")
    public AcademicYear updateAcademicYear(@PathVariable Long id, @RequestBody AcademicYearRequest request) {
        return service.saveAcademicYear(id, request);
    }

    @GetMapping("/age-groups")
    public List<AgeGroup> ageGroups() {
        return service.listAgeGroups();
    }

    @PostMapping("/age-groups")
    public AgeGroup createAgeGroup(@RequestBody AgeGroupRequest request) {
        return service.saveAgeGroup(null, request);
    }

    @PutMapping("/age-groups/{id}")
    public AgeGroup updateAgeGroup(@PathVariable Long id, @RequestBody AgeGroupRequest request) {
        return service.saveAgeGroup(id, request);
    }
}
