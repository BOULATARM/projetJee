'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function AdhesionPage() {
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', motivation: '', typeMembreDemande: 'ASSOCIE'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/demandes-adhesion', form);
      setSuccess(true);
    } catch {
      setError('Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="text-center max-w-md">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-gray-800 mb-2">Demande envoyée !</h1>
          <p className="text-gray-500 mb-6">Votre demande d&apos;adhésion a été soumise avec succès. Vous recevrez une réponse par email.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="text-primary hover:underline">Retour à l&apos;accueil</Link>
            <Link href="/auth/login" className="bg-primary text-white px-4 py-2 rounded-lg">Connexion</Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-primary mb-6 hover:underline">
          <ArrowLeft size={20} /> Retour à l&apos;accueil
        </Link>

        <Card>
          <h1 className="text-2xl font-heading font-bold text-gray-800 mb-2">Demande d&apos;adhésion</h1>
          <p className="text-gray-500 mb-6">Rejoignez le Laboratoire LIAS</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input type="text" required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input type="text" required value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de membre</label>
              <select value={form.typeMembreDemande} onChange={e => setForm({...form, typeMembreDemande: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="PERMANENT">Permanent</option>
                <option value="ASSOCIE">Associé</option>
                <option value="DOCTORANT">Doctorant</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivation</label>
              <textarea rows={4} value={form.motivation} onChange={e => setForm({...form, motivation: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="Décrivez votre motivation à rejoindre le laboratoire..." />
            </div>

            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50">
              {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
