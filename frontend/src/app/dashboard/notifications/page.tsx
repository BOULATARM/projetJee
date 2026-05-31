'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { notificationService } from '@/services/notification.service';
import { Notification } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Notifications</h1>
        <button onClick={handleMarquerToutes}
          className="flex items-center gap-2 text-primary text-sm hover:underline">
          <CheckCheck size={18} /> Tout marquer comme lu
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className={`flex items-start gap-4 ${!n.lue ? 'border-l-4 border-primary' : ''}`}>
            <div className={`p-2 rounded-full ${!n.lue ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Bell size={20} className={!n.lue ? 'text-primary' : 'text-gray-400'} />
            </div>
            <div className="flex-1">
              <p className={`text-sm ${!n.lue ? 'font-semibold' : ''}`}>{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.dateCreation)}</p>
            </div>
            {!n.lue && (
              <button onClick={() => handleMarquerLue(n.id)}
                className="text-primary text-xs hover:underline">Marquer lu</button>
            )}
          </Card>
        ))}
        {notifications.length === 0 && (
          <p className="text-gray-400 text-center py-8">Aucune notification</p>
        )}
      </div>
    </div>
  );
}
