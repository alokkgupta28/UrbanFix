package com.urbanfix.security;

import com.urbanfix.entity.User;
import com.urbanfix.entity.UserRole;
import com.urbanfix.repository.UserRepository;
import com.urbanfix.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository roleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<UserRole> roles = roleRepository.findByUserId(user.getId());
        List<String> roleNames = roles.stream().map(r -> r.getRole().name()).collect(Collectors.toList());

        List<SimpleGrantedAuthority> authorities = roleNames.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                .collect(Collectors.toList());

        return new AuthenticatedUser(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                authorities,
                roleNames
        );
    }
}
