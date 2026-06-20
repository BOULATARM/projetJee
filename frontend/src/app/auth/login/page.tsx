'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import { Clock, XCircle, ShieldOff } from 'lucide-react';

type DemandeBanner =
  | { type: 'PENDING' }
  | { type: 'REFUSEE'; commentaire: string }
  | { type: 'ANCIEN_BLOQUE' }
  | { type: 'BLOQUE_ADMIN' }
  | null;

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [demande, setDemande]   = useState<DemandeBanner>(null);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDemande(null);
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      setAuth(response);
      if      (response.statut === 'RETRAITE')  router.push('/dashboard/retraite');
      else if (response.statut === 'ASSOCIE')   router.push('/dashboard/associe');
      else if (response.statut === 'DOCTORANT') router.push('/dashboard/doctorant');
      else router.push('/dashboard');
    } catch (err: unknown) {
      // Détecter le blocage ANCIEN depuis la réponse backend
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '';
      if (msg.includes('COMPTE_ANCIEN_BLOQUE')) {
        setDemande({ type: 'ANCIEN_BLOQUE' });
        setLoading(false);
        return;
      }
      if (msg.includes('COMPTE_BLOQUE_ADMIN')) {
        setDemande({ type: 'BLOQUE_ADMIN' });
        setLoading(false);
        return;
      }

      // Vérifier si l'email a une demande d'adhésion en attente ou refusée
      try {
        const { data } = await api.get(`/demandes-adhesion/statut-email?email=${encodeURIComponent(email)}`);
        if (data.statut === 'PENDING') {
          setDemande({ type: 'PENDING' });
        } else if (data.statut === 'REFUSEE') {
          setDemande({ type: 'REFUSEE', commentaire: data.commentaire || '' });
        } else {
          // Demande acceptée mais mot de passe incorrect
          setError('Email ou mot de passe incorrect.');
        }
      } catch {
        // Aucune demande trouvée → identifiants incorrects
        setError('Email ou mot de passe incorrect.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold text-primary">LIAS</h1>
          <p className="text-gray-500 text-sm mt-1">Connexion à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setDemande(null); setError(''); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="exemple@lias.ma"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setDemande(null); setError(''); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Erreur identifiants */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          {/* Demande en cours */}
          {demande?.type === 'PENDING' && (
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-4 rounded-lg">
              <Clock size={20} className="shrink-0 mt-0.5 text-yellow-500" />
              <div>
                <p className="font-semibold">Demande d&apos;adhésion en cours</p>
                <p className="mt-1 text-yellow-700">
                  Votre demande a été soumise et est en attente de validation par le directeur du laboratoire.
                  Vous recevrez une réponse par email.
                </p>
              </div>
            </div>
          )}

          {/* Compte ANCIEN bloqué */}
          {demande?.type === 'ANCIEN_BLOQUE' && (
            <div className="flex items-start gap-3 bg-gray-100 border border-gray-300 text-gray-800 text-sm p-4 rounded-lg">
              <ShieldOff size={20} className="shrink-0 mt-0.5 text-gray-500" />
              <div>
                <p className="font-semibold">Compte bloqué</p>
                <p className="mt-1 text-gray-600">
                  Votre compte est marqué comme <strong>ancien membre</strong> et l&apos;accès a été désactivé.
                  Toutes vos données sont conservées. Contactez l&apos;administrateur pour réactiver votre compte.
                </p>
              </div>
            </div>
          )}

          {/* Compte bloqué par l'administrateur */}
          {demande?.type === 'BLOQUE_ADMIN' && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-800 text-sm p-4 rounded-lg">
              <ShieldOff size={20} className="shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-semibold">Compte bloqué par l&apos;administrateur</p>
                <p className="mt-1 text-red-700">
                  Votre compte a été désactivé par l&apos;administrateur. Pour résoudre ce problème,
                  veuillez contacter l&apos;administration du laboratoire LIAS.
                </p>

              </div>
            </div>
          )}

          {/* Demande refusée */}
          {demande?.type === 'REFUSEE' && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-lg">
              <XCircle size={20} className="shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-semibold">Demande d&apos;adhésion refusée</p>
                {demande.commentaire ? (
                  <p className="mt-1 text-red-700">
                    <span className="font-medium">Motif :</span> {demande.commentaire}
                  </p>
                ) : (
                  <p className="mt-1 text-red-700">
                    Votre demande n&apos;a pas été acceptée. Contactez l&apos;administration pour plus d&apos;informations.
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Vérification...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Nouveau membre ?{' '}
            <Link href="/adhesion" className="text-primary hover:underline">
              Faire une demande d&apos;adhésion
            </Link>
          </p>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-medium mb-1">Comptes de test :</p>
          <p>Admin: admin@lias.ma / admin123</p>
          <p>Directeur: directeur@lias.ma / directeur123</p>
        </div>
      </Card>
    </div>
  );
}
