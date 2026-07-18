package com.urbanfix.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class AuthenticatedUser implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private final List<String> roles;

    public AuthenticatedUser(Long id, String email, String password, Collection<? extends GrantedAuthority> authorities, List<String> roles) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.roles = roles;
    }

    public Long getUserId() {
        return id;
    }
    
    public List<String> getRoles() {
        return roles;
    }
    
    // For backward compatibility with existing code
    public String getSupabaseRole() {
        if (roles != null && !roles.isEmpty()) {
            return roles.get(0);
        }
        return "customer";
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
