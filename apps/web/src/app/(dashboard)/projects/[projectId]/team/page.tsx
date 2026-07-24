'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { UserPlus, Shield } from 'lucide-react';

interface Member {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: { key: string; name: string };
  isActive: boolean;
  joinedAt: string;
}

export default function TeamPage() {
  const { projectId } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ data: Member[] }>('/members')
      .then((res) => setMembers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Équipe</h1>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <UserPlus className="h-4 w-4" /> Inviter
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Chargement...</p>
      ) : members.length === 0 ? (
        <p className="text-muted">Aucun membre.</p>
      ) : (
        <div className="rounded-lg border border-border">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {m.fullName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium">{m.fullName}</p>
                  <p className="text-xs text-muted">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted" />
                <span className="text-sm text-muted">{m.role?.name || m.role?.key}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
