package com.lias.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.lias.dto.response.RapportAnnuelDTO;
import com.lias.entity.Evenement;
import com.lias.entity.Membre;
import com.lias.entity.Publication;
import com.lias.entity.RapportAnnuel;
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
    private final LaboratoireRepository laboratoireRepository;

    @Override
    @Transactional
    public RapportAnnuelDTO genererRapport(Integer annee, Long directeurId) {
        long nbMembres = membreRepository.count();
        long nbDoctorants = membreRepository.countByStatut(StatutMembre.DOCTORANT);
        long nbPublications = publicationRepository.countByAnnee(annee);
        long nbEvenements = evenementRepository.findByAnnee(annee).size();

        List<Publication> publications = publicationRepository.findByAnnee(annee);
        List<Membre> membres = membreRepository.findByActiveTrue();

        Map<String, Long> publicationsParType = publications.stream()
                .collect(Collectors.groupingBy(p -> p.getTypePub().name(), Collectors.counting()));

        Map<String, Long> membresParStatut = membres.stream()
                .collect(Collectors.groupingBy(m -> m.getStatut().name(), Collectors.counting()));

        RapportAnnuel rapport = RapportAnnuel.builder()
                .annee(annee)
                .dateGeneration(LocalDateTime.now())
                .generePar(membreRepository.findById(directeurId).orElse(null))
                .nbPublications((int) nbPublications)
                .nbEvenements((int) nbEvenements)
                .nbMembres((int) nbMembres)
                .nbDoctorants((int) nbDoctorants)
                .statut(StatutRapport.BROUILLON)
                .build();

        rapport = rapportRepository.save(rapport);

        return RapportAnnuelDTO.builder()
                .id(rapport.getId())
                .annee(annee)
                .dateGeneration(rapport.getDateGeneration())
                .generePar(rapport.getGenerePar() != null ?
                        rapport.getGenerePar().getNom() + " " + rapport.getGenerePar().getPrenom() : "")
                .statut(rapport.getStatut().name())
                .nbPublications((int) nbPublications)
                .nbEvenements((int) nbEvenements)
                .nbMembres((int) nbMembres)
                .nbDoctorants((int) nbDoctorants)
                .publicationsParType(publicationsParType)
                .membresParStatut(membresParStatut)
                .build();
    }

    @Override
    public List<RapportAnnuelDTO> getRapports() {
        return rapportRepository.findAll().stream()
                .map(r -> RapportAnnuelDTO.builder()
                        .id(r.getId())
                        .annee(r.getAnnee())
                        .dateGeneration(r.getDateGeneration())
                        .generePar(r.getGenerePar() != null ?
                                r.getGenerePar().getNom() + " " + r.getGenerePar().getPrenom() : "")
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
        return RapportAnnuelDTO.builder()
                .id(rapport.getId())
                .annee(rapport.getAnnee())
                .dateGeneration(rapport.getDateGeneration())
                .generePar(rapport.getGenerePar() != null ?
                        rapport.getGenerePar().getNom() + " " + rapport.getGenerePar().getPrenom() : "")
                .statut(rapport.getStatut().name())
                .nbPublications(rapport.getNbPublications())
                .nbEvenements(rapport.getNbEvenements())
                .nbMembres(rapport.getNbMembres())
                .nbDoctorants(rapport.getNbDoctorants())
                .build();
    }

    @Override
    public byte[] exportRapportPDF(Long rapportId) {
        RapportAnnuel rapport = rapportRepository.findById(rapportId)
                .orElseThrow(() -> new ResourceNotFoundException("RapportAnnuel", "id", rapportId));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 60, 60);

        try {
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            Color navyBlue = new Color(30, 58, 95);
            Color lightGray = new Color(248, 250, 252);

            Font titleFont = new Font(Font.HELVETICA, 22, Font.BOLD, navyBlue);
            Font subtitleFont = new Font(Font.HELVETICA, 13, Font.BOLD, Color.WHITE);
            Font sectionFont = new Font(Font.HELVETICA, 13, Font.BOLD, navyBlue);
            Font normalFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);
            Font boldFont = new Font(Font.HELVETICA, 10, Font.BOLD, navyBlue);

            // Header banner
            PdfContentByte cb = writer.getDirectContent();
            cb.setColorFill(navyBlue);
            cb.rectangle(50, document.top() - 10, document.right() - document.left(), 60);
            cb.fill();

            Paragraph header = new Paragraph("Laboratoire LIAS\nRapport d'Activité Annuel " + rapport.getAnnee(), subtitleFont);
            header.setAlignment(Element.ALIGN_CENTER);
            header.setSpacingAfter(40f);
            document.add(header);

            // Title
            Paragraph title = new Paragraph("RAPPORT ANNUEL " + rapport.getAnnee(), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(6f);
            document.add(title);

            if (rapport.getGenerePar() != null) {
                Paragraph gen = new Paragraph("Généré par : " + rapport.getGenerePar().getNom() + " " + rapport.getGenerePar().getPrenom(), normalFont);
                gen.setAlignment(Element.ALIGN_CENTER);
                gen.setSpacingAfter(4f);
                document.add(gen);
            }

            if (rapport.getDateGeneration() != null) {
                Paragraph date = new Paragraph("Date : " + rapport.getDateGeneration().toLocalDate().toString(), normalFont);
                date.setAlignment(Element.ALIGN_CENTER);
                date.setSpacingAfter(30f);
                document.add(date);
            }

            // Separator line
            cb.setColorStroke(navyBlue);
            cb.setLineWidth(1.5f);
            float y = writer.getVerticalPosition(false);
            cb.moveTo(50, y);
            cb.lineTo(document.right() - 50, y);
            cb.stroke();

            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // Stats section
            Paragraph statsTitle = new Paragraph("1. Chiffres Clés", sectionFont);
            statsTitle.setSpacingBefore(10f);
            statsTitle.setSpacingAfter(12f);
            document.add(statsTitle);

            PdfPTable statsTable = new PdfPTable(4);
            statsTable.setWidthPercentage(100);
            statsTable.setSpacingAfter(20f);

            String[][] statsData = {
                {"Membres actifs", String.valueOf(rapport.getNbMembres())},
                {"Doctorants", String.valueOf(rapport.getNbDoctorants())},
                {"Publications", String.valueOf(rapport.getNbPublications())},
                {"Événements", String.valueOf(rapport.getNbEvenements())}
            };

            for (String[] stat : statsData) {
                PdfPCell labelCell = new PdfPCell(new Phrase(stat[0], normalFont));
                labelCell.setBackgroundColor(new Color(219, 234, 254));
                labelCell.setPadding(8f);
                labelCell.setBorderColor(new Color(191, 219, 254));
                statsTable.addCell(labelCell);

                PdfPCell valueCell = new PdfPCell(new Phrase(stat[1], boldFont));
                valueCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                valueCell.setPadding(8f);
                valueCell.setBorderColor(new Color(191, 219, 254));
                statsTable.addCell(valueCell);
            }
            document.add(statsTable);

            // Publications section
            List<Publication> publications = publicationRepository.findByAnnee(rapport.getAnnee());
            if (!publications.isEmpty()) {
                Paragraph pubTitle = new Paragraph("2. Publications " + rapport.getAnnee(), sectionFont);
                pubTitle.setSpacingBefore(10f);
                pubTitle.setSpacingAfter(12f);
                document.add(pubTitle);

                PdfPTable pubTable = new PdfPTable(3);
                pubTable.setWidthPercentage(100);
                pubTable.setWidths(new float[]{4f, 1.5f, 1.5f});
                pubTable.setSpacingAfter(20f);

                String[] headers = {"Titre", "Type", "Année"};
                for (String h : headers) {
                    PdfPCell cell = new PdfPCell(new Phrase(h, new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE)));
                    cell.setBackgroundColor(navyBlue);
                    cell.setPadding(7f);
                    pubTable.addCell(cell);
                }

                boolean alt = false;
                for (Publication pub : publications) {
                    Color bg = alt ? lightGray : Color.WHITE;
                    PdfPCell c1 = new PdfPCell(new Phrase(pub.getTitre(), normalFont));
                    c1.setBackgroundColor(bg);
                    c1.setPadding(6f);
                    pubTable.addCell(c1);

                    PdfPCell c2 = new PdfPCell(new Phrase(pub.getTypePub().name(), normalFont));
                    c2.setBackgroundColor(bg);
                    c2.setPadding(6f);
                    pubTable.addCell(c2);

                    PdfPCell c3 = new PdfPCell(new Phrase(String.valueOf(pub.getAnnee()), normalFont));
                    c3.setBackgroundColor(bg);
                    c3.setPadding(6f);
                    pubTable.addCell(c3);

                    alt = !alt;
                }
                document.add(pubTable);
            }

            // Events section
            List<Evenement> evenements = evenementRepository.findByAnnee(rapport.getAnnee());
            if (!evenements.isEmpty()) {
                Paragraph evtTitle = new Paragraph("3. Événements " + rapport.getAnnee(), sectionFont);
                evtTitle.setSpacingBefore(10f);
                evtTitle.setSpacingAfter(12f);
                document.add(evtTitle);

                PdfPTable evtTable = new PdfPTable(3);
                evtTable.setWidthPercentage(100);
                evtTable.setWidths(new float[]{4f, 2f, 2f});
                evtTable.setSpacingAfter(20f);

                String[] evtHeaders = {"Titre", "Type", "Statut"};
                for (String h : evtHeaders) {
                    PdfPCell cell = new PdfPCell(new Phrase(h, new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE)));
                    cell.setBackgroundColor(navyBlue);
                    cell.setPadding(7f);
                    evtTable.addCell(cell);
                }

                boolean altEvt = false;
                for (Evenement evt : evenements) {
                    Color bg = altEvt ? lightGray : Color.WHITE;
                    PdfPCell c1 = new PdfPCell(new Phrase(evt.getTitre(), normalFont));
                    c1.setBackgroundColor(bg);
                    c1.setPadding(6f);
                    evtTable.addCell(c1);

                    PdfPCell c2 = new PdfPCell(new Phrase(evt.getType().name(), normalFont));
                    c2.setBackgroundColor(bg);
                    c2.setPadding(6f);
                    evtTable.addCell(c2);

                    PdfPCell c3 = new PdfPCell(new Phrase(evt.getStatut().name(), normalFont));
                    c3.setBackgroundColor(bg);
                    c3.setPadding(6f);
                    evtTable.addCell(c3);

                    altEvt = !altEvt;
                }
                document.add(evtTable);
            }

            // Members section
            List<Membre> membres = membreRepository.findByActiveTrue();
            Paragraph memTitle = new Paragraph("4. Membres du Laboratoire", sectionFont);
            memTitle.setSpacingBefore(10f);
            memTitle.setSpacingAfter(12f);
            document.add(memTitle);

            PdfPTable memTable = new PdfPTable(3);
            memTable.setWidthPercentage(100);
            memTable.setWidths(new float[]{3f, 3f, 2f});
            memTable.setSpacingAfter(20f);

            String[] memHeaders = {"Nom", "Prénom", "Statut"};
            for (String h : memHeaders) {
                PdfPCell cell = new PdfPCell(new Phrase(h, new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE)));
                cell.setBackgroundColor(navyBlue);
                cell.setPadding(7f);
                memTable.addCell(cell);
            }

            boolean altMem = false;
            for (Membre m : membres) {
                Color bg = altMem ? lightGray : Color.WHITE;
                PdfPCell c1 = new PdfPCell(new Phrase(m.getNom(), normalFont));
                c1.setBackgroundColor(bg);
                c1.setPadding(6f);
                memTable.addCell(c1);

                PdfPCell c2 = new PdfPCell(new Phrase(m.getPrenom(), normalFont));
                c2.setBackgroundColor(bg);
                c2.setPadding(6f);
                memTable.addCell(c2);

                PdfPCell c3 = new PdfPCell(new Phrase(m.getStatut().name(), normalFont));
                c3.setBackgroundColor(bg);
                c3.setPadding(6f);
                memTable.addCell(c3);

                altMem = !altMem;
            }
            document.add(memTable);

            // Footer
            document.add(Chunk.NEWLINE);
            Paragraph footer = new Paragraph(
                "LIAS - Laboratoire d'Informatique et d'Applications Scientifiques\nFaculté des Sciences Ben M'Sik, Casablanca, Maroc",
                new Font(Font.HELVETICA, 9, Font.ITALIC, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }

        return baos.toByteArray();
    }
}
