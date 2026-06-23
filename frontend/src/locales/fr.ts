export type Dict = {
  nav:     Record<string, string>;
  header:  Record<string, string>;
  mobile:  Record<string, string>;
  sidebar: Record<string, string>;
  pub:     Record<string, string>;
  dash:    Record<string, string>;
};

export const fr: Dict = {
  nav: {
    dashboard:        'Tableau de bord',
    mySpace:          'Mon espace',
    profile:          'Mon profil',
    search:           'Recherche',
    members:          'Membres',
    teams:            'Équipes',
    publications:     'Publications',
    events:           'Événements',
    calendar:         'Calendrier',
    meetings:         'Réunions',
    documents:        'Documents',
    myDocuments:      'Mes documents',
    conventions:      'Conventions',
    messaging:        'Messagerie',
    equipmentReqs:    'Demandes matériel',
    laboratory:       'Laboratoire',
    docApproval:      'Approbation documents',
    equipment:        'Matériel',
    memberships:      'Adhésions',
    annualReport:     'Rapport annuel',
    statistics:       'Statistiques',
    accounts:         'Comptes',
    mandates:         'Mandats',
    auditLog:         "Journal d'audit",
    notifications:    'Notifications',
  },
  header: {
    openMenu:         'Ouvrir le menu',
    notifications:    'Notifications',
    myProfile:        'Mon profil',
    logout:           'Se déconnecter',
    darkMode:         'Mode sombre',
    lightMode:        'Mode clair',
    switchLang:       'English',
  },
  mobile: {
    home:             'Accueil',
    messages:         'Messages',
    notifs:           'Notifs',
    menu:             'Menu',
  },
  sidebar: {
    collapse:         'Réduire le menu',
    close:            'Fermer le menu',
  },

  // ── Pages publiques ────────────────────────────────────────────────
  pub: {
    // nav
    login:                'Connexion',
    join:                 'Adhésion',
    backHome:             '← Retour à l\'accueil',
    footer:               '© 2025 LIAS - Faculté des Sciences Ben M\'Sik, Casablanca, Maroc',

    // homepage
    about:                'À propos du laboratoire',
    founded:              'Fondé le',
    researchAxes:         'Axes de recherche :',
    loading:              'Chargement...',
    keyFigures:           'Chiffres clés',
    members:              'Membres',
    publications:         'Publications',
    events:               'Événements',
    teams:                'Équipes',
    recentMembers:        'Membres récents',
    viewAllMembers:       'Voir tous les membres →',
    latestPublications:   'Dernières publications',
    viewAllPubs:          'Voir toutes les publications →',
    unspecifiedAuthors:   'Auteurs non spécifiés',
    ourTeams:             'Nos Équipes',
    viewAllTeams:         'Voir toutes les équipes →',
    noTeams:              'Aucune équipe disponible.',
    upcomingEvents:       'Prochains événements',

    // membres
    membresTitle:         'Nos Membres',
    direction:            'Direction du Laboratoire',
    director:             'Directeur',
    viceDirector:         'Vice-Directeur',
    teamLeaders:          'Chefs d\'Équipe',
    teamLeaderRole:       'Chef d\'Équipe',
    teamLeaderOf:         'Chef d\'équipe de :',
    teamLabel:            'Équipe :',
    allMembers:           'Tous les Membres',

    // equipes
    equipesTitle:         'Nos Équipes',
    teamLeaderSmall:      'Chef d\'équipe',
    noEquipes:            'Aucune équipe disponible.',

    // events
    eventsTitle:          'Événements scientifiques',
    eventsSubtitle:       'Événements scientifiques',
    eventsSearch:         'Rechercher un événement...',
    allTypes:             'Tous les types',
    loadError:            'Impossible de charger les données.',
    retry:                'Réessayer',
    noEvents:             'Aucun événement à venir.',

    // publications
    pubsTitle:            'Publications',
    pubsSubtitle:         'Publications scientifiques',
    pubsSearch:           'Rechercher une publication...',
    allYears:             'Toutes les années',
    noPubs:               'Aucune publication trouvée.',
    journal:              'Revue :',
    conference:           'Conférence :',
  },

  // ── Dashboard pages ────────────────────────────────────────────────
  dash: {
    greeting:             'Bonjour,',
    roleAdmin:            'Administrateur système',
    roleDirector:         'Directeur du laboratoire',
    roleViceDir:          'Vice-Directeur',
    roleTeamLeader:       "Chef d'équipe",
    rolePermanent:        'Membre permanent',
    roleAssociate:        'Membre associé',
    rolePhd:              'Doctorant',

    activeMembers:        'Membres actifs',
    publications:         'Publications',
    events:               'Événements',
    teams:                'Équipes',
    phds:                 'Doctorants',
    activeConventions:    'Conventions actives',
    pendingMemberships:   'Adhésions en attente',

    upcomingEvents:       'Prochains événements',
    latestPublications:   'Dernières publications',
    recentPublications:   'Publications récentes',
    noPlannedEvent:       'Aucun événement planifié',
    recentActions:        'Historique des actions récentes',
    noActions:            'Aucune action enregistrée',
    viewAll:              'Voir tout',

    availableEvents:      'Événements disponibles',
    noEventsAvail:        'Aucun événement disponible.',
    participate:          'Participer',
    confirmed:            'Confirmé',
    pending:              'En attente',
    refused:              'Refusé',
    needsConfirmation:    'Votre participation nécessite la confirmation du directeur du laboratoire.',

    myPublications:       'Mes publications',
    noPubs:               "Aucune publication pour l'instant",
    activeTeams:          'Équipe(s) actives',
    currentTeam:          'Équipe actuelle :',
    since:                'Depuis le',
    researchTeam:         'Équipe de recherche :',
    since2:               'Depuis',

    associateTitle:       'Membre Associé',
    associateAccess:      'Accès : consultation, événements, publications selon droits accordés',
    availablePubs:        'Publications disponibles',

    phdTitle:             'Doctorant',
    phdAccess:            'Accès : ajouter et consulter des publications · Mon profil · Événements',
    add:                  'Ajouter',

    viceDirTitle:         'Vice-Directeur',
    viceDirAccess:        'Accès supervision : statistiques, membres, publications, équipes, événements',

    members:              'Membres',
    requestError:         'Erreur lors de la demande.',
  },
};
