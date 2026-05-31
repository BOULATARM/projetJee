package com.lias.service;

import com.lias.dto.request.DemandeAdhesionRequestDTO;
import com.lias.dto.request.LoginRequestDTO;
import com.lias.dto.response.AuthResponseDTO;
import com.lias.dto.response.MembreResponseDTO;

public interface AuthService {
    AuthResponseDTO login(LoginRequestDTO dto);
    MembreResponseDTO getCurrentUser(String email);
}
