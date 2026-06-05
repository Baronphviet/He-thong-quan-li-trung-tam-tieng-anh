package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcement")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "announcement_id")
    public Long id;

    public String title;
    public String content;

    @Column(name = "image_url")
    public String imageUrl;

    public String type = "BANNER";

    @Column(name = "start_date")
    public LocalDate startDate;

    @Column(name = "end_date")
    public LocalDate endDate;

    @Column(name = "is_active")
    public Boolean active = false;

    @Column(name = "created_by")
    public Long createdBy;

    @Column(name = "created_at", insertable = false, updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    public LocalDateTime updatedAt;
}
