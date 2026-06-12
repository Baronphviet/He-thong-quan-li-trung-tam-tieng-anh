package com.englishcenter.repository;

import com.englishcenter.entity.ClassEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    List<ClassEntity> findAllByOrderByCreatedAtDesc();

    List<ClassEntity> findByStatusOrderByClassNameAsc(String status);

    long countByStatus(String status);
}
