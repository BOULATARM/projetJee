export enum StatutMembre {
  PERMANENT = 'PERMANENT',
  ASSOCIE = 'ASSOCIE',
  DOCTORANT = 'DOCTORANT',
  RETRAITE = 'RETRAITE',
  ANCIEN = 'ANCIEN',
}

export enum RoleSysteme {
  ADMIN = 'ADMIN',
  DIRECTEUR = 'DIRECTEUR',
  VICE_DIRECTEUR = 'VICE_DIRECTEUR',
  CHEF_EQUIPE = 'CHEF_EQUIPE',
  MEMBRE = 'MEMBRE',
  VISITEUR = 'VISITEUR',
}

export enum StatutDemande {
  PENDING = 'PENDING',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
}

export enum TypePublication {
  ARTICLE = 'ARTICLE',
  CONFERENCE = 'CONFERENCE',
  THESE = 'THESE',
  RAPPORT = 'RAPPORT',
  LIVRE = 'LIVRE',
  CHAPITRE = 'CHAPITRE',
}

export enum TypeEvenement {
  CONFERENCE = 'CONFERENCE',
  SEMINAIRE = 'SEMINAIRE',
  WORKSHOP = 'WORKSHOP',
  JOURNEE_ETUDE = 'JOURNEE_ETUDE',
  REUNION = 'REUNION',
}

export interface AuthResponse {
  token: string;
  type: string;
  membreId: number;
  email: string;
  role: RoleSysteme;
  nom: string;
  prenom: string;
}

export interface MembreResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  photo?: string;
  biographie?: string;
  centresInteret?: string;
  dateEmbauche?: string;
  etablissementOrigine?: string;
  laboratoireOrigine?: string;
  statut: StatutMembre;
  active: boolean;
  roleActuel?: RoleSysteme;
  equipeActuelle?: string;
  equipeId?: number;
}

export interface MembreDetail {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  photo?: string;
  biographie?: string;
  centresInteret?: string;
  dateNaissance?: string;
  dateEmbauche?: string;
  etablissementOrigine?: string;
  laboratoireOrigine?: string;
  statut: StatutMembre;
  active: boolean;
  systemRole: RoleSysteme;
  affiliations: AffiliationDTO[];
  roles: RoleDTO[];
  publications: PublicationSimple[];
}

export interface AffiliationDTO {
  id: number;
  equipeNom: string;
  equipeId: number;
  dateDebut: string;
  dateFin?: string;
  actif: boolean;
}

export interface RoleDTO {
  id: number;
  role: RoleSysteme;
  dateDebut: string;
  dateFin?: string;
  actif: boolean;
}

export interface PublicationSimple {
  id: number;
  titre: string;
  annee: number;
  type: string;
}

export interface PublicationResponse {
  id: number;
  titre: string;
  resume?: string;
  annee: number;
  doi?: string;
  lienUrl?: string;
  typePub: TypePublication;
  dateAjout: string;
  fichierPath?: string;
  auteurs: AuteurDTO[];
  equipe?: string;
  equipeId?: number;
}

export interface AuteurDTO {
  id: number;
  nom: string;
  prenom: string;
  ordreAuteur: number;
  auteurCorrespondant: boolean;
}

export interface EvenementResponse {
  id: number;
  titre: string;
  description?: string;
  type: TypeEvenement;
  dateDebut: string;
  dateFin: string;
  lieu?: string;
  edition?: number;
  annee: number;
  statut: string;
  organisateurs: OrganisateurDTO[];
  nbDocuments: number;
}

export interface OrganisateurDTO {
  id: number;
  nom: string;
  prenom: string;
  roleOrganisation: string;
}

export interface DashboardStats {
  nbMembres: number;
  nbPublications: number;
  nbEvenements: number;
  nbDoctorants: number;
  nbEquipes: number;
  nbConventionsActives: number;
  nbDemandesEnAttente: number;
  publicationsParAnnee: Record<string, number>;
  membresParStatut: Record<string, number>;
  evenementsParType: Record<string, number>;
}

export interface Equipe {
  id: number;
  nom: string;
  description?: string;
  axeRecherche?: string;
  chefEquipe?: MembreResponse;
}

export interface DemandeAdhesion {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  motivation?: string;
  cvPath?: string;
  statut: StatutDemande;
  dateDepot: string;
  dateDecision?: string;
  typeMembreDemande: StatutMembre;
  commentaireRefus?: string;
}

export interface Convention {
  id: number;
  titre: string;
  partenaire?: string;
  typePartenaire?: string;
  paysPartenaire?: string;
  dateSignature?: string;
  dateExpiration?: string;
  description?: string;
  statut: string;
}

export interface Materiel {
  id: number;
  nom: string;
  description?: string;
  quantiteTotale: number;
  quantiteDisponible: number;
  dateArrivage?: string;
  categorie?: string;
}

export interface Document {
  id: number;
  nom: string;
  description?: string;
  cheminFichier: string;
  typeDocument: string;
  dateUpload: string;
  taille: number;
  mimeType?: string;
  evenement?: EvenementResponse;
  reunion?: Reunion;
  convention?: Convention;
  uploadePar?: MembreResponse;
}

export interface Reunion {
  id: number;
  titre: string;
  dateReunion: string;
  lieu?: string;
  ordreJour?: string;
  statut: string;
  createur?: MembreResponse;
  participants?: unknown[];
}

export interface Notification {
  id: number;
  message: string;
  type: string;
  lien?: string;
  lue: boolean;
  dateCreation: string;
}

export interface Discussion {
  id: number;
  sujet: string;
  contenu: string;
  auteur?: MembreResponse;
  dateCreation: string;
  evenement?: EvenementResponse;
  equipe?: Equipe;
  reponses?: ReponseDiscussion[];
}

export interface ReponseDiscussion {
  id: number;
  contenu: string;
  auteur?: MembreResponse;
  dateCreation: string;
}

export interface Mandat {
  id: number;
  dateDebut: string;
  dateFin?: string;
  actif: boolean;
  directeur?: MembreResponse;
  viceDirecteur?: MembreResponse;
}

export interface RapportAnnuel {
  id: number;
  annee: number;
  dateGeneration: string;
  generePar?: string;
  cheminFichier?: string;
  nbPublications: number;
  nbEvenements: number;
  nbMembres: number;
  nbDoctorants: number;
  statut: string;
}

export interface DistributionMateriel {
  id: number;
  materiel?: Materiel;
  membre?: MembreResponse;
  quantite: number;
  dateDistribution: string;
  distributePar?: MembreResponse;
  commentaire?: string;
}

export interface DemandeMateriel {
  id: number;
  membre?: MembreResponse;
  description: string;
  justification?: string;
  statut: StatutDemande;
  dateDemande: string;
  dateTraitement?: string;
}
