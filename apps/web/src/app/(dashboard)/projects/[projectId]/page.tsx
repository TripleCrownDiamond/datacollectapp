'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { ClipboardList, Users, CheckCircle, Clock } from 'lucide-react';

interface Stats {
  total: number;
  byStatus: Record<string, number>;
}

export default function ProjectDashboardPage() {
  const { projectId } = useParams();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Stats>(`/projects/${projectId}/submissions/stats`)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const cards = [
    { label: 'Total soumissions', value: stats?.total ?? 0, icon: ClipboardList, color: 'text-info' },
    { label: 'Approuvées', value: stats?.byStatus?.approved ?? 0, icon: CheckCircle, color: 'text-success' },
    { label: 'En attente', value: (stats?.byStatus?.submitted ?? 0), icon: Clock, color: 'text-warning' },
    { label: 'Rejetées', value: stats?.byStatus?.rejected ?? 0, icon: Users, color: 'text-danger' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Vue d&apos;ensemble</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold">{loading ? '...' : card.value}</p>
            <p className="text-sm text-muted">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 font-semibold">Soumissions récentes</h2>
        {loading ? (
          <p className="text-muted">Chargement...</p>
        ) : stats && stats.total > 0 ? (
          <p className="text-muted">{stats.total} soumission(s) enregistrée(s)</p>
        ) : (
          <p className="text-muted">Aucune soumission pour le moment.</p>
        )}
      </div>
    </div>
  );
}
