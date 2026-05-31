package com.lias.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;

@Entity
@Table(name = "activites_conventions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiviteConvention {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id")
    @JsonIgnoreProperties("activites")
    private Convention convention;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate dateActivite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id")
    @JsonIgnoreProperties({"affiliations", "roles"})
    private Membre responsable;
}
