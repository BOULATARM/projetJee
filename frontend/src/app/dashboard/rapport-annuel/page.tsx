'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { rapportService } from '@/services/rapport.service';
import { RapportAnnuel, RoleSysteme } from '@/types';
import { formatDateTime, getStatutColor } from '@/lib/utils';
import { Download, FilePlus, ChevronDown, ChevronUp, Users, BookOpen, Calendar, Presentation, FileText } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function RapportAnnuelPage() {
  const { role } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (role && role === RoleSysteme.ADMIN) router.replace('/dashboard');
  }, [role]);
  const [rapports, setRapports] = useState<RapportAnnuel[]>([]);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [selected, setSelected] = useState<RapportAnnuel | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const loadRapports = () => rapportService.getAll().then(setRapports).catch(() => {});

  useEffect(() => { loadRapports(); }, []);

  const generer = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await rapportService.generer(annee);
      loadRapports();
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (rapport: RapportAnnuel) => {
    if (selected?.id === rapport.id) { setSelected(null); return; }
    try {
      const res = await api.get(`/rapports/${rapport.id}`);
      setSelected(res.data);
    } catch {
      setSelected(rapport);
    }
  };

  const exportPdf = async (rapport: RapportAnnuel) => {
    const blob = await rapportService.exportPdf(rapport.id);
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `rapport-lias-${rapport.annee}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggle = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Rapport d'Activité Annuel</h1>

      {/* Formulaire génération */}
      <Card className="mb-6">
        <form onSubmit={generer} className="flex flex-col sm:flex-row gap-3 items-end">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Année</label>
            <input
              type="number" value={annee} min={2000} max={2100}
              onChange={e => setAnnee(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-36 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <button
            disabled={loading}
            className="bg-primary text-white rounded-lg px-5 py-2 flex items-center gap-2 disabled:opacity-60"
          >
            <FilePlus size={18} />
            {loading ? 'Génération...' : 'Générer le rapport'}
          </button>
        </form>
      </Card>

      {/* Liste des rapports */}
      <div className="space-y-4">
        {rapports.map(rapport => (
          <div key={rapport.id}>
            <div className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetail(rapport)}><Card>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">Rapport {rapport.annee}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {rapport.dateGeneration ? formatDateTime(rapport.dateGeneration) : 'Non généré'}
                  </p>
                  {rapport.generePar && (
                    <p className="text-xs text-gray-400 mt-0.5">Par {rapport.generePar}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatutColor(rapport.statut)}>{rapport.statut}</Badge>
                  {selected?.id === rapport.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Chiffres clés */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center mt-4">
                {[
                  { label: 'Membres', val: rapport.nbMembres, icon: '👥' },
                  { label: 'Doctorants', val: rapport.nbDoctorants, icon: '🎓' },
                  { label: 'Publications', val: rapport.nbPublications, icon: '📄' },
                  { label: 'Événements', val: rapport.nbEvenements, icon: '📅' },
                  { label: 'Réunions', val: rapport.nbReunions ?? 0, icon: '🤝' },
                  { label: 'Conventions', val: rapport.nbConventions ?? 0, icon: '📋' },
                ].map(({ label, val, icon }) => (
                  <div key={label} className="bg-blue-50 rounded-lg p-2">
                    <p className="text-lg">{icon}</p>
                    <p className="font-bold text-blue-700">{val}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={e => { e.stopPropagation(); exportPdf(rapport); }}
                  className="text-primary text-sm flex items-center gap-1 hover:underline"
                >
                  <Download size={15} /> Exporter PDF
                </button>
              </div>
            </Card></div>

            {/* Détail déroulable */}
            {selected?.id === rapport.id && (
              <div className="mt-2 space-y-3 pl-2">

                {/* Publications */}
                {selected.publications && selected.publications.length > 0 && (
                  <Card>
                    <button
                      className="flex items-center gap-2 w-full text-left font-semibold text-gray-700 mb-2"
                      onClick={() => toggle('pub')}
                    >
                      <BookOpen size={16} className="text-blue-500" />
                      Publications ({selected.publications.length})
                      {expanded.pub ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
                    </button>
                    {expanded.pub && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-blue-50 text-left text-xs text-gray-600">
                              <th className="p-2">Titre</th>
                              <th className="p-2">Type</th>
                              <th className="p-2">Auteurs</th>
                              <th className="p-2">Revue / Conférence</th>
                              <th className="p-2">Année</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selected.publications.map((p, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-2 font-medium">{p.titre}</td>
                                <td className="p-2"><Badge className="text-xs bg-blue-100 text-blue-700">{p.type}</Badge></td>
                                <td className="p-2 text-gray-600">{p.auteurs?.join(', ')}</td>
                                <td className="p-2 text-gray-500">{p.revue || p.conference || '—'}</td>
                                <td className="p-2">{p.annee}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                )}

                {/* Événements */}
                {selected.evenements && selected.evenements.length > 0 && (
                  <Card>
                    <button
                      className="flex items-center gap-2 w-full text-left font-semibold text-gray-700 mb-2"
                      onClick={() => toggle('evt')}
                    >
                      <Calendar size={16} className="text-green-500" />
                      Événements ({selected.evenements.length})
                      {expanded.evt ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
                    </button>
                    {expanded.evt && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-green-50 text-left text-xs text-gray-600">
                              <th className="p-2">Titre</th>
                              <th className="p-2">Type</th>
                              <th className="p-2">Date</th>
                              <th className="p-2">Statut</th>
                              <th className="p-2">Participants</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selected.evenements.map((e, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-2 font-medium">{e.titre}</td>
                                <td className="p-2"><Badge className="text-xs bg-green-100 text-green-700">{e.type}</Badge></td>
                                <td className="p-2">{e.dateDebut}</td>
                                <td className="p-2"><Badge className={`text-xs ${getStatutColor(e.statut)}`}>{e.statut}</Badge></td>
                                <td className="p-2 text-center">{e.nbParticipants}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                )}

                {/* Réunions */}
                {selected.reunions && selected.reunions.length > 0 && (
                  <Card>
                    <button
                      className="flex items-center gap-2 w-full text-left font-semibold text-gray-700 mb-2"
                      onClick={() => toggle('reu')}
                    >
                      <Presentation size={16} className="text-teal-500" />
                      Réunions ({selected.reunions.length})
                      {expanded.reu ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
                    </button>
                    {expanded.reu && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-teal-50 text-left text-xs text-gray-600">
                              <th className="p-2">Titre</th>
                              <th className="p-2">Date</th>
                              <th className="p-2">Lieu</th>
                              <th className="p-2">Statut</th>
                              <th className="p-2">Participants</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selected.reunions.map((r, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-2 font-medium">{r.titre}</td>
                                <td className="p-2">{r.date}</td>
                                <td className="p-2 text-gray-500">{r.lieu || '—'}</td>
                                <td className="p-2"><Badge className={`text-xs ${getStatutColor(r.statut)}`}>{r.statut}</Badge></td>
                                <td className="p-2 text-center">{r.nbParticipants}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                )}

                {/* Membres */}
                {selected.membres && selected.membres.length > 0 && (
                  <Card>
                    <button
                      className="flex items-center gap-2 w-full text-left font-semibold text-gray-700 mb-2"
                      onClick={() => toggle('mem')}
                    >
                      <Users size={16} className="text-purple-500" />
                      Membres ({selected.membres.length})
                      {expanded.mem ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
                    </button>
                    {expanded.mem && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-purple-50 text-left text-xs text-gray-600">
                              <th className="p-2">Nom</th>
                              <th className="p-2">Prénom</th>
                              <th className="p-2">Statut</th>
                              <th className="p-2">Email</th>
                              <th className="p-2">Équipe</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selected.membres.map((m, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-2 font-medium">{m.nom}</td>
                                <td className="p-2">{m.prenom}</td>
                                <td className="p-2"><Badge className="text-xs bg-purple-100 text-purple-700">{m.statut}</Badge></td>
                                <td className="p-2 text-gray-500 text-xs">{m.email}</td>
                                <td className="p-2">{m.equipe}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                )}

                {/* Répartitions */}
                {(selected.publicationsParType || selected.evenementsParType) && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selected.publicationsParType && Object.keys(selected.publicationsParType).length > 0 && (
                      <Card>
                        <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1">
                          <FileText size={14} /> Publications par type
                        </h4>
                        <div className="space-y-1">
                          {Object.entries(selected.publicationsParType).map(([type, count]) => (
                            <div key={type} className="flex justify-between text-sm">
                              <span className="text-gray-600">{type}</span>
                              <span className="font-bold text-blue-700">{count}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                    {selected.evenementsParType && Object.keys(selected.evenementsParType).length > 0 && (
                      <Card>
                        <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1">
                          <Calendar size={14} /> Événements par type
                        </h4>
                        <div className="space-y-1">
                          {Object.entries(selected.evenementsParType).map(([type, count]) => (
                            <div key={type} className="flex justify-between text-sm">
                              <span className="text-gray-600">{type}</span>
                              <span className="font-bold text-green-700">{count}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {rapports.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun rapport généré. Utilisez le formulaire ci-dessus.</p>
          </div>
        )}
      </div>
    </div>
  );
}
