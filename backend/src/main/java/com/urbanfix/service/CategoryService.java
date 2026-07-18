package com.urbanfix.service;

import com.urbanfix.dto.response.CategoryResponse;
import com.urbanfix.entity.ServiceCategory;
import com.urbanfix.exception.ResourceNotFoundException;
import com.urbanfix.repository.ServiceCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final ServiceCategoryRepository repo;

    public List<CategoryResponse> findAll() {
        return repo.findAllByOrderBySortOrderAsc().stream()
                .map(CategoryResponse::from)
                .toList();
    }

    public CategoryResponse findById(Long id) {
        ServiceCategory category = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return CategoryResponse.from(category);
    }

    public CategoryResponse findBySlug(String slug) {
        ServiceCategory category = repo.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return CategoryResponse.from(category);
    }
}
