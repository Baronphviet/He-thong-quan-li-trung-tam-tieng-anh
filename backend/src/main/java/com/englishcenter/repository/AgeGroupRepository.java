package com.englishcenter.repository;

import com.englishcenter.entity.AgeGroup;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgeGroupRepository extends JpaRepository<AgeGroup, Long> {
    List<AgeGroup> findAllByOrderByGroupNameAsc();
}
