'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { laboratoireService, LaboratoireRequest, LaboratoireAuditLog } from '@/services/laboratoire.service';
import { Laboratoire } from '@/types';
import {
  Building2, Calendar, MapPin, Save, Tag, FlaskConical,
  CheckCircle, AlertCircle, History, User, Clock,
} from 'lucide-react';

const schema = z.object({
  nom: z.string().min(3, 'Le nom est requis'),
  acronyme: z.string().optional(),
  description: z.string().optional(),
  adresse: z.string().optional(),
  dateCreation: z.string().optional(),
  axesDeRecherche: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function actionBadge(action: string) {
  const map: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-600',
    ACTION: 'bg-purple-100 text-purple-700',
  };
  return map[action] ?? 'bg-gray-100 text-gray-600';
}

function actionLabel(action: string) {
  const map: Record<string, string> = {
    CREATE: 'Création',
    UPDATE: 'Modification',
    DELETE: 'Suppression',
    ACTION: 'Action',
  };
  return map[action] ?? action;
}

export default function LaboratoirePage() {
  const [labo, setLabo] = useState<Laboratoire | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historique, setHistorique] = useState<LaboratoireAuditLog[]>([]);
  const [loadingHisto, setLoadingHisto] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    laboratoireService.get().then(data => {
      setLabo(data);
      reset({
        nom: data.nom ?? '',
        acronyme: data.acronyme ?? '',
        description: data.description ?? '',
        adresse: data.adresse ?? '',
        dateCreation: data.dateCreation ? data.dateCreation.substring(0, 10) : '',
        axesDeRecherche: data.axesDeRecherche ?? '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));

    laboratoireService.getHistorique().then(data => {
      setHistorique(data);
      setLoadingHisto(false);
    }).catch(() => setLoadingHisto(false));
  }, [reset]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const payload: LaboratoireRequest = {
        nom: values.nom,
        acronyme: values.acronyme || undefined,
        description: values.description || undefined,
        adresse: values.adresse || undefined,
        dateCreation: values.dateCreation || undefined,
        axesDeRecherche: values.axesDeRecherche || undefined,
      };
      const updated = await laboratoireService.update(payload);
      setLabo(updated);
      reset({
        nom: updated.nom ?? '',
        acronyme: updated.acronyme ?? '',
        description: updated.description ?? '',
        adresse: updated.adresse ?? '',
        dateCreation: updated.dateCreation ? updated.dateCreation.substring(0, 10) : '',
        axesDeRecherche: updated.axesDeRecherche ?? '',
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      // Rafraîchir l'historique après une modification
      laboratoireService.getHistorique().then(setHistorique).catch(() => {});
    } catch {
      setError('Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400 p-6">Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-primary flex items-center gap-2">
          <Building2 size={24} /> Informations du laboratoire
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Ces informations sont affichées publiquement sur la page d&apos;accueil. Toute modification est historisée.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
          <CheckCircle size={16} /> Modifications enregistrées avec succès.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Building2 size={14} /> Nom complet du laboratoire *
            </label>
            <input
              {...register('nom')}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Laboratoire d'Informatique et d'Applications Scientifiques"
            />
            {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Tag size={14} /> Acronyme
            </label>
            <input
              {...register('acronyme')}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="LIAS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar size={14} /> Date de création
            </label>
            <input
              type="date"
              {...register('dateCreation')}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MapPin size={14} /> Adresse
            </label>
            <input
              {...register('adresse')}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Faculté des Sciences Ben M'Sik, Casablanca, Maroc"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Présentation générale du laboratoire..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FlaskConical size={14} /> Axes de recherche
            </label>
            <textarea
              {...register('axesDeRecherche')}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Intelligence Artificielle, Réseaux et Systèmes Distribués, Big Data..."
            />
            <p className="text-xs text-gray-400 mt-1">Séparez les axes par des virgules.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={16} />
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </Card>
      </form>

      {/* Historique des modifications */}
      <Card>
        <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <History size={18} className="text-primary" />
          Historique des modifications
          {historique.length > 0 && (
            <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {historique.length} entrée{historique.length > 1 ? 's' : ''}
            </span>
          )}
        </h2>

        {loadingHisto ? (
          <p className="text-sm text-gray-400">Chargement de l&apos;historique...</p>
        ) : historique.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <History size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune modification enregistrée.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

            <ol className="space-y-4">
              {historique.map((log, idx) => (
                <li key={log.id} className="relative flex gap-4 pl-10">
                  {/* Point sur la timeline */}
                  <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                    log.action === 'CREATE' ? 'bg-green-500' :
                    log.action === 'UPDATE' ? 'bg-blue-500' :
                    log.action === 'DELETE' ? 'bg-red-500' : 'bg-purple-500'
                  } ${idx === 0 ? 'ring-2 ring-offset-1 ring-blue-300' : ''}`} />

                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${actionBadge(log.action)}`}>
                          {actionLabel(log.action)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                          <User size={11} />
                          {log.nomComplet ?? log.utilisateur}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} />
                        {new Date(log.date).toLocaleString('fr-FR', {
                          day: '2-digit', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {log.details && log.details !== 'Aucun changement détecté' && (
                      <div className="mt-2 space-y-1">
                        {log.details.split(' | ').map((change, i) => (
                          <p key={i} className="text-xs text-gray-500 flex items-start gap-1">
                            <span className="text-blue-400 mt-0.5 shrink-0">›</span>
                            <span>{change}</span>
                          </p>
                        ))}
                      </div>
                    )}
                    {log.details === 'Aucun changement détecté' && (
                      <p className="text-xs text-gray-400 mt-2 italic">Aucun changement détecté</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Card>
    </div>
  );
}
