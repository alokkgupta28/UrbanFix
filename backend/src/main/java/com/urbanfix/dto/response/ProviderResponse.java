package com.urbanfix.dto.response;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.urbanfix.entity.Provider;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class ProviderResponse {
    private String id;
    private String category_id;
    private String full_name;
    private String headline;
    private String bio;
    private String city;
    private Integer hourly_rate;
    private Integer experience_years;
    private BigDecimal rating_avg;
    private Integer rating_count;
    private Integer jobs_completed;
    private Boolean verified;
    private String avatar_key;
    private List<String> languages;
    private String user_id;

    public static ProviderResponse from(Provider p) {
        if (p == null) return null;
        
        List<String> langs = new ArrayList<>();
        if (p.getLanguages() != null) {
            try {
                langs = new Gson().fromJson(p.getLanguages(), new TypeToken<List<String>>(){}.getType());
            } catch (Exception e) {
                // Ignore parse errors
            }
        }
        
        return ProviderResponse.builder()
                .id(String.valueOf(p.getId()))
                .category_id(String.valueOf(p.getCategory().getId()))
                .full_name(p.getFullName())
                .headline(p.getHeadline())
                .bio(p.getBio())
                .city(p.getCity())
                .hourly_rate(p.getHourlyRate())
                .experience_years(p.getExperienceYears())
                .rating_avg(p.getRatingAvg())
                .rating_count(p.getRatingCount())
                .jobs_completed(p.getJobsCompleted())
                .verified(p.getVerified())
                .avatar_key(p.getAvatarKey())
                .languages(langs)
                .user_id(p.getUserId() != null ? String.valueOf(p.getUserId()) : null)
                .build();
    }
}
