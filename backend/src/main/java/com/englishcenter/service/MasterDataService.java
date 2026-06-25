package com.englishcenter.service;

import com.englishcenter.entity.AcademicYear;
import com.englishcenter.entity.AgeGroup;
import com.englishcenter.exception.NotFoundException;
import com.englishcenter.repository.AcademicYearRepository;
import com.englishcenter.repository.AgeGroupRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MasterDataService {
    private final AcademicYearRepository academicYears;
    private final AgeGroupRepository ageGroups;

    public MasterDataService(AcademicYearRepository academicYears, AgeGroupRepository ageGroups) {
        this.academicYears = academicYears;
        this.ageGroups = ageGroups;
    }

    public record AcademicYearRequest(String yearName, LocalDate startDate, LocalDate endDate, Boolean active) {
    }

    public record AgeGroupRequest(String groupName, String description) {
    }

    public List<AcademicYear> listAcademicYears() {
        return academicYears.findAllByOrderByStartDateDesc();
    }

    @Transactional
    public AcademicYear saveAcademicYear(Long id, AcademicYearRequest request) {
        AcademicYear year = id == null ? new AcademicYear() : academicYears.findById(id)
                .orElseThrow(() -> new NotFoundException("Academic year not found: " + id));
        if (isBlank(request.yearName())) {
            throw new IllegalArgumentException("yearName is required");
        }
        year.yearName = request.yearName().trim();
        year.startDate = request.startDate();
        year.endDate = request.endDate();
        year.active = request.active() != null && request.active();
        return academicYears.save(year);
    }

    @Transactional
    public void deleteAcademicYear(Long id) {
        if (!academicYears.existsById(id)) {
            throw new NotFoundException("Academic year not found: " + id);
        }
        try {
            academicYears.deleteById(id);
            academicYears.flush();
        } catch (Exception e) {
            throw new IllegalStateException("Không thể xoá năm học này vì đã có dữ liệu lớp học tham chiếu đến.", e);
        }
    }

    public List<AgeGroup> listAgeGroups() {
        return ageGroups.findAllByOrderByGroupNameAsc();
    }

    @Transactional
    public AgeGroup saveAgeGroup(Long id, AgeGroupRequest request) {
        AgeGroup group = id == null ? new AgeGroup() : ageGroups.findById(id)
                .orElseThrow(() -> new NotFoundException("Age group not found: " + id));
        if (isBlank(request.groupName())) {
            throw new IllegalArgumentException("groupName is required");
        }
        group.groupName = request.groupName().trim();
        group.description = request.description();
        return ageGroups.save(group);
    }

    @Transactional
    public void deleteAgeGroup(Long id) {
        if (!ageGroups.existsById(id)) {
            throw new NotFoundException("Age group not found: " + id);
        }
        try {
            ageGroups.deleteById(id);
            ageGroups.flush();
        } catch (Exception e) {
            throw new IllegalStateException("Không thể xoá độ tuổi này vì đã có dữ liệu lớp học tham chiếu đến.", e);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
