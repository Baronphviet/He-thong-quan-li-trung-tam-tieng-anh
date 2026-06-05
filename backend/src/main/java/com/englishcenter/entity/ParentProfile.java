package com.englishcenter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "parent")
public class ParentProfile {
    @Id
    @Column(name = "parent_id")
    public Long id;

    @Column(name = "zalo_id")
    public String zaloId;

    @Column(name = "facebook_id")
    public String facebookId;

    public String relationship;
}
