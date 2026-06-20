'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { notificationService } from '@/services/notification.service';
import { Notification, TypeNotification } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Bell, BookOpen, Calendar, CheckCheck, CheckCircle,
  FileText, Package, Users, UserCheck, UserMinus, UserPlus, UserX,
} from 'lucide-react';

// ─── Routing fallback par type ──────────────────────────────────────────────
// Utilisé quand le backend ne renvoie pas de `lien` sur la notification.
function getNotificationLink(n: Notification): string | null {
  if (n.lien) return n.lien;
  switch (n.type) {
    case TypeNotification.PUBLICATION:           return '/dashboard/publications';
    case TypeNotification.EVENEMENT:             return '/dashboard/evenements';
    case TypeNotification.REUNION:               return '/dashboard/reunions';
    case TypeNotification.NOUVEAU_DOCUMENT:      return '/dashboard/documents';
    case TypeNotification.VALIDATION_DEMANDE:    return '/dashboard/mes-documents';
    case TypeNotification.VALIDATION_ADHESION:
    case TypeNotification.REFUS_ADHESION:        return '/dashboard/demandes-adhesion';
    case TypeNotification.NOUVEAU_MEMBRE:
    case TypeNotification.DEPART_MEMBRE:         return '/dashboard/membres';
    case TypeNotification.DISTRIBUTION_MATERIEL: return '/dashboard/demandes-materiel';
    default: return null;
  }
}

// ─── Icône + couleur par type ────────────────────────────────────────────────
type NotifStyle = { Icon: React.ElementType; iconColor: string; bgColor: string };

function getNotifStyle(type: string): NotifStyle {
  switch (type) {
    case TypeNotification.PUBLICATION:
      return { Icon: BookOpen,   iconColor: 'text-indigo-600', bgColor: 'bg-indigo-50' };
    case TypeNotification.EVENEMENT:
      return { Icon: Calendar,   iconColor: 'text-purple-600', bgColor: 'bg-purple-50' };
    case TypeNotification.REUNION:
      return { Icon: Users,      iconColor: 'text-violet-600', bgColor: 'bg-violet-50' };
    case TypeNotification.NOUVEAU_DOCUMENT:
    case TypeNotification.VALIDATION_DEMANDE:
      return { Icon: FileText,   iconColor: 'text-blue-600',   bgColor: 'bg-blue-50'   };
    case TypeNotification.VALIDATION_ADHESION:
      return { Icon: UserCheck,  iconColor: 'text-green-600',  bgColor: 'bg-green-50'  };
    case TypeNotification.REFUS_ADHESION:
      return { Icon: UserX,      iconColor: 'text-red-500',    bgColor: 'bg-red-50'    };
    case TypeNotification.NOUVEAU_MEMBRE:
      return { Icon: UserPlus,   iconColor: 'text-teal-600',   bgColor: 'bg-teal-50'   };
    case TypeNotification.DEPART_MEMBRE:
      return { Icon: UserMinus,  iconColor: 'text-orange-500', bgColor: 'bg-orange-50' };
    case TypeNotification.DISTRIBUTION_MATERIEL:
      return { Icon: Package,    iconColor: 'text-amber-600',  bgColor: 'bg-amber-50'  };
    default:
      return { Icon: Bell,       iconColor: 'text-stone-500',  bgColor: 'bg-stone-100' };
  }
}

// ─── Label lisible par type ──────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  EVENEMENT:             'Événement',
  VALIDATION_DEMANDE:    'Validation demande',
  VALIDATION_ADHESION:   'Adhésion acceptée',
  REFUS_ADHESION:        'Adhésion refusée',
  NOUVEAU_DOCUMENT:      'Nouveau document',
  NOUVEAU_MEMBRE:        'Nouveau membre',
  DISTRIBUTION_MATERIEL: 'Distribution matériel',
  REUNION:               'Réunion',
  PUBLICATION:           'Publication',
  DEPART_MEMBRE:         'Départ membre',
};

// ─── Temps relatif ───────────────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const d    = Math.floor(diff / 86400000);
  if (min < 1)  return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  if (h   < 24) return `Il y a ${h}h`;
  if (d   < 7)  return `Il y a ${d}j`;
  return formatDateTime(dateStr);
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
function NotifSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-card border border-border bg-surface p-6 animate-pulse">
          <div className="h-10 w-10 shrink-0 rounded-full bg-stone-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-stone-100" />
            <div className="h-3 w-1/3 rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    notificationService.getAll()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const marquerLue = async (id: number) => {
    await notificationService.marquerLue(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n));
    window.dispatchEvent(new Event('notif-lue'));
  };

  const marquerToutes = async () => {
    await notificationService.marquerToutesLues().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
    window.dispatchEvent(new Event('notif-lue'));
  };

  const handleClick = (n: Notification) => {
    if (!n.lue) marquerLue(n.id);
    const link = getNotificationLink(n);
    if (link) router.push(link);
  };

  const nonLues = notifications.filter(n => !n.lue);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* En-tête */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-stone-900">Notifications</h1>
          {nonLues.length > 0 && (
            <p className="mt-0.5 text-sm text-stone-500">
              {nonLues.length} non lue{nonLues.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {nonLues.length > 0 && (
          <button
            onClick={marquerToutes}
            className="flex items-center gap-1.5 rounded-button border border-primary/20 bg-primary-light px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-100 transition-colors"
          >
            <CheckCheck size={15} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Contenu */}
      {loading ? (
        <NotifSkeleton />
      ) : notifications.length === 0 ? (
        <Card className="py-16 text-center">
          <Bell size={40} className="mx-auto mb-3 text-stone-300" />
          <p className="font-medium text-stone-500">Aucune notification</p>
          <p className="mt-1 text-sm text-stone-400">Vous êtes à jour !</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const { Icon, iconColor, bgColor } = getNotifStyle(n.type);
            const link = getNotificationLink(n);
            const label = TYPE_LABELS[n.type] ?? n.type;

            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  'group flex items-start gap-4 rounded-card border bg-surface p-4 transition-all duration-150',
                  link ? 'cursor-pointer hover:shadow-card-hover' : 'cursor-default',
                  !n.lue
                    ? 'border-l-[3px] border-l-primary border-r border-t border-b border-border bg-primary-50/40'
                    : 'border-border opacity-75 hover:opacity-100',
                )}
              >
                {/* Icône */}
                <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', bgColor)}>
                  <Icon size={17} className={iconColor} />
                </div>

                {/* Texte */}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm leading-snug text-stone-800', !n.lue && 'font-semibold')}>
                    {n.message}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-[11px] text-stone-400">{relativeTime(n.dateCreation)}</span>
                    <span className="text-stone-300">·</span>
                    <span className={cn(
                      'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                      bgColor, iconColor,
                    )}>
                      {label}
                    </span>
                    {link && (
                      <>
                        <span className="text-stone-300">·</span>
                        <span className="text-[11px] font-medium text-primary group-hover:underline">
                          Voir →
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Point non-lue + bouton marquer lu */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {!n.lue && (
                    <>
                      <span className="h-2 w-2 rounded-full bg-primary" aria-label="Non lue" />
                      <button
                        onClick={e => { e.stopPropagation(); marquerLue(n.id); }}
                        className="text-[11px] text-stone-400 hover:text-primary transition-colors whitespace-nowrap"
                      >
                        Marquer lu
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
