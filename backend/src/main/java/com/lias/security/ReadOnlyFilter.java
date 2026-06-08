package com.lias.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

public class ReadOnlyFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws IOException, ServletException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            boolean isRetraite = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("RETRAITE"));
            if (isRetraite) {
                String method = request.getMethod();
                if (!method.equals("GET") && !method.equals("HEAD") && !method.equals("OPTIONS")) {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"error\":\"Compte gelé — consultation uniquement.\"}");
                    return;
                }
            }
        }
        chain.doFilter(request, response);
    }
}
