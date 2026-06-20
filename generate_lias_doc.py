from docx import Document
from docx.shared import Pt, RGBColor, Cm, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import datetime

doc = Document()

# ── Page margins ──────────────────────────────────────────────────────────────
for section in doc.sections:
    section.top_margin    = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin   = Cm(3)
    section.right_margin  = Cm(2.5)

# ── Color palette ─────────────────────────────────────────────────────────────
TEAL       = RGBColor(0x0F, 0x76, 0x6E)
TEAL_DARK  = RGBColor(0x11, 0x5E, 0x59)
GRAY_TEXT  = RGBColor(0x57, 0x53, 0x4E)
GRAY_LIGHT = RGBColor(0xD6, 0xD3, 0xD1)
WHITE      = RGBColor(0xFF, 0xFF, 0xFF)
BLACK      = RGBColor(0x1C, 0x19, 0x17)
GREEN      = RGBColor(0x16, 0xA3, 0x4A)
BLUE       = RGBColor(0x1D, 0x4E, 0xD8)
AMBER      = RGBColor(0xA1, 0x62, 0x07)
RED        = RGBColor(0xDC, 0x26, 0x26)

def set_cell_bg(cell, rgb_hex: str):
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd  = OxmlElement('w:shd')
    shd.set(qn('w:val'),   'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'),  rgb_hex)
    tcPr.append(shd)

def set_cell_border(cell, side='left', color='0F766E', sz=12):
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = tcPr.find(qn('w:tcBorders'))
    if tcBorders is None:
        tcBorders = OxmlElement('w:tcBorders')
        tcPr.append(tcBorders)
    border = OxmlElement(f'w:{side}')
    border.set(qn('w:val'),   'single')
    border.set(qn('w:sz'),    str(sz))
    border.set(qn('w:space'), '0')
    border.set(qn('w:color'), color)
    tcBorders.append(border)

def heading1(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after  = Pt(6)
    run = p.add_run(text)
    run.font.size  = Pt(16)
    run.font.bold  = True
    run.font.color.rgb = TEAL_DARK
    return p

def heading2(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after  = Pt(4)
    run = p.add_run(text)
    run.font.size  = Pt(13)
    run.font.bold  = True
    run.font.color.rgb = TEAL
    return p

def heading3(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after  = Pt(2)
    run = p.add_run(text)
    run.font.size  = Pt(11)
    run.font.bold  = True
    run.font.color.rgb = GRAY_TEXT
    return p

def body(text, italic=False, color=None):
    p   = doc.add_paragraph()
    run = p.add_run(text)
    run.font.size   = Pt(10)
    run.font.italic = italic
    if color:
        run.font.color.rgb = color
    p.paragraph_format.space_after = Pt(3)
    return p

def bullet(text, level=0):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.left_indent   = Cm(0.5 + level * 0.5)
    p.paragraph_format.space_after   = Pt(2)
    run = p.add_run(text)
    run.font.size = Pt(10)
    return p

def separator():
    p   = doc.add_paragraph()
    run = p.add_run('─' * 70)
    run.font.size      = Pt(8)
    run.font.color.rgb = GRAY_LIGHT
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after  = Pt(4)

def make_table_with_header(headers, rows, col_widths=None, header_bg='0F766E'):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.LEFT

    # Header row
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        set_cell_bg(hdr_cells[i], header_bg)
        run = hdr_cells[i].paragraphs[0].runs[0]
        run.font.color.rgb = WHITE
        run.font.bold      = True
        run.font.size      = Pt(10)
        hdr_cells[i].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Data rows
    for ri, row_data in enumerate(rows):
        row_cells = table.rows[ri + 1].cells
        for ci, val in enumerate(row_data):
            row_cells[ci].text = str(val)
            row_cells[ci].paragraphs[0].runs[0].font.size = Pt(9)
            if ri % 2 == 0:
                set_cell_bg(row_cells[ci], 'F0FDFA')

    # Column widths
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Cm(w)

    doc.add_paragraph()
    return table

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE DE COUVERTURE
# ══════════════════════════════════════════════════════════════════════════════
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(60)
p.paragraph_format.space_after  = Pt(4)
run = p.add_run('LIAS')
run.font.size      = Pt(42)
run.font.bold      = True
run.font.color.rgb = TEAL_DARK
p.alignment        = WD_ALIGN_PARAGRAPH.CENTER

p2 = doc.add_paragraph()
run2 = p2.add_run("Laboratoire d'Informatique et d'Applications Scientifiques")
run2.font.size      = Pt(14)
run2.font.color.rgb = GRAY_TEXT
run2.font.italic    = True
p2.alignment        = WD_ALIGN_PARAGRAPH.CENTER

p3 = doc.add_paragraph()
p3.paragraph_format.space_before = Pt(8)
run3 = p3.add_run('Documentation Technique Complète')
run3.font.size      = Pt(18)
run3.font.bold      = True
run3.font.color.rgb = TEAL
p3.alignment        = WD_ALIGN_PARAGRAPH.CENTER

doc.add_paragraph().paragraph_format.space_after = Pt(40)

# Info box
tbl = doc.add_table(rows=4, cols=2)
tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
infos = [
    ('Faculté', "Faculté des Sciences Ben M'Sik"),
    ('Stack', 'Spring Boot 3.3 + Next.js 14 + PostgreSQL'),
    ('Auteur', 'Mouad Boulatar'),
    ('Date', datetime.datetime.now().strftime('%d/%m/%Y')),
]
for ri, (k, v) in enumerate(infos):
    cells = tbl.rows[ri].cells
    cells[0].text = k
    cells[1].text = v
    set_cell_bg(cells[0], '0F766E')
    r0 = cells[0].paragraphs[0].runs[0]
    r0.font.color.rgb = WHITE
    r0.font.bold      = True
    r0.font.size      = Pt(10)
    cells[1].paragraphs[0].runs[0].font.size = Pt(10)

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  SECTION 1 — DESCRIPTION DU PROJET
# ══════════════════════════════════════════════════════════════════════════════
heading1('1. Description du Projet')
body(
    "LIAS-App est une application web full-stack de gestion d'un laboratoire de recherche universitaire. "
    "Elle couvre la gestion des membres, des équipes, des publications scientifiques, des événements, "
    "réunions, conventions, documents, matériel, messagerie interne et notifications en temps réel.",
)
body(
    "L'application est construite avec Spring Boot 3.3 (backend REST) et Next.js 14 App Router (frontend), "
    "sécurisée par JWT et déployable en mode standalone Docker.",
)

separator()

# ══════════════════════════════════════════════════════════════════════════════
#  SECTION 2 — RÔLES ET ACTIONS
# ══════════════════════════════════════════════════════════════════════════════
heading1('2. Rôles et Actions par Rôle')

roles_data = [
    ('ADMIN', 'Administrateur système', [
        'Gérer tous les comptes utilisateurs (activer, désactiver, changer de rôle)',
        'Accéder au journal d\'audit complet (toutes les actions tracées)',
        'Gérer les mandats des membres',
        'Gérer le stock de matériel',
        'Recherche globale dans toute l\'application',
        'Consulter les statistiques globales',
        'Messagerie interne',
        'Notifications',
    ]),
    ('DIRECTEUR', 'Directeur du laboratoire', [
        'Modifier les informations du laboratoire',
        'Voir et gérer tous les membres',
        'Valider ou refuser les demandes d\'adhésion',
        'Approuver ou rejeter les documents (dépôt auto-approuvé pour lui-même)',
        'Créer et gérer les événements',
        'Gérer les conventions partenaires',
        'Gérer le matériel et valider les demandes',
        'Consulter les statistiques avancées',
        'Générer le rapport annuel (export PDF)',
        'Gérer les équipes et nommer les chefs',
        'Voir l\'historique des modifications',
        'Messagerie globale, équipe et directe',
    ]),
    ('VICE_DIRECTEUR', 'Adjoint du directeur', [
        'Consulter la liste des membres',
        'Gérer les événements',
        'Consulter les conventions',
        'Accéder aux publications',
        'Consulter les statistiques',
        'Gérer les documents',
        'Messagerie',
        'Participer aux réunions',
    ]),
    ('CHEF_EQUIPE', 'Chef d\'équipe de recherche', [
        'Gérer les membres de son équipe',
        'Publier et consulter les publications de l\'équipe',
        'Organiser des événements',
        'Participer aux réunions',
        'Gérer les documents de l\'équipe',
        'Messagerie équipe et directe',
        'Demander du matériel',
    ]),
    ('MEMBRE (Permanent · Associé · Doctorant)', 'Chercheur du laboratoire', [
        'Gérer son profil et son mot de passe',
        'Déposer et consulter ses publications',
        'S\'inscrire aux événements',
        'Consulter et déposer des documents',
        'Messagerie globale et directe',
        'Recevoir et gérer ses notifications',
        'Demander du matériel',
        'Effectuer des recherches dans le système',
    ]),
]

for role_name, role_desc, actions in roles_data:
    heading2(f'Rôle : {role_name}')
    body(role_desc, italic=True, color=GRAY_TEXT)
    for action in actions:
        bullet(action)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

separator()

# ══════════════════════════════════════════════════════════════════════════════
#  SECTION 3 — DIAGRAMME DE CLASSES (tableau)
# ══════════════════════════════════════════════════════════════════════════════
heading1('3. Entités Principales (Diagramme de Classes)')

body(
    'Le modèle de données comprend 13 entités principales. Chaque entité correspond à '
    'une table en base PostgreSQL gérée via JPA/Hibernate.'
)

entities = [
    ('Membre',               'id, nom, prenom, email, photo, biographie, statut (StatutMembre), active, dateNaissance, dateEmbauche',
     'Centrale — liée à toutes les autres entités'),
    ('Laboratoire',          'id, nom, acronyme, description, adresse, dateCreation, axesRecherche',
     'Entité singleton du laboratoire'),
    ('Equipe',               'id, nom, description, axeRecherche, dateCreation, chef (Membre)',
     '1 Membre peut appartenir à plusieurs équipes'),
    ('AffiliationMembre',    'id, membre, equipe, dateDebut, dateFin, actif, motifDepart',
     'Table d\'association Membre ↔ Equipe'),
    ('RoleMembre',           'id, membre, role (RoleSysteme), dateDebut, dateFin, actif',
     'Historique des rôles d\'un membre'),
    ('Publication',          'id, titre, resume, annee, doi, lienUrl, revue, type (TypePublication), fichierPath',
     'Liée à plusieurs membres via AuteurPublication'),
    ('Evenement',            'id, titre, description, type (TypeEvenement), dateDebut, dateFin, lieu, statut (StatutEvenement)',
     'Peut avoir des participants et des documents'),
    ('Reunion',              'id, titre, dateReunion, lieu, ordreJour, compteRendu, statut (StatutReunion), pvPath',
     'A des participants (ParticipantReunion) et un PV'),
    ('Document',             'id, nom, cheminFichier, type (TypeDocument), statut (StatutDocument), taille, mimeType',
     'Peut être lié à un événement, réunion ou convention'),
    ('Convention',           'id, titre, partenaire, typePartenaire, pays, dateSignature, dateExpiration, statut (StatutConvention)',
     'A des activités (ActiviteConvention)'),
    ('Materiel',             'id, nom, description, quantiteTotale, quantiteDisponible, type (TypeMateriel)',
     'Géré via DemandeMateriel et DistributionMateriel'),
    ('Notification',         'id, membre, message, type (TypeNotification), lien, lue, dateCreation',
     'Notifications par membre, liées à un type d\'événement'),
    ('Message',              'id, expediteur, destinataire, equipe, contenu, type (MessageType), fichierUrl, dateEnvoi, lue',
     'Chat global / équipe / direct'),
    ('AuditLog',             'id, entite, entiteId, action, methode, utilisateur, details, timestamp',
     'Journal de toutes les actions (via AOP AspectJ)'),
    ('DemandeAdhesion',      'id, nom, prenom, email, statut (StatutDemande), motivation, cvPath, photoPath',
     'Candidature externe, pas encore un Membre'),
]

make_table_with_header(
    ['Entité', 'Attributs clés', 'Rôle / Notes'],
    entities,
    col_widths=[3.5, 7.5, 5],
)

# Enums
heading2('Énumérations (Enums)')
enums = [
    ('RoleSysteme',       'ADMIN, DIRECTEUR, VICE_DIRECTEUR, CHEF_EQUIPE, MEMBRE'),
    ('StatutMembre',      'PERMANENT, ASSOCIE, DOCTORANT, RETRAITE, ANCIEN'),
    ('TypeDocument',      'RAPPORT, THESE, ARTICLE, BREVET, CONTRAT, AUTRE'),
    ('TypeEvenement',     'CONFERENCE, SEMINAIRE, ATELIER, JOURNEE_ETUDE, AUTRE'),
    ('TypePublication',   'ARTICLE, CONFERENCE, THESE, LIVRE, CHAPITRE, RAPPORT, AUTRE'),
    ('StatutDemande',     'EN_ATTENTE, ACCEPTEE, REFUSEE'),
    ('StatutConvention',  'EN_COURS, EXPIREE, SUSPENDUE'),
    ('TypeMateriel',      'INFORMATIQUE, LABORATOIRE, BUREAU, AUTRE'),
    ('TypeNotification',  'EVENEMENT, VALIDATION_DEMANDE, VALIDATION_ADHESION, REFUS_ADHESION,\nNOUVEAU_DOCUMENT, NOUVEAU_MEMBRE, DISTRIBUTION_MATERIEL, REUNION,\nPUBLICATION, DEPART_MEMBRE'),
    ('StatutReunion',     'PLANIFIEE, EN_COURS, TERMINEE, ANNULEE'),
    ('StatutEvenement',   'PLANIFIE, EN_COURS, TERMINE, ANNULE'),
    ('MessageType',       'GLOBAL, TEAM, DIRECT'),
]
make_table_with_header(['Enum', 'Valeurs'], enums, col_widths=[4.5, 11.5])

separator()

# ══════════════════════════════════════════════════════════════════════════════
#  SECTION 4 — ENDPOINTS API
# ══════════════════════════════════════════════════════════════════════════════
heading1('4. Endpoints API REST')
body('Base URL : http://localhost:8080/api/v1', italic=True, color=TEAL)
body('Toutes les routes sauf /auth/** nécessitent un header Authorization: Bearer <JWT>', italic=True, color=GRAY_TEXT)
doc.add_paragraph()

endpoint_groups = [
    ('Authentification', '/api/v1/auth', [
        ('POST',   '/login',                           'Connexion — retourne JWT + infos membre'),
        ('GET',    '/me',                              'Profil du membre connecté'),
    ]),
    ('Membres', '/api/v1/membres', [
        ('GET',    '/',                                'Liste tous les membres'),
        ('GET',    '/{id}',                            'Détail d\'un membre'),
        ('GET',    '/search',                          'Recherche par nom/email/statut'),
        ('GET',    '/equipe/{equipeId}',               'Membres d\'une équipe'),
        ('PUT',    '/{id}',                            'Modifier profil'),
        ('PUT',    '/{id}/statut',                     'Changer le statut'),
        ('PUT',    '/{id}/password',                   'Changer le mot de passe'),
        ('PUT',    '/{id}/equipe',                     'Affecter à une équipe'),
        ('POST',   '/{id}/photo',                      'Upload photo de profil'),
        ('GET',    '/{id}/historique',                 'Historique des modifications'),
        ('DELETE', '/{id}',                            'Supprimer (marquer inactif)'),
        ('POST',   '/reactivation',                    'Réactiver un ancien membre'),
    ]),
    ('Équipes', '/api/v1/equipes', [
        ('GET',    '/',                                'Toutes les équipes'),
        ('GET',    '/mes-equipes',                     'Équipes du membre connecté'),
        ('GET',    '/{id}',                            'Détail d\'une équipe'),
        ('POST',   '/',                                'Créer une équipe'),
        ('POST',   '/complet',                         'Créer avec membres d\'emblée'),
        ('PUT',    '/{id}',                            'Modifier'),
        ('GET',    '/{id}/membres',                    'Membres de l\'équipe'),
        ('POST',   '/{id}/membres',                    'Ajouter un membre'),
        ('DELETE', '/{id}/membres/{membreId}',         'Retirer un membre'),
        ('PUT',    '/{id}/chef',                       'Nommer un chef d\'équipe'),
        ('DELETE', '/{id}',                            'Supprimer l\'équipe'),
        ('GET',    '/{id}/affiliations',               'Historique des affiliations'),
        ('GET',    '/{id}/historique',                 'Historique des changements'),
    ]),
    ('Publications', '/api/v1/publications', [
        ('GET',    '/',                                'Toutes les publications'),
        ('GET',    '/{id}',                            'Détail'),
        ('POST',   '/',                                'Créer (multipart — PDF joint possible)'),
        ('GET',    '/{id}/download',                   'Télécharger le fichier PDF'),
        ('PUT',    '/{id}',                            'Modifier'),
        ('DELETE', '/{id}',                            'Supprimer'),
        ('GET',    '/membre/{membreId}',               'Publications d\'un membre'),
        ('GET',    '/equipe/{equipeId}',               'Publications d\'une équipe'),
        ('GET',    '/annee/{annee}',                   'Publications d\'une année'),
    ]),
    ('Événements', '/api/v1/evenements', [
        ('GET',    '/',                                'Tous les événements'),
        ('POST',   '/',                                'Créer un événement'),
        ('PUT',    '/{id}',                            'Modifier'),
        ('GET',    '/sans-distribution',               'Événements sans distribution matériel'),
    ]),
    ('Réunions', '/api/v1/reunions', [
        ('GET',    '/',                                'Toutes les réunions'),
        ('GET',    '/{id}',                            'Détail'),
        ('POST',   '/',                                'Créer'),
        ('GET',    '/{id}/presences',                  'Liste des présences'),
        ('POST',   '/{id}/participants/{membreId}',    'Ajouter un participant'),
        ('DELETE', '/{id}/participants/{membreId}',    'Retirer un participant'),
        ('POST',   '/{id}/presence/{membreId}',        'Marquer un membre présent'),
        ('POST',   '/{id}/pv',                         'Créer le procès-verbal'),
        ('GET',    '/{id}/pv',                         'Consulter le PV'),
    ]),
    ('Documents', '/api/v1/documents', [
        ('GET',    '/',                                'Tous les documents'),
        ('GET',    '/pending',                         'Documents en attente d\'approbation'),
        ('GET',    '/mes-documents',                   'Documents du membre connecté'),
        ('GET',    '/historique',                      'Historique global'),
        ('POST',   '/upload',                          'Téléverser un document'),
        ('PUT',    '/{id}/approuver',                  'Approuver (DIRECTEUR)'),
        ('PUT',    '/{id}/rejeter',                    'Rejeter avec motif'),
        ('GET',    '/{id}/download',                   'Télécharger'),
        ('DELETE', '/{id}',                            'Supprimer'),
        ('GET',    '/evenement/{evenementId}',         'Documents d\'un événement'),
        ('GET',    '/reunion/{reunionId}',             'Documents d\'une réunion'),
        ('GET',    '/convention/{conventionId}',       'Documents d\'une convention'),
    ]),
    ('Conventions', '/api/v1/conventions', [
        ('GET',    '/',                                'Toutes les conventions'),
        ('GET',    '/{id}',                            'Détail'),
        ('POST',   '/',                                'Créer'),
        ('PUT',    '/{id}',                            'Modifier'),
        ('POST',   '/{id}/activites',                  'Ajouter une activité'),
    ]),
    ('Matériel', '/api/v1/materiels', [
        ('GET',    '/',                                'Liste du matériel'),
        ('POST',   '/',                                'Ajouter du matériel'),
        ('PUT',    '/{id}',                            'Modifier'),
        ('GET',    '/stock',                           'État du stock'),
        ('POST',   '/distribuer',                      'Distribuer du matériel'),
        ('GET',    '/historique',                      'Historique des distributions'),
        ('GET',    '/{id}/beneficiaires',              'Bénéficiaires d\'un matériel'),
        ('GET',    '/{id}/non-beneficiaires',          'Non-bénéficiaires'),
    ]),
    ('Demandes Adhésion', '/api/v1/demandes-adhesion', [
        ('GET',    '/statut-email',                    'Vérifier statut par email (public)'),
        ('POST',   '/',                                'Soumettre une candidature (public)'),
        ('GET',    '/',                                'Liste des demandes (DIRECTEUR)'),
        ('GET',    '/{id}',                            'Détail'),
        ('PUT',    '/{id}/accepter',                   'Accepter → crée le compte Membre'),
        ('PUT',    '/{id}/refuser',                    'Refuser avec motif'),
        ('POST',   '/{id}/cv',                         'Attacher le CV'),
        ('POST',   '/{id}/photo',                      'Attacher la photo'),
        ('GET',    '/{id}/cv',                         'Télécharger le CV'),
    ]),
    ('Demandes Document', '/api/v1/demandes-document', [
        ('POST',   '/',                                'Faire une demande de document'),
        ('GET',    '/mes-demandes',                    'Mes demandes'),
        ('GET',    '/',                                'Toutes (DIRECTEUR)'),
        ('PUT',    '/{id}/accepter',                   'Accepter'),
        ('PUT',    '/{id}/refuser',                    'Refuser'),
    ]),
    ('Demandes Matériel', '/api/v1/demandes-materiel', [
        ('POST',   '/',                                'Faire une demande'),
        ('GET',    '/',                                'Toutes (ADMIN/DIRECTEUR)'),
        ('GET',    '/mes-demandes',                    'Mes demandes'),
        ('PUT',    '/{id}/valider',                    'Valider'),
        ('PUT',    '/{id}/refuser',                    'Refuser'),
    ]),
    ('Participations Événements', '/api/v1/participations', [
        ('GET',    '/mes-demandes',                    'Mes demandes de participation'),
        ('GET',    '/',                                'Toutes les participations'),
        ('GET',    '/evenement/{evenementId}',         'Participations d\'un événement'),
        ('POST',   '/evenement/{evenementId}',         'S\'inscrire à un événement'),
        ('PUT',    '/{id}/accepter',                   'Accepter'),
        ('PUT',    '/{id}/refuser',                    'Refuser'),
    ]),
    ('Messagerie', '/api/v1/messages', [
        ('POST',   '/',                                'Envoyer un message (multipart)'),
        ('GET',    '/global',                          'Messages globaux du laboratoire'),
        ('GET',    '/team/{equipeId}',                 'Messages d\'une équipe'),
        ('GET',    '/direct/{otherId}',                'Messages directs avec un membre'),
        ('GET',    '/conversations',                   'Liste des conversations'),
        ('GET',    '/mes-evenements',                  'Messages liés à mes événements'),
        ('GET',    '/event/{evenementId}',             'Messages d\'un événement'),
        ('PUT',    '/direct/{otherId}/read',           'Marquer comme lus'),
        ('GET',    '/unread-count',                    'Nombre de messages non lus'),
    ]),
    ('Notifications', '/api/v1/notifications', [
        ('GET',    '/',                                'Toutes mes notifications'),
        ('GET',    '/non-lues',                        'Notifications non lues'),
        ('PUT',    '/{id}/lue',                        'Marquer une notification lue'),
        ('PUT',    '/marquer-toutes-lues',             'Tout marquer comme lu'),
        ('GET',    '/non-lues/count',                  'Nombre de non lues (badge)'),
    ]),
    ('Statistiques', '/api/v1/stats', [
        ('GET',    '/dashboard',                       'Statistiques globales du tableau de bord'),
        ('GET',    '/publications/par-annee',          'Publications par année'),
        ('GET',    '/membres/par-statut',              'Répartition des membres'),
        ('GET',    '/evenements/par-type',             'Événements par type'),
    ]),
    ('Rapports', '/api/v1/rapports', [
        ('GET',    '/',                                'Liste des rapports annuels'),
        ('POST',   '/generer',                         'Générer le rapport de l\'année'),
        ('GET',    '/{id}',                            'Détail d\'un rapport'),
        ('GET',    '/{id}/export-pdf',                 'Exporter en PDF'),
    ]),
    ('Administration', '/api/v1/admin/comptes', [
        ('GET',    '/',                                'Tous les comptes'),
        ('GET',    '/roles-systeme',                   'Liste des rôles disponibles'),
        ('PUT',    '/{id}/desactiver',                 'Désactiver un compte'),
        ('PUT',    '/{id}/reactiver',                  'Réactiver'),
        ('PUT',    '/{id}/statut',                     'Changer le statut'),
        ('GET',    '/historique',                      'Historique global des comptes'),
        ('GET',    '/{id}/historique',                 'Historique d\'un compte'),
        ('PUT',    '/{id}/role',                       'Changer le rôle'),
    ]),
    ('Audit', '/api/v1/audit-logs', [
        ('GET',    '/',                                'Journal d\'audit complet'),
        ('GET',    '/search',                          'Recherche dans le journal'),
        ('GET',    '/entite/{entite}',                 'Logs par type d\'entité'),
        ('GET',    '/utilisateur/{utilisateur}',       'Logs par utilisateur'),
    ]),
    ('Recherche & Divers', '/api/v1/search · /mandats · /roles · /pv · /laboratoire', [
        ('GET',    '/search',                          'Recherche globale multi-entités'),
        ('GET',    '/mandats',                         'Liste des mandats'),
        ('GET',    '/roles',                           'Rôles système disponibles'),
        ('GET',    '/pv',                              'Tous les procès-verbaux'),
        ('GET',    '/laboratoire',                     'Informations du laboratoire'),
        ('PUT',    '/laboratoire/{id}',                'Modifier le laboratoire (DIRECTEUR)'),
    ]),
]

method_colors = {
    'GET':    ('DCFCE7', '15803D'),
    'POST':   ('DBEAFE', '1D4ED8'),
    'PUT':    ('FEF9C3', 'A16207'),
    'DELETE': ('FEE2E2', 'B91C1C'),
}

for group_name, base_url, endpoints in endpoint_groups:
    heading2(f'{group_name}')
    body(f'Base : {base_url}', italic=True, color=TEAL)

    table = doc.add_table(rows=1 + len(endpoints), cols=3)
    table.style = 'Table Grid'
    hdr = table.rows[0].cells
    for ci, h in enumerate(['Méthode', 'Route', 'Description']):
        hdr[ci].text = h
        set_cell_bg(hdr[ci], '115E59')
        r = hdr[ci].paragraphs[0].runs[0]
        r.font.color.rgb = WHITE
        r.font.bold      = True
        r.font.size      = Pt(9)

    for ri, (method, route, desc) in enumerate(endpoints):
        cells = table.rows[ri + 1].cells
        cells[0].text = method
        cells[1].text = route
        cells[2].text = desc
        bg_hex, txt_hex = method_colors.get(method, ('F5F5F4', '292524'))
        set_cell_bg(cells[0], bg_hex)
        r0 = cells[0].paragraphs[0].runs[0]
        r0.font.bold = True
        r0.font.size = Pt(9)
        r0.font.color.rgb = RGBColor(
            int(txt_hex[0:2], 16), int(txt_hex[2:4], 16), int(txt_hex[4:6], 16)
        )
        for ci in [1, 2]:
            cells[ci].paragraphs[0].runs[0].font.size = Pt(9)
        if ri % 2 == 0:
            set_cell_bg(cells[1], 'F9FAFB')
            set_cell_bg(cells[2], 'F9FAFB')

    for row in table.rows:
        row.cells[0].width = Cm(2.2)
        row.cells[1].width = Cm(8)
        row.cells[2].width = Cm(5.8)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

separator()

# ══════════════════════════════════════════════════════════════════════════════
#  SECTION 5 — STRUCTURE DU PROJET
# ══════════════════════════════════════════════════════════════════════════════
heading1('5. Structure du Projet')

heading2('5.1 Backend — Spring Boot 3.3')
make_table_with_header(
    ['Package / Répertoire', 'Contenu'],
    [
        ('com.lias.config',      'AuditConfig, CorsConfig, SecurityConfig (JWT), WebMvcConfig'),
        ('com.lias.controller',  '24 controllers REST — un par domaine métier'),
        ('com.lias.dto',         'DTOs request/* et response/* — séparation modèle/API'),
        ('com.lias.entity',      '20+ entités JPA mappées sur PostgreSQL'),
        ('com.lias.enums',       '12 énumérations Java (statuts, types, rôles)'),
        ('com.lias.repository',  'Interfaces JpaRepository avec requêtes JPQL personnalisées'),
        ('com.lias.service',     'Logique métier — un service par domaine — @Transactional'),
        ('com.lias.security',    'JwtUtil, JwtFilter, UserDetailsServiceImpl'),
        ('com.lias.aspect',      'AuditAspect — journalisation automatique via @Around (AOP)'),
        ('resources/',           'application.properties — DB, JWT secret, CORS, upload path'),
        ('pom.xml',              'Spring Boot 3.3, Spring Security, Spring Data JPA, Lombok, PostgreSQL, JWT'),
    ],
    col_widths=[5.5, 10.5],
)

heading2('5.2 Frontend — Next.js 14 App Router')
make_table_with_header(
    ['Répertoire', 'Contenu'],
    [
        ('src/app/',                  'Pages Next.js (App Router) — layout.tsx racine'),
        ('src/app/auth/',             'login, demande-adhesion, statut-adhesion'),
        ('src/app/dashboard/',        'Layout shell (Sidebar + Header) + 25+ pages dashboard'),
        ('src/app/(public)/',         'Pages publiques : accueil, membres, équipes, événements, publications'),
        ('src/components/layout/',    'Sidebar.tsx (nav filtrée par rôle) + Header.tsx (badge notif)'),
        ('src/components/ui/',        'Card.tsx, Badge.tsx, Avatar.tsx — design system teal'),
        ('src/services/',             '15+ fichiers de services — appels API REST avec fetch'),
        ('src/store/',                'authStore.ts — Zustand avec persist localStorage'),
        ('src/types/',                'index.ts — toutes les interfaces TypeScript du projet'),
        ('src/lib/',                  'utils.ts — cn(), formatDate(), formatDateTime(), getStatutColor()'),
        ('src/app/fonts/',            'GeistVF.woff, GeistMonoVF.woff — polices variables locales'),
        ('tailwind.config.ts',        'Palette teal scientifique + tokens spacing/shadow/animation'),
        ('src/app/globals.css',       'Tokens CSS :root + @layer base/utilities/components + scrollbar'),
        ('next.config.mjs',           'Standalone output + optimizePackageImports lucide-react, recharts'),
    ],
    col_widths=[5.5, 10.5],
)

separator()

# ══════════════════════════════════════════════════════════════════════════════
#  SECTION 6 — STACK TECHNIQUE
# ══════════════════════════════════════════════════════════════════════════════
heading1('6. Stack Technique')

make_table_with_header(
    ['Couche', 'Technologie', 'Version', 'Rôle'],
    [
        ('Backend',     'Spring Boot',        '3.3',      'Framework applicatif Java'),
        ('Backend',     'Spring Security',    '6.x',      'Authentification JWT'),
        ('Backend',     'Spring Data JPA',    '3.3',      'ORM Hibernate / PostgreSQL'),
        ('Backend',     'PostgreSQL',         '15+',      'Base de données relationnelle'),
        ('Backend',     'Lombok',             'Latest',   'Réduction boilerplate Java'),
        ('Backend',     'Maven',              '3.9',      'Gestion des dépendances'),
        ('Backend',     'AspectJ (AOP)',      'intégré',  'Journalisation automatique'),
        ('Frontend',    'Next.js',            '14.2',     'Framework React App Router'),
        ('Frontend',    'TypeScript',         '5.x',      'Typage statique'),
        ('Frontend',    'Tailwind CSS',       '3.4',      'Styling utilitaire'),
        ('Frontend',    'Zustand',            '4.x',      'State management (auth)'),
        ('Frontend',    'Lucide React',       'Latest',   'Icônes SVG'),
        ('Frontend',    'Recharts',           '2.x',      'Graphiques statistiques'),
        ('Frontend',    'Geist (police)',     'VF',       'Police variable locale'),
        ('Auth',        'JWT (JJWT)',         '0.11+',    'Tokens d\'accès stateless'),
    ],
    col_widths=[3, 4, 2.5, 6.5],
)

separator()

# ══════════════════════════════════════════════════════════════════════════════
#  SECTION 7 — FLUX D'AUTHENTIFICATION
# ══════════════════════════════════════════════════════════════════════════════
heading1('7. Flux d\'Authentification')

bullet('Le candidat soumet /api/v1/demandes-adhesion (public) avec nom, email, motivation, CV.')
bullet('Le DIRECTEUR reçoit une notification → accepte ou refuse via /api/v1/demandes-adhesion/{id}/accepter.')
bullet('À l\'acceptation, Spring crée automatiquement un compte Membre avec rôle MEMBRE.')
bullet('Le membre se connecte via POST /api/v1/auth/login → reçoit un JWT.')
bullet('Toutes les requêtes suivantes envoient Authorization: Bearer <token>.')
bullet('JwtFilter valide le token à chaque requête → injecte le principal dans le contexte Spring Security.')
bullet('Le frontend Zustand stocke le token + les infos membre dans localStorage.')
bullet('À l\'expiration du token → redirection automatique vers /auth/login.')

doc.add_paragraph()
separator()

# ══════════════════════════════════════════════════════════════════════════════
#  SECTION 8 — SYSTÈME DE NOTIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════
heading1('8. Système de Notifications')

body('Les notifications sont créées automatiquement côté backend lors de certains événements métier :')

make_table_with_header(
    ['Type', 'Déclencheur', 'Destinataires'],
    [
        ('NOUVEAU_MEMBRE',          'Acceptation d\'une adhésion',               'DIRECTEUR + VICE_DIRECTEUR'),
        ('VALIDATION_ADHESION',     'Adhésion acceptée',                          'Candidat (nouveau membre)'),
        ('REFUS_ADHESION',          'Adhésion refusée',                           'Candidat'),
        ('PUBLICATION',             'Nouvelle publication soumise',               'Membres du laboratoire'),
        ('EVENEMENT',               'Nouvel événement créé',                      'Membres concernés'),
        ('REUNION',                 'Réunion planifiée',                          'Participants invités'),
        ('NOUVEAU_DOCUMENT',        'Document déposé en attente',                 'DIRECTEUR'),
        ('VALIDATION_DEMANDE',      'Document approuvé/rejeté',                   'Déposant'),
        ('DISTRIBUTION_MATERIEL',   'Matériel distribué',                         'Bénéficiaire'),
        ('DEPART_MEMBRE',           'Membre marqué ANCIEN ou RETRAITE',           'DIRECTEUR'),
    ],
    col_widths=[4.5, 6, 5.5],
)

body('Frontend : le Header badge poll /notifications/non-lues toutes les 30 secondes + écoute l\'événement DOM notif-lue pour une mise à jour immédiate après lecture.', italic=True, color=GRAY_TEXT)

separator()

# Footer
p_footer = doc.add_paragraph()
p_footer.paragraph_format.space_before = Pt(20)
run_f = p_footer.add_run(f'LIAS-App — Documentation générée le {datetime.datetime.now().strftime("%d/%m/%Y à %H:%M")} · Mouad Boulatar')
run_f.font.size      = Pt(8)
run_f.font.italic    = True
run_f.font.color.rgb = GRAY_TEXT
p_footer.alignment   = WD_ALIGN_PARAGRAPH.CENTER

# Save
out = r'C:\Users\hp\Desktop\LIAS_Documentation_Technique.docx'
doc.save(out)
print(f'Fichier créé : {out}')
