package com.lias.mapper;

import com.lias.dto.request.MembreRequestDTO;
import com.lias.dto.response.MembreResponseDTO;
import com.lias.entity.Membre;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface MembreMapper {

    MembreResponseDTO toResponseDTO(Membre membre);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "motDePasse", ignore = true)
    @Mapping(target = "affiliations", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "demandesAdhesion", ignore = true)
    @Mapping(target = "demandesMateriel", ignore = true)
    @Mapping(target = "documentsUploades", ignore = true)
    @Mapping(target = "active", constant = "true")
    Membre toEntity(MembreRequestDTO dto);

    List<MembreResponseDTO> toResponseDTOList(List<Membre> membres);
}
