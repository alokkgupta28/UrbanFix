package com.urbanfix.service;

import com.urbanfix.dto.request.LoginRequest;
import com.urbanfix.dto.request.RegisterRequest;
import com.urbanfix.dto.response.AuthResponse;
import com.urbanfix.entity.Profile;
import com.urbanfix.entity.User;
import com.urbanfix.entity.UserRole;
import com.urbanfix.entity.enums.AppRole;
import com.urbanfix.exception.ConflictException;
import com.urbanfix.repository.ProfileRepository;
import com.urbanfix.repository.UserRepository;
import com.urbanfix.repository.UserRoleRepository;
import com.urbanfix.security.AuthenticatedUser;
import com.urbanfix.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final UserRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email is already registered");
        }

        User user = User.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .build();
        user = userRepository.save(user);

        // Assign default role (customer)
        UserRole defaultRole = UserRole.builder()
                .userId(user.getId())
                .role(AppRole.customer)
                .build();
        roleRepository.save(defaultRole);

        // Create empty profile
        Profile profile = Profile.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .build();
        profileRepository.save(profile);

        List<String> roles = List.of("customer");
        String jwt = jwtService.generateToken(user.getId(), user.getEmail(), roles);

        return buildAuthResponse(jwt, user.getId(), user.getEmail(), user.getFullName(), roles);
    }

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        AuthenticatedUser user = (AuthenticatedUser) auth.getPrincipal();
        String jwt = jwtService.generateToken(user.getUserId(), user.getUsername(), user.getRoles());

        User dbUser = userRepository.findById(user.getUserId()).orElseThrow();
        
        return buildAuthResponse(jwt, user.getUserId(), user.getUsername(), dbUser.getFullName(), user.getRoles());
    }
    
    public AuthResponse getMe(AuthenticatedUser user) {
        User dbUser = userRepository.findById(user.getUserId()).orElseThrow();
        return buildAuthResponse(null, user.getUserId(), user.getUsername(), dbUser.getFullName(), user.getRoles());
    }

    private AuthResponse buildAuthResponse(String token, Long id, String email, String fullName, List<String> roles) {
        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserData.builder()
                        .id(String.valueOf(id))
                        .email(email)
                        .full_name(fullName)
                        .roles(roles)
                        .build())
                .build();
    }
}
