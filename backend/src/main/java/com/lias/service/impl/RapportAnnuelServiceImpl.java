package com.lias.service.impl;

import com.lowagie.text.BadElementException;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lias.dto.response.RapportAnnuelDTO;
import com.lias.entity.AffiliationMembre;
import com.lias.entity.AuteurPublication;
import com.lias.entity.Evenement;
import com.lias.entity.Membre;
import com.lias.entity.Publication;
import com.lias.entity.RapportAnnuel;
import com.lias.entity.Reunion;
import com.lias.enums.StatutMembre;
import com.lias.enums.StatutRapport;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.*;
import com.lias.service.RapportAnnuelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RapportAnnuelServiceImpl implements RapportAnnuelService {

    private final RapportAnnuelRepository rapportRepository;
    private final MembreRepository membreRepository;
    private final PublicationRepository publicationRepository;
    private final EvenementRepository evenementRepository;
    private final ReunionRepository reunionRepository;
    private final ConventionRepository conventionRepository;
    private final ParticipationEvenementRepository participationRepository;
    private final ParticipantReunionRepository participantReunionRepository;

    @Override
    @Transactional
    public RapportAnnuelDTO genererRapport(Integer annee, Long directeurId) {
        List<Publication> publications = publicationRepository.findByAnnee(annee);
        List<Evenement> evenements = evenementRepository.findByAnnee(annee);
        List<Reunion> reunions = reunionRepository.findByAnnee(annee);
        List<Membre> membres = membreRepository.findByActiveTrue();
        long nbConventions = conventionRepository.count();

        Map<String, Long> publicationsParType = publications.stream()
                .collect(Collectors.groupingBy(p -> p.getTypePub().name(), Collectors.counting()));
        Map<String, Long> membresParStatut = membres.stream()
                .filter(m -> m.getStatut() != null)
                .collect(Collectors.groupingBy(m -> m.getStatut().name(), Collectors.counting()));
        Map<String, Long> evenementsParType = evenements.stream()
                .filter(e -> e.getType() != null)
                .collect(Collectors.groupingBy(e -> e.getType().name(), Collectors.counting()));

        RapportAnnuel rapport = RapportAnnuel.builder()
                .annee(annee)
                .dateGeneration(LocalDateTime.now())
                .generePar(membreRepository.findById(directeurId).orElse(null))
                .nbPublications(publications.size())
                .nbEvenements(evenements.size())
                .nbMembres((int) membreRepository.count())
                .nbDoctorants((int) membreRepository.countByStatut(StatutMembre.DOCTORANT))
                .statut(StatutRapport.BROUILLON)
                .build();

        rapport = rapportRepository.save(rapport);

        return toDTO(rapport, publications, evenements, reunions, membres, (int) nbConventions,
                publicationsParType, membresParStatut, evenementsParType);
    }

    @Override
    public List<RapportAnnuelDTO> getRapports() {
        return rapportRepository.findAll().stream()
                .map(r -> RapportAnnuelDTO.builder()
                        .id(r.getId()).annee(r.getAnnee())
                        .dateGeneration(r.getDateGeneration())
                        .generePar(r.getGenerePar() != null ? r.getGenerePar().getNom() + " " + r.getGenerePar().getPrenom() : "")
                        .statut(r.getStatut().name())
                        .nbPublications(r.getNbPublications() != null ? r.getNbPublications() : 0)
                        .nbEvenements(r.getNbEvenements() != null ? r.getNbEvenements() : 0)
                        .nbMembres(r.getNbMembres() != null ? r.getNbMembres() : 0)
                        .nbDoctorants(r.getNbDoctorants() != null ? r.getNbDoctorants() : 0)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public RapportAnnuelDTO getRapportById(Long id) {
        RapportAnnuel rapport = rapportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RapportAnnuel", "id", id));
        List<Publication> publications = publicationRepository.findByAnnee(rapport.getAnnee());
        List<Evenement> evenements = evenementRepository.findByAnnee(rapport.getAnnee());
        List<Reunion> reunions = reunionRepository.findByAnnee(rapport.getAnnee());
        List<Membre> membres = membreRepository.findByActiveTrue();
        long nbConventions = conventionRepository.count();

        Map<String, Long> publicationsParType = publications.stream()
                .collect(Collectors.groupingBy(p -> p.getTypePub().name(), Collectors.counting()));
        Map<String, Long> membresParStatut = membres.stream()
                .filter(m -> m.getStatut() != null)
                .collect(Collectors.groupingBy(m -> m.getStatut().name(), Collectors.counting()));
        Map<String, Long> evenementsParType = evenements.stream()
                .filter(e -> e.getType() != null)
                .collect(Collectors.groupingBy(e -> e.getType().name(), Collectors.counting()));

        return toDTO(rapport, publications, evenements, reunions, membres, (int) nbConventions,
                publicationsParType, membresParStatut, evenementsParType);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private RapportAnnuelDTO toDTO(RapportAnnuel rapport, List<Publication> publications,
                                    List<Evenement> evenements, List<Reunion> reunions,
                                    List<Membre> membres, int nbConventions,
                                    Map<String, Long> pubParType, Map<String, Long> memParStatut,
                                    Map<String, Long> evtParType) {
        return RapportAnnuelDTO.builder()
                .id(rapport.getId())
                .annee(rapport.getAnnee())
                .dateGeneration(rapport.getDateGeneration())
                .generePar(rapport.getGenerePar() != null ?
                        rapport.getGenerePar().getNom() + " " + rapport.getGenerePar().getPrenom() : "")
                .statut(rapport.getStatut().name())
                .nbMembres(rapport.getNbMembres() != null ? rapport.getNbMembres() : membres.size())
                .nbDoctorants(rapport.getNbDoctorants() != null ? rapport.getNbDoctorants() : 0)
                .nbPublications(publications.size())
                .nbEvenements(evenements.size())
                .nbReunions(reunions.size())
                .nbConventions(nbConventions)
                .publicationsParType(pubParType)
                .membresParStatut(memParStatut)
                .evenementsParType(evtParType)
                .publications(publications.stream().map(p -> RapportAnnuelDTO.PubItem.builder()
                        .titre(p.getTitre())
                        .type(p.getTypePub().name())
                        .revue(p.getRevue())
                        .conference(p.getConference())
                        .annee(p.getAnnee())
                        .auteurs(p.getAuteurs().stream()
                                .map(a -> a.getMembre() != null ? a.getMembre().getPrenom() + " " + a.getMembre().getNom() : "")
                                .collect(Collectors.toList()))
                        .build()).collect(Collectors.toList()))
                .evenements(evenements.stream().map(e -> RapportAnnuelDTO.EvtItem.builder()
                        .titre(e.getTitre())
                        .type(e.getType() != null ? e.getType().name() : "")
                        .statut(e.getStatut() != null ? e.getStatut().name() : "")
                        .dateDebut(e.getDateDebut() != null ? e.getDateDebut().toLocalDate().toString() : "")
                        .lieu(e.getLieu())
                        .nbParticipants((int) participationRepository.findByEvenementId(e.getId()).stream()
                                .filter(p -> p.getStatut() != null && p.getStatut().name().equals("CONFIRME")).count())
                        .build()).collect(Collectors.toList()))
                .reunions(reunions.stream().map(r -> RapportAnnuelDTO.ReuItem.builder()
                        .titre(r.getTitre())
                        .date(r.getDateReunion() != null ? r.getDateReunion().toLocalDate().toString() : "")
                        .lieu(r.getLieu())
                        .statut(r.getStatut() != null ? r.getStatut().name() : "")
                        .nbParticipants(participantReunionRepository.findByReunionId(r.getId()).size())
                        .build()).collect(Collectors.toList()))
                .membres(membres.stream().map(m -> {
                    String equipe = m.getAffiliations().stream()
                            .filter(AffiliationMembre::getActif)
                            .findFirst()
                            .map(a -> a.getEquipe() != null ? a.getEquipe().getNom() : "")
                            .orElse("—");
                    return RapportAnnuelDTO.MemItem.builder()
                            .nom(m.getNom()).prenom(m.getPrenom())
                            .statut(m.getStatut() != null ? m.getStatut().name() : "")
                            .email(m.getEmail()).equipe(equipe)
                            .build();
                }).collect(Collectors.toList()))
                .build();
    }

    // ─── Export PDF ───────────────────────────────────────────────────────────

    @Override
    public byte[] exportRapportPDF(Long rapportId) {
        RapportAnnuelDTO dto = getRapportById(rapportId);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 60, 60);

        try {
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            Color navyBlue  = new Color(30, 58, 95);
            Color lightBlue = new Color(219, 234, 254);
            Color lightGray = new Color(248, 250, 252);
            Color borderBlue = new Color(191, 219, 254);

            Font titleFont    = new Font(Font.HELVETICA, 22, Font.BOLD,   navyBlue);
            Font whiteFont    = new Font(Font.HELVETICA, 11, Font.BOLD,   Color.WHITE);
            Font sectionFont  = new Font(Font.HELVETICA, 13, Font.BOLD,   navyBlue);
            Font normalFont   = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);
            Font boldFont     = new Font(Font.HELVETICA, 10, Font.BOLD,   navyBlue);
            Font italicFont   = new Font(Font.HELVETICA,  9, Font.ITALIC, Color.GRAY);

            PdfContentByte cb = writer.getDirectContent();

            // ── Banner ──────────────────────────────────────────────────────
            cb.setColorFill(navyBlue);
            cb.rectangle(50, document.top() - 10, document.right() - document.left(), 55);
            cb.fill();

            Paragraph banner = new Paragraph("Laboratoire LIAS — Rapport d'Activité Annuel " + dto.getAnnee(), whiteFont);
            banner.setAlignment(Element.ALIGN_CENTER);
            banner.setSpacingAfter(35f);
            document.add(banner);

            Paragraph title = new Paragraph("RAPPORT ANNUEL D'ACTIVITÉS " + dto.getAnnee(), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(6f);
            document.add(title);

            document.add(new Paragraph("Généré par : " + dto.getGenerePar() +
                    "   |   Date : " + (dto.getDateGeneration() != null ? dto.getDateGeneration().toLocalDate() : ""), italicFont) {{
                setAlignment(Element.ALIGN_CENTER); setSpacingAfter(20f);
            }});

            // ── 1. Chiffres clés ────────────────────────────────────────────
            addSectionTitle(document, "1. Chiffres Clés", sectionFont);

            PdfPTable stats = new PdfPTable(6);
            stats.setWidthPercentage(100);
            stats.setSpacingAfter(20f);

            addStatCell(stats, "Membres", dto.getNbMembres(), lightBlue, borderBlue, boldFont, normalFont);
            addStatCell(stats, "Doctorants", dto.getNbDoctorants(), lightBlue, borderBlue, boldFont, normalFont);
            addStatCell(stats, "Publications", dto.getNbPublications(), lightBlue, borderBlue, boldFont, normalFont);
            addStatCell(stats, "Événements", dto.getNbEvenements(), lightBlue, borderBlue, boldFont, normalFont);
            addStatCell(stats, "Réunions", dto.getNbReunions(), lightBlue, borderBlue, boldFont, normalFont);
            addStatCell(stats, "Conventions", dto.getNbConventions(), lightBlue, borderBlue, boldFont, normalFont);
            document.add(stats);

            // ── 2. Répartition membres ──────────────────────────────────────
            if (dto.getMembresParStatut() != null && !dto.getMembresParStatut().isEmpty()) {
                addSectionTitle(document, "2. Répartition des Membres par Statut", sectionFont);
                PdfPTable t = new PdfPTable(2);
                t.setWidthPercentage(60);
                t.setSpacingAfter(20f);
                addTableHeader(t, new String[]{"Statut", "Nombre"}, navyBlue, whiteFont);
                boolean alt = false;
                for (Map.Entry<String, Long> e : dto.getMembresParStatut().entrySet()) {
                    Color bg = alt ? lightGray : Color.WHITE;
                    addRow(t, new String[]{e.getKey(), String.valueOf(e.getValue())}, bg, normalFont);
                    alt = !alt;
                }
                document.add(t);
            }

            // ── 3. Publications ─────────────────────────────────────────────
            if (dto.getPublications() != null && !dto.getPublications().isEmpty()) {
                addSectionTitle(document, "3. Publications " + dto.getAnnee() + " (" + dto.getNbPublications() + ")", sectionFont);
                PdfPTable t = new PdfPTable(4);
                t.setWidthPercentage(100);
                t.setWidths(new float[]{4f, 1.5f, 2.5f, 2f});
                t.setSpacingAfter(20f);
                addTableHeader(t, new String[]{"Titre", "Type", "Auteurs", "Revue/Conférence"}, navyBlue, whiteFont);
                boolean alt = false;
                for (RapportAnnuelDTO.PubItem p : dto.getPublications()) {
                    Color bg = alt ? lightGray : Color.WHITE;
                    String auteurs = p.getAuteurs() != null ? String.join(", ", p.getAuteurs()) : "";
                    String lieu = p.getRevue() != null ? p.getRevue() : (p.getConference() != null ? p.getConference() : "—");
                    addRow(t, new String[]{p.getTitre(), p.getType(), auteurs, lieu}, bg, normalFont);
                    alt = !alt;
                }
                document.add(t);
            }

            // ── 4. Événements ───────────────────────────────────────────────
            if (dto.getEvenements() != null && !dto.getEvenements().isEmpty()) {
                addSectionTitle(document, "4. Événements " + dto.getAnnee() + " (" + dto.getNbEvenements() + ")", sectionFont);
                PdfPTable t = new PdfPTable(5);
                t.setWidthPercentage(100);
                t.setWidths(new float[]{3.5f, 1.5f, 2f, 1.5f, 1f});
                t.setSpacingAfter(20f);
                addTableHeader(t, new String[]{"Titre", "Type", "Date", "Statut", "Participants"}, navyBlue, whiteFont);
                boolean alt = false;
                for (RapportAnnuelDTO.EvtItem e : dto.getEvenements()) {
                    Color bg = alt ? lightGray : Color.WHITE;
                    addRow(t, new String[]{e.getTitre(), e.getType(), e.getDateDebut(), e.getStatut(), String.valueOf(e.getNbParticipants())}, bg, normalFont);
                    alt = !alt;
                }
                document.add(t);
            }

            // ── 5. Réunions ─────────────────────────────────────────────────
            if (dto.getReunions() != null && !dto.getReunions().isEmpty()) {
                addSectionTitle(document, "5. Réunions " + dto.getAnnee() + " (" + dto.getNbReunions() + ")", sectionFont);
                PdfPTable t = new PdfPTable(4);
                t.setWidthPercentage(100);
                t.setWidths(new float[]{3.5f, 1.5f, 2f, 1f});
                t.setSpacingAfter(20f);
                addTableHeader(t, new String[]{"Titre", "Date", "Statut", "Participants"}, navyBlue, whiteFont);
                boolean alt = false;
                for (RapportAnnuelDTO.ReuItem r : dto.getReunions()) {
                    Color bg = alt ? lightGray : Color.WHITE;
                    addRow(t, new String[]{r.getTitre(), r.getDate(), r.getStatut(), String.valueOf(r.getNbParticipants())}, bg, normalFont);
                    alt = !alt;
                }
                document.add(t);
            }

            // ── 6. Liste des membres ────────────────────────────────────────
            if (dto.getMembres() != null && !dto.getMembres().isEmpty()) {
                addSectionTitle(document, "6. Membres du Laboratoire (" + dto.getNbMembres() + ")", sectionFont);
                PdfPTable t = new PdfPTable(4);
                t.setWidthPercentage(100);
                t.setWidths(new float[]{2f, 2f, 2f, 2.5f});
                t.setSpacingAfter(20f);
                addTableHeader(t, new String[]{"Nom", "Prénom", "Statut", "Équipe"}, navyBlue, whiteFont);
                boolean alt = false;
                for (RapportAnnuelDTO.MemItem m : dto.getMembres()) {
                    Color bg = alt ? lightGray : Color.WHITE;
                    addRow(t, new String[]{m.getNom(), m.getPrenom(), m.getStatut(), m.getEquipe()}, bg, normalFont);
                    alt = !alt;
                }
                document.add(t);
            }

            // ── Footer ──────────────────────────────────────────────────────
            document.add(Chunk.NEWLINE);
            Paragraph footer = new Paragraph(
                "LIAS — Laboratoire d'Informatique et d'Applications Scientifiques\n" +
                "Ce rapport constitue la base du dossier de demande de budget annuel.",
                italicFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }

        return baos.toByteArray();
    }

    // ─── PDF helpers ──────────────────────────────────────────────────────────

    private void addSectionTitle(Document doc, String text, Font font) throws DocumentException {
        Paragraph p = new Paragraph(text, font);
        p.setSpacingBefore(14f);
        p.setSpacingAfter(8f);
        doc.add(p);
    }

    private void addTableHeader(PdfPTable table, String[] headers, Color bg, Font font) {
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, font));
            cell.setBackgroundColor(bg);
            cell.setPadding(7f);
            table.addCell(cell);
        }
    }

    private void addRow(PdfPTable table, String[] values, Color bg, Font font) {
        for (String v : values) {
            PdfPCell cell = new PdfPCell(new Phrase(v != null ? v : "—", font));
            cell.setBackgroundColor(bg);
            cell.setPadding(6f);
            table.addCell(cell);
        }
    }

    private void addStatCell(PdfPTable table, String label, int value,
                              Color bg, Color border, Font boldFont, Font normalFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, normalFont));
        labelCell.setBackgroundColor(bg);
        labelCell.setBorderColor(border);
        labelCell.setPadding(8f);
        labelCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(labelCell);

        PdfPCell valCell = new PdfPCell(new Phrase(String.valueOf(value), boldFont));
        valCell.setBackgroundColor(Color.WHITE);
        valCell.setBorderColor(border);
        valCell.setPadding(8f);
        valCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(valCell);
    }
}
