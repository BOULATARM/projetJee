'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toArray } from '@/lib/normalize';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import {
  User, BookOpen, PlusCircle, GraduationCap,
  CalendarCheck, ArrowRight, CheckCircle, XCircle, Clock,
  Mail, MapPin, Briefcase, ChevronRight, UserCog, Save,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profil {
  id: number; nom: string; prenom: string; email: string;
  statut: string; biographie?: string; centresInteret?: string;
  dateEmbauche?: string; etablissementOrigine?: string; photo?: string;
}
interface Publication {
  id: number; titre: string; annee: number; typePub: string;
  auteurs?: { nom: string; prenom: string }[];
}
interface Equipe {
  id: number; nom: string; axeRecherche?: string; description?: string;
  chefEquipe?: { nom: string; prenom: string };
}
interface Evenement {
  id: number; titre: string; type: string; lieu?: string;
  dateDebut: string; statut: string;
}
interface DemandeParticipation {
  id: number;
  evenement: Evenement;
  statut: string;
  dateDemande: string;
  commentaire?: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const TYPE_PUB_COLORS: Record<string, string> = {
  ARTICLE:    'bg-blue-100 text-blue-700',
  CONFERENCE: 'bg-purple-100 text-purple-700',
  THESE:      'bg-green-100 text-green-700',
  RAPPORT:    'bg-orange-100 text-orange-700',
};

const STATUT_EVT: Record<string, string> = {
  PLANIFIE:  'bg-blue-100 text-blue-700',
  EN_COURS:  'bg-green-100 text-green-700',
  TERMINE:   'bg-gray-100 text-gray-600',
  ANNULE:    'bg-red-100 text-red-600',
};

const TABS = [
  { id: 'profil',          label: 'Profil',                    icon: User },
  { id: 'publications',    label: 'Publications',              icon: BookOpen },
  { id: 'ajouter',         label: 'Ajouter un article',        icon: PlusCircle },
  { id: 'equipes',         label: 'Équipes',                   icon: GraduationCap },
  { id: 'participations',  label: 'Participation événements',  icon: CalendarCheck },
  { id: 'modifier',        label: 'Modifier mes données',      icon: UserCog },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AssocieDashboard() {
  const { membreId, nom, prenom, statut } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('profil');

  // Data
  const [profil, setProfil]             = useState<Profil | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [equipes, setEquipes]           = useState<Equipe[]>([]);
  const [evenements, setEvenements]     = useState<Evenement[]>([]);
  const [mesDemandes, setMesDemandes]   = useState<DemandeParticipation[]>([]);
  const [loadingTab, setLoadingTab]     = useState(false);

  // Formulaire publication
  const [pubForm, setPubForm] = useState({
    titre: '', annee: new Date().getFullYear(), typePub: 'ARTICLE',
    resume: '', doi: '', revue: '', lienAcces: '',
  });
  const [pubLoading, setPubLoading] = useState(false);
  const [pubSuccess, setPubSuccess] = useState('');
  const [pubError, setPubError]     = useState('');

  // Demande participation
  const [submitting, setSubmitting]   = useState<number | null>(null);
  const [partSuccess, setPartSuccess] = useState('');

  // Modifier profil
  const [editForm, setEditForm] = useState({
    biographie: '', centresInteret: '', etablissementOrigine: '', dateNaissance: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError]     = useState('');

  // ─── Chargement par onglet ────────────────────────────────────────────────
  useEffect(() => {
    if (!membreId) return;
    setLoadingTab(true);

    const loads: Record<TabId, () => Promise<void>> = {
      profil: async () => {
        const { data } = await api.get(`/membres/${membreId}`);
        setProfil(data);
        setEditForm({
          biographie:           data.biographie           || '',
          centresInteret:       data.centresInteret       || '',
          etablissementOrigine: data.etablissementOrigine || '',
          dateNaissance:        data.dateNaissance        || '',
        });
      },
      modifier: async () => {
        const { data } = await api.get(`/membres/${membreId}`);
        setProfil(data);
        setEditForm({
          biographie:           data.biographie           || '',
          centresInteret:       data.centresInteret       || '',
          etablissementOrigine: data.etablissementOrigine || '',
          dateNaissance:        data.dateNaissance        || '',
        });
      },
      publications: async () => {
        const { data } = await api.get('/publications');
        setPublications(toArray(data).filter((p: Publication) =>
          p.auteurs?.some((a: { nom: string; prenom: string }) =>
            a.nom === nom && a.prenom === prenom)));
      },
      ajouter: async () => { /* formulaire statique */ },
      equipes: async () => {
        const { data } = await api.get('/equipes');
        setEquipes(toArray(data));
      },
      participations: async () => {
        const [evtRes, demRes] = await Promise.all([
          api.get('/evenements'),
          api.get('/participations/mes-demandes').catch(() => ({ data: [] })),
        ]);
        setEvenements(toArray(evtRes.data));
        setMesDemandes(toArray(demRes.data));
      },
    };

    loads[activeTab]()
      .catch(() => {})
      .finally(() => setLoadingTab(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, membreId]);

  // ─── Modifier profil ─────────────────────────────────────────────────────
  const handleEditProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true); setEditError(''); setEditSuccess('');
    try {
      await api.put(`/membres/${membreId}`, editForm);
      setEditSuccess('Données mises à jour avec succès !');
    } catch {
      setEditError('Erreur lors de la mise à jour.');
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Ajouter publication ──────────────────────────────────────────────────
  const handleAddPublication = async (e: React.FormEvent) => {
    e.preventDefault();
    setPubLoading(true); setPubError(''); setPubSuccess('');
    try {
      await api.post('/publications', {
        ...pubForm,
        equipeId: undefined,
      });
      setPubSuccess('Article ajouté avec succès !');
      setPubForm({ titre: '', annee: new Date().getFullYear(), typePub: 'ARTICLE', resume: '', doi: '', revue: '', lienAcces: '' });
    } catch {
      setPubError('Erreur lors de l\'ajout. Vérifiez vos informations.');
    } finally {
      setPubLoading(false);
    }
  };

  // ─── Demande de participation ─────────────────────────────────────────────
  const demanderParticipation = async (evenementId: number) => {
    setSubmitting(evenementId);
    try {
      await api.post(`/participations/evenement/${evenementId}`, {});
      setPartSuccess('Demande envoyée avec succès !');
      // Rafraîchir les demandes
      const { data } = await api.get('/participations/mes-demandes');
      setMesDemandes(toArray(data));
      setTimeout(() => setPartSuccess(''), 3000);
    } catch {
      // peut-être doublon
      setPartSuccess('');
    } finally {
      setSubmitting(null);
    }
  };

  const getDemande = (evtId: number) =>
    mesDemandes.find(d => d.evenement?.id === evtId);

  const ic = 'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">
            Bonjour, {prenom} {nom} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Tableau de bord — Membre Associé</p>
        </div>
        {statut && (
          <Badge className={getStatutColor(statut)}>{statut}</Badge>
        )}
      </div>

      {/* ── Navbar 5 onglets ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-primary bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.id === 'publications' && publications.length > 0 && (
                  <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {publications.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Contenu ── */}
        <div className="p-6">
          {loadingTab && (
            <div className="py-12 text-center text-gray-400">Chargement…</div>
          )}

          {/* ── 1. PROFIL ── */}
          {!loadingTab && activeTab === 'profil' && (
            <div className="space-y-4">
              {profil ? (
                <>
                  <div className="flex items-center gap-5">
                    <Avatar photo={profil.photo} nom={profil.nom} prenom={profil.prenom} size={80} className="shrink-0" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{profil.prenom} {profil.nom}</h2>
                      <Badge className={getStatutColor(profil.statut)}>{profil.statut}</Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <Card>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={15} className="text-gray-400" />
                          <span>{profil.email}</span>
                        </div>
                        {profil.etablissementOrigine && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={15} className="text-gray-400" />
                            <span>{profil.etablissementOrigine}</span>
                          </div>
                        )}
                        {profil.dateEmbauche && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Briefcase size={15} className="text-gray-400" />
                            <span>Membre depuis le {new Date(profil.dateEmbauche).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                      </div>
                    </Card>

                    {profil.biographie && (
                      <Card>
                        <p className="text-sm font-medium text-gray-700 mb-1">Biographie</p>
                        <p className="text-sm text-gray-500">{profil.biographie}</p>
                      </Card>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Link href="/dashboard/profil"
                      className="flex items-center gap-2 text-sm text-primary hover:underline">
                      Modifier mon profil <ChevronRight size={14} />
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-center py-8">Impossible de charger le profil.</p>
              )}
            </div>
          )}

          {/* ── 2. PUBLICATIONS ── */}
          {!loadingTab && activeTab === 'publications' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">
                  {publications.length} publication{publications.length !== 1 ? 's' : ''} trouvée{publications.length !== 1 ? 's' : ''}
                </p>
              </div>
              {publications.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">Aucune publication trouvée.</p>
                  <button onClick={() => setActiveTab('ajouter')}
                    className="mt-3 text-primary text-sm hover:underline">
                    Ajouter votre premier article →
                  </button>
                </div>
              ) : (
                publications.map(p => (
                  <Card key={p.id} className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{p.titre}</p>
                      {p.auteurs && (
                        <p className="text-xs text-gray-400 mt-1">
                          {p.auteurs.map(a => `${a.prenom} ${a.nom}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge className={TYPE_PUB_COLORS[p.typePub] || 'bg-gray-100 text-gray-600'}>{p.typePub}</Badge>
                      <span className="text-xs text-gray-400">{p.annee}</span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ── 3. AJOUTER ARTICLE ── */}
          {!loadingTab && activeTab === 'ajouter' && (
            <form onSubmit={handleAddPublication} className="max-w-xl space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Nouvel article</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre <span className="text-red-500">*</span></label>
                <input required value={pubForm.titre} onChange={e => setPubForm({ ...pubForm, titre: e.target.value })}
                  placeholder="Titre de la publication" className={ic} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Année <span className="text-red-500">*</span></label>
                  <input required type="number" min={1990} max={2030} value={pubForm.annee}
                    onChange={e => setPubForm({ ...pubForm, annee: Number(e.target.value) })} className={ic} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                  <select value={pubForm.typePub} onChange={e => setPubForm({ ...pubForm, typePub: e.target.value })} className={ic}>
                    <option value="ARTICLE">Article</option>
                    <option value="CONFERENCE">Conférence</option>
                    <option value="THESE">Thèse</option>
                    <option value="RAPPORT">Rapport technique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Résumé</label>
                <textarea rows={3} value={pubForm.resume}
                  onChange={e => setPubForm({ ...pubForm, resume: e.target.value })}
                  placeholder="Résumé de la publication…" className={ic} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DOI</label>
                  <input value={pubForm.doi} onChange={e => setPubForm({ ...pubForm, doi: e.target.value })}
                    placeholder="10.xxxx/…" className={ic} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revue / Conférence</label>
                  <input value={pubForm.revue} onChange={e => setPubForm({ ...pubForm, revue: e.target.value })}
                    placeholder="Nom de la revue" className={ic} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lien d&apos;accès</label>
                <input type="url" value={pubForm.lienAcces}
                  onChange={e => setPubForm({ ...pubForm, lienAcces: e.target.value })}
                  placeholder="https://…" className={ic} />
              </div>

              {pubSuccess && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">{pubSuccess}</div>}
              {pubError   && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{pubError}</div>}

              <button type="submit" disabled={pubLoading}
                className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                {pubLoading ? 'Enregistrement…' : 'Soumettre l\'article'}
              </button>
            </form>
          )}

          {/* ── 4. ÉQUIPES ── */}
          {!loadingTab && activeTab === 'equipes' && (
            <div className="grid md:grid-cols-2 gap-4">
              {equipes.length === 0 ? (
                <p className="text-gray-400 text-center py-8 col-span-2">Aucune équipe disponible.</p>
              ) : equipes.map(eq => (
                <Link key={eq.id} href={`/dashboard/equipes/${eq.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shrink-0">
                          <GraduationCap size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                            {eq.nom}
                          </h3>
                          {eq.axeRecherche && (
                            <Badge className="bg-blue-50 text-blue-600 text-xs mt-1">{eq.axeRecherche}</Badge>
                          )}
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-300 group-hover:text-primary transition-colors mt-1" />
                    </div>
                    {eq.description && (
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2">{eq.description}</p>
                    )}
                    {eq.chefEquipe && (
                      <p className="text-xs text-gray-400 mt-2">
                        Chef : {eq.chefEquipe.prenom} {eq.chefEquipe.nom}
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* ── 5. PARTICIPATIONS ── */}
          {!loadingTab && activeTab === 'participations' && (
            <div className="space-y-6">
              {partSuccess && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
                  <CheckCircle size={16} /> {partSuccess}
                </div>
              )}

              {/* Mes demandes en cours */}
              {mesDemandes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Mes demandes de participation</h3>
                  <div className="space-y-2">
                    {mesDemandes.map(d => (
                      <Card key={d.id} className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{d.evenement?.titre}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Soumise le {new Date(d.dateDemande).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          {d.statut === 'PENDING'   && <span className="flex items-center gap-1 text-yellow-600 text-sm"><Clock size={14}/> En attente</span>}
                          {d.statut === 'ACCEPTEE'  && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle size={14}/> Acceptée</span>}
                          {d.statut === 'REFUSEE'   && (
                            <div className="text-right">
                              <span className="flex items-center gap-1 text-red-500 text-sm"><XCircle size={14}/> Refusée</span>
                              {d.commentaire && <p className="text-xs text-gray-400 mt-0.5">{d.commentaire}</p>}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Événements disponibles */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Événements disponibles</h3>
                {evenements.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Aucun événement disponible.</p>
                ) : (
                  <div className="space-y-3">
                    {evenements.map(evt => {
                      const demande = getDemande(evt.id);
                      return (
                        <Card key={evt.id} className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={STATUT_EVT[evt.statut] || 'bg-gray-100 text-gray-600'}>
                                {evt.statut}
                              </Badge>
                              <Badge className="bg-gray-100 text-gray-500 text-xs">{evt.type}</Badge>
                            </div>
                            <p className="font-medium text-gray-800">{evt.titre}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                              {evt.lieu && <span>📍 {evt.lieu}</span>}
                              <span>📅 {new Date(evt.dateDebut).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {!demande ? (
                              <button
                                onClick={() => demanderParticipation(evt.id)}
                                disabled={submitting === evt.id}
                                className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                              >
                                {submitting === evt.id ? '…' : 'Demander à participer'}
                              </button>
                            ) : (
                              <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${
                                demande.statut === 'ACCEPTEE' ? 'bg-green-100 text-green-700' :
                                demande.statut === 'REFUSEE'  ? 'bg-red-100 text-red-600' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {demande.statut === 'PENDING'  ? '⏳ En attente' :
                                 demande.statut === 'ACCEPTEE' ? '✓ Acceptée' : '✗ Refusée'}
                              </span>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* ── 6. MODIFIER MES DONNÉES ── */}
          {!loadingTab && activeTab === 'modifier' && (
            <form onSubmit={handleEditProfil} className="max-w-xl space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <UserCog size={20} className="text-primary" /> Modifier mes données
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Établissement d&apos;origine</label>
                <input value={editForm.etablissementOrigine}
                  onChange={e => setEditForm({ ...editForm, etablissementOrigine: e.target.value })}
                  placeholder="Faculté / Université…" className={ic} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <input type="date" value={editForm.dateNaissance}
                  onChange={e => setEditForm({ ...editForm, dateNaissance: e.target.value })} className={ic} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                <textarea rows={4} value={editForm.biographie}
                  onChange={e => setEditForm({ ...editForm, biographie: e.target.value })}
                  placeholder="Décrivez votre parcours…" className={ic} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Centres d&apos;intérêt</label>
                <input value={editForm.centresInteret}
                  onChange={e => setEditForm({ ...editForm, centresInteret: e.target.value })}
                  placeholder="IA, Réseaux, Big Data…" className={ic} />
              </div>

              {editSuccess && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2"><CheckCircle size={16}/> {editSuccess}</div>}
              {editError   && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{editError}</div>}

              <button type="submit" disabled={editLoading}
                className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                <Save size={16} /> {editLoading ? 'Enregistrement…' : 'Sauvegarder'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
