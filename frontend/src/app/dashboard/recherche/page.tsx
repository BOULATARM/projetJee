'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Search, User, BookOpen, Calendar, FileText, Users } from 'lucide-react';

interface SearchResult {
  type: string;
  id: number;
  titre: string;
  description: string;
  date?: string;
  url: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  MEMBRE: <User size={16} className="text-blue-600" />,
  PUBLICATION: <BookOpen size={16} className="text-green-600" />,
  EVENEMENT: <Calendar size={16} className="text-purple-600" />,
  DOCUMENT: <FileText size={16} className="text-orange-600" />,
  EQUIPE: <Users size={16} className="text-red-600" />,
};

const TYPE_LABELS: Record<string, string> = {
  MEMBRE: 'Membre',
  PUBLICATION: 'Publication',
  EVENEMENT: 'Événement',
  DOCUMENT: 'Document',
  EQUIPE: 'Équipe',
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  MEMBRE: 'bg-blue-100 text-blue-700',
  PUBLICATION: 'bg-green-100 text-green-700',
  EVENEMENT: 'bg-purple-100 text-purple-700',
  DOCUMENT: 'bg-orange-100 text-orange-700',
  EQUIPE: 'bg-red-100 text-red-700',
};

export default function RecherchePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/search', { params: { q } });
      setResults(data);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Recherche globale</h1>

      <div className="relative mb-6">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher membres, publications, événements, documents..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {searched && results.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <Search size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Aucun résultat pour &quot;{query}&quot;</p>
        </div>
      )}

      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
            {TYPE_ICONS[type]} {TYPE_LABELS[type] || type} ({items.length})
          </h2>
          <div className="space-y-2">
            {items.map(item => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.url}
                className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0 ${TYPE_BADGE_COLORS[item.type]}`}>
                  {TYPE_LABELS[item.type] || item.type}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{item.titre}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                  )}
                  {item.date && <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {!searched && !loading && (
        <div className="text-center py-12 text-gray-400">
          <Search size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Tapez au moins 2 caractères pour rechercher</p>
        </div>
      )}
    </div>
  );
}
