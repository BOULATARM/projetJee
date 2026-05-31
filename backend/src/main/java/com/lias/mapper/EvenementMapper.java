package com.lias.mapper;

import com.lias.dto.request.EvenementRequestDTO;
import com.lias.dto.response.EvenementResponseDTO;
import com.lias.entity.Evenement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface EvenementMapper {

    @Mapping(target = "organisateurs", ignore = true)
    @Mapping(target = "nbDocuments", ignore = true)
    EvenementResponseDTO toResponseDTO(Evenement evenement);

    List<EvenementResponseDTO> toResponseDTOList(List<Evenement> evenements);
}
