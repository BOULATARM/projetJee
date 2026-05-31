package com.lias.config;

import com.lias.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configure(http))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public - no authentication required
                        .requestMatchers("/api/v1/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/demandes-adhesion").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/membres/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/publications/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/evenements/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/equipes/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/conventions/**").permitAll()

                        // Admin / Directeur only
                        .requestMatchers("/api/v1/demandes-adhesion/**").hasAnyRole("ADMIN", "DIRECTEUR")
                        .requestMatchers("/api/v1/rapports/**").hasAnyRole("ADMIN", "DIRECTEUR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/evenements").hasAnyRole("ADMIN", "DIRECTEUR")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/evenements/**").hasAnyRole("ADMIN", "DIRECTEUR")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/evenements/**").hasAnyRole("ADMIN", "DIRECTEUR")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/membres/**").hasAnyRole("ADMIN", "DIRECTEUR", "MEMBRE", "CHEF_EQUIPE", "VICE_DIRECTEUR")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/membres/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/conventions").hasAnyRole("ADMIN", "DIRECTEUR")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/conventions/**").hasAnyRole("ADMIN", "DIRECTEUR")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/conventions/**").hasAnyRole("ADMIN", "DIRECTEUR")

                        // Any authenticated user (DOCTORANT and above)
                        .requestMatchers(HttpMethod.POST, "/api/v1/publications").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/publications/**").authenticated()

                        // Everything else requires login
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
