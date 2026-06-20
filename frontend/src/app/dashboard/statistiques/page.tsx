'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { statsService } from '@/services/stats.service';
import { DashboardStats, RoleSysteme } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuthStore } from '@/store/authStore';

const COLORS = ['#1e3a5f', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function StatistiquesPage() {
  const { role } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (role && role === RoleSysteme.ADMIN) router.replace('/dashboard');
  }, [role]);

  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    statsService.getDashboard().then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="text-gray-500">Chargement...</div>;

  const publicationsData = Object.entries(stats.publicationsParAnnee || {}).map(([annee, count]) => ({
    annee, publications: count
  }));

  const statutData = Object.entries(stats.membresParStatut || {}).map(([statut, count]) => ({
    name: statut, value: count
  }));

  const typeData = Object.entries(stats.evenementsParType || {}).map(([type, count]) => ({
    name: type, value: count
  }));

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Statistiques</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-heading font-semibold mb-4">Publications par année</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={publicationsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="annee" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="publications" fill="#1e3a5f" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-lg font-heading font-semibold mb-4">Membres par statut</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statutData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {statutData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-lg font-heading font-semibold mb-4">Événements par type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {typeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-lg font-heading font-semibold mb-4">Résumé</h2>
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Total membres</span>
              <span className="font-bold">{stats.nbMembres}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Doctorants</span>
              <span className="font-bold">{stats.nbDoctorants}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Total publications</span>
              <span className="font-bold">{stats.nbPublications}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Équipes</span>
              <span className="font-bold">{stats.nbEquipes}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Conventions actives</span>
              <span className="font-bold">{stats.nbConventionsActives}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Demandes en attente</span>
              <span className="font-bold">{stats.nbDemandesEnAttente}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
