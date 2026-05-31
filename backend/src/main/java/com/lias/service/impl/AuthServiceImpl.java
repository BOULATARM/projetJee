package com.lias.service.impl;

import com.lias.dto.request.LoginRequestDTO;
import com.lias.dto.response.AuthResponseDTO;
import com.lias.dto.response.MembreResponseDTO;
import com.lias.entity.Membre;
import com.lias.exception.ResourceNotFoundException;
import com.lias.mapper.MembreMapper;
import com.lias.repository.MembreRepository;
import com.lias.security.JwtTokenProvider;
import com.lias.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final MembreRepository membreRepository;
    private final MembreMapper membreMapper;

    @Override
    public AuthResponseDTO login(LoginRequestDTO dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getMotDePasse()));

        Membre membre = membreRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "email", dto.getEmail()));

        if (!membre.getActive()) {
            throw new RuntimeException("Compte désactivé");
        }

        String token = jwtTokenProvider.generateToken(authentication);

        return AuthResponseDTO.builder()
                .token(token)
                .membreId(membre.getId())
                .email(membre.getEmail())
                .role(membre.getSystemRole())
                .nom(membre.getNom())
                .prenom(membre.getPrenom())
                .build();
    }

    @Override
    public MembreResponseDTO getCurrentUser(String email) {
        Membre membre = membreRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "email", email));
        return membreMapper.toResponseDTO(membre);
    }
}
