'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import { membreService } from '@/services/membre.service';
import { MembreDetail, RoleSysteme } from '@/types';
import { Mail, Calendar, Building, BookOpen, ArrowLeft, LogOut, Lock } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function MembreDetailPage() {
  const { id } = useParams();
  const [profil, setProfil] = useState<MembreDetail | null>(null);
  const [showDepartModal, setShowDepartModal] = useState(false);
  const [departStatut, setDepartStatut] = useState<'RETRAITE' | 'ANCIEN'>('ANCIEN');
  const [saving, setSaving] = useState(false);
  const { role, membreId: currentMembreId } = useAuthStore();
  const canManage = role === RoleSysteme.ADMIN || role === RoleSysteme.DIRECTEUR;
  const isSelf = currentMembreId === Number(id);
  const canSeeConfidentiel = isSelf || canManage;

  useEffect(() => {
    if (id) {
      membreService.getById(Number(id)).then(setProfil).catch(() => {});
    }
  }, [id]);

  const handleDepart = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await membreService.changeStatut(Number(id), departStatut);
      const updated = await membreService.getById(Number(id));
      setProfil(updated);
      setShowDepartModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !id) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      await api.post(`/membres/${id}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updated = await membreService.getById(Number(id));
      setProfil(updated);
    } catch {}
  };

  if (!profil) return <div className="text-gray-500">Chargement...</div>;

  const photoUrl = profil.photo ? `${API_BASE.replace('/api/v1', '')}/uploads/${profil.photo}` : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link href="/dashboard/membres" className="flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft size={20} /> Retour aux membres
        </Link>
        {canManage && (
          <Link href={`/dashboard/membres/${id}/edit`} className="text-sm text-primary border border-primary px-3 py-1 rounded-lg hover:bg-primary hover:text-white transition-colors">
            Modifier
          </Link>
        )}
      </div>

      {showDepartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Enregistrer un départ</h3>
            <p className="text-sm text-gray-500 mb-4">
              Cette action clôturera toutes les affiliations actives du membre.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau statut</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
              value={departStatut}
              onChange={e => setDepartStatut(e.target.value as 'RETRAITE' | 'ANCIEN')}
            >
              <option value="ANCIEN">Ancien membre</option>
              <option value="RETRAITE">Retraité</option>
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDepartModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
              <button
                onClick={handleDepart}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Confirmer le départ'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 text-center">
          {/* Photo */}
          <div className="relative w-24 h-24 mx-auto mb-4">
            {photoUrl ? (
              <img src={photoUrl} alt="Photo" className="w-24 h-24 rounded-full object-cover border-2 border-primary" />
            ) : (
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profil.prenom[0]}{profil.nom[0]}
              </div>
            )}
            {(isSelf || canManage) && (
              <label className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-1 cursor-pointer hover:bg-gray-50" title="Changer la photo">
                <span className="text-xs">📷</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>

          <h2 className="text-xl font-bold">{profil.prenom} {profil.nom}</h2>
          <div className="flex justify-center gap-2 mt-2 flex-wrap">
            <Badge className={getStatutColor(profil.statut)}>{profil.statut}</Badge>
            <Badge className="bg-primary text-white">{profil.systemRole}</Badge>
          </div>
          {canManage && profil.statut !== 'RETRAITE' && profil.statut !== 'ANCIEN' && (
            <button
              onClick={() => setShowDepartModal(true)}
              className="mt-4 flex items-center gap-2 text-sm text-red-600 hover:text-red-800 mx-auto"
            >
              <LogOut size={15} /> Enregistrer départ
            </button>
          )}
          <div className="mt-4 text-sm text-gray-500 space-y-2">
            <div className="flex items-center justify-center gap-2"><Mail size={16} /> {profil.email}</div>
            {profil.dateEmbauche && <div className="flex items-center justify-center gap-2"><Calendar size={16} /> Depuis {formatDate(profil.dateEmbauche)}</div>}
            {profil.etablissementOrigine && <div className="flex items-center justify-center gap-2"><Building size={16} /> {profil.etablissementOrigine}</div>}
            {profil.laboratoireOrigine && <div className="flex items-center justify-center gap-2"><Building size={16} className="text-gray-400" /> {profil.laboratoireOrigine}</div>}
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {/* Informations personnelles (confidentielles) */}
          {canSeeConfidentiel && profil.dateNaissance && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold">Informations personnelles</h3>
                <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><Lock size={10} /> Confidentiel</Badge>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Date de naissance :</span> {formatDate(profil.dateNaissance)}
              </p>
            </Card>
          )}

          {profil.biographie && (
            <Card>
              <h3 className="font-semibold mb-2">Biographie</h3>
              <p className="text-gray-600 text-sm">{profil.biographie}</p>
              {profil.centresInteret && (
                <>
                  <h4 className="font-semibold mt-4 mb-1">Centres d&apos;intérêt</h4>
                  <p className="text-gray-600 text-sm">{profil.centresInteret}</p>
                </>
              )}
            </Card>
          )}

          <Card>
            <h3 className="font-semibold mb-3">Historique des affiliations</h3>
            <div className="space-y-2">
              {profil.affiliations.map(a => (
                <div key={a.id} className="flex items-start justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{a.equipeNom}</p>
                    <p className="text-xs text-gray-500">{formatDate(a.dateDebut)}{a.dateFin ? ` - ${formatDate(a.dateFin)}` : ' - Présent'}</p>
                    {a.motifDepart && <p className="text-xs text-red-500 mt-1">Motif : {a.motifDepart}</p>}
                  </div>
                  {a.actif ? <Badge className="bg-green-100 text-green-800">Actif</Badge> : <Badge className="bg-gray-100 text-gray-600">Ancien</Badge>}
                </div>
              ))}
              {profil.affiliations.length === 0 && <p className="text-sm text-gray-400">Aucune affiliation</p>}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-3">Historique des rôles</h3>
            <div className="space-y-2">
              {profil.roles.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{r.role}</p>
                    <p className="text-xs text-gray-500">{formatDate(r.dateDebut)}{r.dateFin ? ` - ${formatDate(r.dateFin)}` : ' - Présent'}</p>
                  </div>
                  {r.actif ? <Badge className="bg-green-100 text-green-800">Actif</Badge> : <Badge className="bg-gray-100 text-gray-600">Inactif</Badge>}
                </div>
              ))}
            </div>
          </Card>

          {profil.publications.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} />
                <h3 className="font-semibold">Publications ({profil.publications.length})</h3>
              </div>
              <div className="space-y-2">
                {profil.publications.map(p => (
                  <div key={p.id} className="text-sm p-2 bg-gray-50 rounded">
                    <p className="font-medium">{p.titre}</p>
                    <span className="text-gray-500">{p.annee} • {p.type}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
