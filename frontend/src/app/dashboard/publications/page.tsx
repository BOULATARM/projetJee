'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor } from '@/lib/utils';
import { publicationService } from '@/services/publication.service';
import { PublicationResponse } from '@/types';
import { Search } from 'lucide-react';

export default function PublicationsPage() {
  const [publications, setPublications] = useState<PublicationResponse[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    publicationService.getAll().then(setPublications).catch(() => {});
  }, []);

  const filtered = search
    ? publications.filter(p => p.titre.toLowerCase().includes(search.toLowerCase()))
    : publications;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Publications</h1>
      </div>

      <div className="relative mb-6">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher une publication..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((p) => (
          <Card key={p.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{p.titre}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {p.auteurs?.map(a => `${a.prenom} ${a.nom}`).join(', ')}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={getStatutColor(p.typePub)}>{p.typePub}</Badge>
                  <span className="text-sm text-gray-500">{p.annee}</span>
                  {p.equipe && <span className="text-sm text-gray-500">Équipe: {p.equipe}</span>}
                </div>
              </div>
              {p.doi && (
                <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer"
                   className="text-primary text-sm hover:underline">
                  DOI
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
