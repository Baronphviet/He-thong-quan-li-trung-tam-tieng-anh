package com.englishcenter.repository;

import com.englishcenter.entity.ClassSession;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findByClassIdOrderBySessionDateDescSessionNumberDesc(Long classId);

    Optional<ClassSession> findTopByClassIdOrderBySessionNumberDesc(Long classId);

    Optional<ClassSession> findByClassIdAndSessionDateAndSessionNumber(Long classId, LocalDate sessionDate, Integer sessionNumber);
}
