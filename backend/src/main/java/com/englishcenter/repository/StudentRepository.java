package com.englishcenter.repository;

import com.englishcenter.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<StudentProfile, Long> {
}
