export type Dict = {
  nav:     Record<string, string>;
  header:  Record<string, string>;
  mobile:  Record<string, string>;
  sidebar: Record<string, string>;
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
};
