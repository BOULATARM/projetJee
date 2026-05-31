'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Search, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface AuditLog {
  id: number;
  entite: string;
  action: string;
  methode: string;
  utilisateur: string;
  membreId: number | null;
  date: string;
  details: string;
}

interface PageData {
  content: AuditLog[];
  totalPages: number;
  totalElements: number;
  number: number;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  ACTION: 'bg-yellow-100 text-yellow-700',
};

function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function AuditLogsPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(query); setPage(0); }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const url = debouncedQ.trim().length >= 2
        ? `/audit-logs/search?q=${encodeURIComponent(debouncedQ)}&page=${page}&size=20`
        : `/audit-logs?page=${page}&size=20`;
      const { data: res } = await api.get(url);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQ]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Journal d&apos;audit</h1>
          <p className="text-sm text-gray-500">Historique de toutes les actions effectuées dans le système</p>
        </div>
      </div>

      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filtrer par entité ou utilisateur..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {data && (
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {data.totalElements.toLocaleString()} entrée{data.totalElements > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="py-12 text-center text-gray-400">Chargement...</div>
        ) : !data || data.content.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Shield size={40} className="mx-auto mb-3 text-gray-200" />
            <p>Aucune entrée d&apos;audit</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-3 text-gray-500 font-medium">Date</th>
                    <th className="text-left py-3 px-3 text-gray-500 font-medium">Action</th>
                    <th className="text-left py-3 px-3 text-gray-500 font-medium">Entité</th>
                    <th className="text-left py-3 px-3 text-gray-500 font-medium">Méthode</th>
                    <th className="text-left py-3 px-3 text-gray-500 font-medium">Utilisateur</th>
                    <th className="text-left py-3 px-3 text-gray-500 font-medium">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.content.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(log.date)}
                      </td>
                      <td className="py-3 px-3">
                        <Badge className={`text-xs ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-700">{log.entite}</td>
                      <td className="py-3 px-3 text-gray-500 font-mono text-xs">{log.methode}</td>
                      <td className="py-3 px-3 text-gray-600 text-xs">{log.utilisateur}</td>
                      <td className="py-3 px-3 text-gray-400 text-xs max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} /> Précédent
                </button>
                <span className="text-sm text-gray-500">
                  Page {page + 1} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                  disabled={page >= data.totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Suivant <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
