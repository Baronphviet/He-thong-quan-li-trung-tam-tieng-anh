package com.englishcenter.repository;

import com.englishcenter.entity.ParentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentRepository extends JpaRepository<ParentProfile, Long> {
}
