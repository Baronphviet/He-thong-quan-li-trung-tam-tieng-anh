package com.englishcenter.repository;

import com.englishcenter.entity.Announcement;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findAllByOrderByCreatedAtDesc();

    @Query("""
            select a from Announcement a
            where a.active = true
              and (a.startDate is null or a.startDate <= :today)
              and (a.endDate is null or a.endDate >= :today)
            order by a.startDate desc, a.id desc
            """)
    List<Announcement> findActiveForDate(@Param("today") LocalDate today);
}
