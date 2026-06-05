package com.englishcenter.controller;

import com.englishcenter.service.ClassService;
import com.englishcenter.service.ClassService.ClassRequest;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/classes")
public class ClassController {
    private final ClassService service;

    public ClassController(ClassService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return service.listClasses();
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Long id) {
        return service.getClass(id);
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody ClassRequest request) {
        return service.createClass(request);
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Long id, @RequestBody ClassRequest request) {
        return service.updateClass(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void close(@PathVariable Long id) {
        service.closeClass(id);
    }

    @PostMapping("/{id}/recalculate-fees")
    public Map<String, Object> recalculate(@PathVariable Long id) {
        return Map.of("updatedFees", service.recalculateUnpaidFeesForClass(id));
    }
}
