package com.urbanfix.dto.response;

import com.urbanfix.entity.ServiceCategory;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {
    private String id;
    private String slug;
    private String name;
    private String tagline;
    private String description;
    private Integer base_price;
    private String icon_key;
    private Integer sort_order;

    public static CategoryResponse from(ServiceCategory c) {
        if (c == null) return null;
        return CategoryResponse.builder()
                .id(String.valueOf(c.getId()))
                .slug(c.getSlug())
                .name(c.getName())
                .tagline(c.getTagline())
                .description(c.getDescription())
                .base_price(c.getBasePrice())
                .icon_key(c.getIconKey())
                .sort_order(c.getSortOrder())
                .build();
    }
}
