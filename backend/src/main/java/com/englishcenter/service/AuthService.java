package com.englishcenter.service;

import com.englishcenter.entity.UserAccount;
import com.englishcenter.repository.UserRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;

    public AuthService(UserRepository users) {
        this.users = users;
    }

    public record LoginRequest(String username, String password) {
    }

    public Map<String, Object> login(LoginRequest request) {
        UserAccount user = users.findByUsername(request.username())
                .filter(account -> account.passwordHash.equals(request.password()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        if (!Boolean.TRUE.equals(user.active)) {
            throw new IllegalArgumentException("Tài khoản bị khóa, vui lòng liên hệ admin để được đăng nhập");
        }
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.id);
        map.put("username", user.username);
        map.put("fullName", user.fullName);
        map.put("role", user.role);
        map.put("token", "demo-token-" + user.id);
        return map;
    }
}
