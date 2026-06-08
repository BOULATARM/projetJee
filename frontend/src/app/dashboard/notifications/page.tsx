'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { notificationService } from '@/services/notification.service';
import { Notification, TypeNotification } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { Bell, CalendarDays, CheckCheck, CheckCircle, File } from 'lucide-react';
import { useRouter } from 'next/navigation';

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case TypeNotification.EVENEMENT:
    case TypeNotification.REUNION:
      return <CalendarDays size={20} className="text-purple-500" />;
    case TypeNotification.VALIDATION_DEMANDE:
    case TypeNotification.VALIDATION_ADHESION:
    case TypeNotification.REFUS_ADHESION:
    case TypeNotification.DISTRIBUTION_MATERIEL:
    case TypeNotification.DEPART_MEMBRE:
    case TypeNotification.NOUVEAU_MEMBRE:
      return <CheckCircle size={20} className="text-green-500" />;
    case TypeNotification.NOUVEAU_DOCUMENT:
    case TypeNotification.PUBLICATION:
      return <File size={20} className="text-blue-500" />;
    default:
      return <Bell size={20} className="text-gray-500" />;
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  useEffect(() => {
    notificationService.getAll().then(setNotifications).catch(() => {});
  }, []);

  const handleMarquerLue = async (id: number) => {
    await notificationService.marquerLue(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n));
  };

  const handleMarquerToutes = async () => {
    await notificationService.marquerToutesLues();
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
  };

  const handleClick = (n: Notification) => {
    if (!n.lue) handleMarquerLue(n.id);
    if (n.lien) router.push(n.lien);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Notifications</h1>
        <button onClick={handleMarquerToutes} className="flex items-center gap-2 text-primary text-sm hover:underline">
          <CheckCheck size={18} /> Tout marquer comme lu
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            className={`cursor-pointer ${n.lien ? 'hover:shadow-md transition-shadow' : ''}`}
          >
            <Card className={`flex items-start gap-4 ${!n.lue ? 'border-l-4 border-primary' : ''}`}>
              <div className={`p-2 rounded-full ${!n.lue ? 'bg-blue-50' : 'bg-gray-100'}`}>
                <NotifIcon type={n.type} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${!n.lue ? 'font-semibold' : ''}`}>{n.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-400">{formatDateTime(n.dateCreation)}</p>
                  <span className="text-xs text-gray-300">|</span>
                  <p className="text-xs text-gray-400 capitalize">{n.type?.toLowerCase().replace(/_/g, ' ')}</p>
                  {n.lien && <span className="text-xs text-primary">→ Voir</span>}
                </div>
              </div>
              {!n.lue && (
                <button
                  onClick={e => { e.stopPropagation(); handleMarquerLue(n.id); }}
                  className="text-primary text-xs hover:underline whitespace-nowrap"
                >
                  Marquer lu
                </button>
              )}
            </Card>
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="text-gray-400 text-center py-8">Aucune notification</p>
        )}
      </div>
    </div>
  );
}
