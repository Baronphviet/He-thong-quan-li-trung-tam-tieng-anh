package com.englishcenter.repository;

import com.englishcenter.entity.TeacherProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<TeacherProfile, Long> {
}
