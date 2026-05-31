package com.lias.mapper;

import com.lias.dto.request.PublicationRequestDTO;
import com.lias.dto.response.PublicationResponseDTO;
import com.lias.entity.Publication;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface PublicationMapper {

    @Mapping(target = "auteurs", ignore = true)
    @Mapping(target = "equipe", ignore = true)
    @Mapping(target = "equipeId", ignore = true)
    PublicationResponseDTO toResponseDTO(Publication publication);

    List<PublicationResponseDTO> toResponseDTOList(List<Publication> publications);
}
