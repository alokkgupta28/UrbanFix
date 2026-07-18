package com.urbanfix.controller;

import com.urbanfix.dto.response.CategoryResponse;
import com.urbanfix.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService service;

    @GetMapping
    public List<CategoryResponse> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public CategoryResponse getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/by-slug/{slug}")
    public CategoryResponse getBySlug(@PathVariable String slug) {
        return service.findBySlug(slug);
    }
}
