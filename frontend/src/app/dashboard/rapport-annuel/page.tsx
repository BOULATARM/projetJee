'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { rapportService } from '@/services/rapport.service';
import { RapportAnnuel } from '@/types';
import { formatDateTime, getStatutColor } from '@/lib/utils';
import { Download, FilePlus } from 'lucide-react';

export default function RapportAnnuelPage() {
  const [rapports, setRapports] = useState<RapportAnnuel[]>([]);
  const [annee, setAnnee] = useState(new Date().getFullYear());

  const loadRapports = () => rapportService.getAll().then(setRapports).catch(() => {});

  useEffect(() => {
    loadRapports();
  }, []);

  const generer = async (event: React.FormEvent) => {
    event.preventDefault();
    await rapportService.generer(annee);
    loadRapports();
  };

  const exportPdf = async (rapport: RapportAnnuel) => {
    const blob = await rapportService.exportPdf(rapport.id);
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `rapport-${rapport.annee}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Rapport annuel</h1>

      <Card className="mb-6">
        <form onSubmit={generer} className="flex flex-col sm:flex-row gap-3">
          <input type="number" value={annee} onChange={(e) => setAnnee(Number(e.target.value))} className="border rounded-lg px-3 py-2" />
          <button className="bg-primary text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2">
            <FilePlus size={18} /> Generer
          </button>
        </form>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {rapports.map((rapport) => (
          <Card key={rapport.id}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">Rapport {rapport.annee}</h3>
                <p className="text-sm text-gray-500 mt-1">{rapport.dateGeneration ? formatDateTime(rapport.dateGeneration) : 'Non genere'}</p>
              </div>
              <Badge className={getStatutColor(rapport.statut)}>{rapport.statut}</Badge>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center mt-4">
              <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">{rapport.nbMembres}</p><p className="text-xs text-gray-500">Membres</p></div>
              <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">{rapport.nbDoctorants}</p><p className="text-xs text-gray-500">Doctorants</p></div>
              <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">{rapport.nbPublications}</p><p className="text-xs text-gray-500">Publications</p></div>
              <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">{rapport.nbEvenements}</p><p className="text-xs text-gray-500">Evenements</p></div>
            </div>
            <button onClick={() => exportPdf(rapport)} className="mt-4 text-primary text-sm flex items-center gap-2">
              <Download size={16} /> Export PDF
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
