package com.englishcenter.repository;

import com.englishcenter.entity.UserAccount;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByUsername(String username);

    boolean existsByUsername(String username);

    List<UserAccount> findByRoleOrderByFullNameAsc(String role);

    long countByRoleAndActiveTrue(String role);
}
