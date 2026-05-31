'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { conventionService } from '@/services/convention.service';
import { Convention } from '@/types';
import { formatDate, getStatutColor } from '@/lib/utils';
import { Handshake } from 'lucide-react';

export default function ConventionsPage() {
  const [conventions, setConventions] = useState<Convention[]>([]);
  const [form, setForm] = useState({ titre: '', partenaire: '', paysPartenaire: '', dateSignature: '', dateExpiration: '', description: '' });

  const loadConventions = () => conventionService.getAll().then(setConventions).catch(() => {});

  useEffect(() => {
    loadConventions();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await conventionService.create(form);
    setForm({ titre: '', partenaire: '', paysPartenaire: '', dateSignature: '', dateExpiration: '', description: '' });
    loadConventions();
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Conventions et collaborations</h1>

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-3">
          <input required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Titre" className="border rounded-lg px-3 py-2" />
          <input value={form.partenaire} onChange={(e) => setForm({ ...form, partenaire: e.target.value })} placeholder="Partenaire" className="border rounded-lg px-3 py-2" />
          <input value={form.paysPartenaire} onChange={(e) => setForm({ ...form, paysPartenaire: e.target.value })} placeholder="Pays" className="border rounded-lg px-3 py-2" />
          <input type="date" value={form.dateSignature} onChange={(e) => setForm({ ...form, dateSignature: e.target.value })} className="border rounded-lg px-3 py-2" />
          <input type="date" value={form.dateExpiration} onChange={(e) => setForm({ ...form, dateExpiration: e.target.value })} className="border rounded-lg px-3 py-2" />
          <button className="bg-primary text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2"><Handshake size={18} /> Ajouter</button>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="md:col-span-3 border rounded-lg px-3 py-2" />
        </form>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {conventions.map((convention) => (
          <Card key={convention.id}>
            <div className="flex justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-800">{convention.titre}</h3>
                <p className="text-sm text-gray-500 mt-1">{convention.partenaire || 'Partenaire non precise'} {convention.paysPartenaire ? `- ${convention.paysPartenaire}` : ''}</p>
              </div>
              <Badge className={getStatutColor(convention.statut)}>{convention.statut}</Badge>
            </div>
            <p className="text-sm text-gray-600 mt-3">{convention.description}</p>
            <p className="text-xs text-gray-400 mt-3">
              {convention.dateSignature ? formatDate(convention.dateSignature) : 'Signature non definie'}
              {convention.dateExpiration ? ` -> ${formatDate(convention.dateExpiration)}` : ''}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
