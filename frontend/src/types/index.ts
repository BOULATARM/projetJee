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

export interface Laboratoire {
  id: number;
  nom: string;
  acronyme?: string;
  description?: string;
  adresse?: string;
  dateCreation?: string;
  axesDeRecherche?: string;
  logo?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  membreId: number;
  email: string;
  role: RoleSysteme;
  statut?: StatutMembre;
  nom: string;
  prenom: string;
  photo?: string;
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
  motifDepart?: string;
}

export interface EquipeAffiliation {
  id: number;
  membre: { id: number; nom: string; prenom: string; photo?: string; statut?: string };
  dateDebut: string;
  dateFin?: string;
  actif: boolean;
  motifDepart?: string;
}

export interface EquipeHistoriqueEntry {
  id: number;
  membre: { id: number; nom: string; prenom: string; photo?: string };
  action: 'MEMBRE_AJOUTE' | 'MEMBRE_RETIRE' | 'CHEF_NOMME';
  date: string;
  details?: string;
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
  lienUrl?: string;
  doi?: string;
}

export interface PublicationResponse {
  id: number;
  titre: string;
  resume?: string;
  annee: number;
  doi?: string;
  lienUrl?: string;
  revue?: string;
  conference?: string;
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
  photo?: string;
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
  dateCreation?: string;
  chefEquipe?: MembreResponse;
}

export interface DemandeAdhesion {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  motivation?: string;
  cvPath?: string;
  photoPath?: string;
  statut: StatutDemande;
  dateDepot: string;
  dateDecision?: string;
  typeMembreDemande: StatutMembre;
  commentaireRefus?: string;
  decidePar?: MembreResponse;
  etablissementOrigine?: string;
  laboratoireOrigine?: string;
  biographie?: string;
  centresInteret?: string;
  publications?: string;
  equipeId?: number;
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

export enum TypeMateriel {
  DEFINITIF = 'DEFINITIF',
  PROVISOIRE = 'PROVISOIRE',
}

export interface MaterielHistorique {
  id: number;
  action: string;
  details?: string;
  faitPar?: MembreResponse;
  dateAction: string;
}

export interface Materiel {
  id: number;
  nom: string;
  description?: string;
  quantiteTotale: number;
  quantiteDisponible: number;
  dateArrivage?: string;
  categorie?: string;
  typeMateriel?: TypeMateriel;
  historique?: MaterielHistorique[];
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
  statut?: string;
  motifRefus?: string;
  dateDecision?: string;
  approuvePar?: MembreResponse;
}

export interface Reunion {
  id: number;
  titre: string;
  dateReunion: string;
  lieu?: string;
  ordreJour?: string;
  compteRendu?: string;
  pvPath?: string;
  statut: string;
  creePar?: MembreResponse;
  nbDocuments?: number;
}

export enum TypeNotification {
  EVENEMENT = 'EVENEMENT',
  VALIDATION_DEMANDE = 'VALIDATION_DEMANDE',
  VALIDATION_ADHESION = 'VALIDATION_ADHESION',
  REFUS_ADHESION = 'REFUS_ADHESION',
  NOUVEAU_DOCUMENT = 'NOUVEAU_DOCUMENT',
  NOUVEAU_MEMBRE = 'NOUVEAU_MEMBRE',
  DISTRIBUTION_MATERIEL = 'DISTRIBUTION_MATERIEL',
  REUNION = 'REUNION',
  PUBLICATION = 'PUBLICATION',
  DEPART_MEMBRE = 'DEPART_MEMBRE',
}

export interface Notification {
  id: number;
  message: string;
  type: TypeNotification | string;
  lien?: string;
  lue: boolean;
  dateCreation: string;
}

export interface Mandat {
  id: number;
  dateDebut: string;
  dateFin?: string;
  actif: boolean;
  directeur?: MembreResponse;
  viceDirecteur?: MembreResponse;
  chefsEquipe?: MembreResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RapportPubItem {
  titre: string; type: string; revue?: string; conference?: string; annee: number; auteurs: string[];
}
export interface RapportEvtItem {
  titre: string; type: string; statut: string; dateDebut: string; lieu?: string; nbParticipants: number;
}
export interface RapportReuItem {
  titre: string; date: string; lieu?: string; statut: string; nbParticipants: number;
}
export interface RapportMemItem {
  nom: string; prenom: string; statut: string; email: string; equipe: string;
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
  nbReunions?: number;
  nbConventions?: number;
  statut: string;
  publicationsParType?: Record<string, number>;
  membresParStatut?: Record<string, number>;
  evenementsParType?: Record<string, number>;
  publications?: RapportPubItem[];
  evenements?: RapportEvtItem[];
  reunions?: RapportReuItem[];
  membres?: RapportMemItem[];
}

export enum MessageType {
  GLOBAL = 'GLOBAL',
  TEAM = 'TEAM',
  DIRECT = 'DIRECT',
  EVENT = 'EVENT',
}

export interface MessageResponse {
  id: number;
  sender: MembreResponse;
  contenu?: string;
  fichierUrl?: string;
  fichierNom?: string;
  fichierType?: string;
  type: MessageType;
  recipient?: MembreResponse;
  equipeId?: number;
  equipeNom?: string;
  evenementId?: number;
  evenementTitre?: string;
  dateEnvoi: string;
  lue: boolean;
}

export interface DistributionMateriel {
  id: number;
  materiel?: Materiel;
  membre?: MembreResponse;
  quantite: number;
  dateDistribution: string;
  typeMateriel?: TypeMateriel;
  datePrise?: string;
  dateRetourPrevue?: string;
  dateRetourEffective?: string;
  distributePar?: MembreResponse;
  commentaire?: string;
}

export interface DemandeMateriel {
  id: number;
  membre?: MembreResponse;
  materielDemande?: Materiel;
  description?: string;
  justification?: string;
  quantite?: number;
  datePriseSouhaitee?: string;
  dateRetourPrevue?: string;
  statut: StatutDemande;
  dateDemande: string;
  dateTraitement?: string;
  traitePar?: MembreResponse;
}
