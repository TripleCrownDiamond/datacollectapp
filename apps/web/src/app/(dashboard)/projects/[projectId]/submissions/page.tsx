'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { FileDown, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Submission {
  id: string;
  formId: string;
  formVersion: number;
  status: string;
  submittedBy: { id: string; fullName: string };
  createdAt: string;
  attachmentCount: number;
}

export default function SubmissionsPage() {
  const { projectId } = useParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [projectId]);

  async function loadSubmissions() {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: Submission[] }>(`/projects/${projectId}/submissions`);
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    apiFetch<Record<string, unknown>>(`/submissions/${selected}`).then(setDetail).catch(console.error);
  }, [selected]);

  async function handleReview(id: string, action: 'approve' | 'reject') {
    const reason = action === 'reject' ? window.prompt('Motif du rejet :') : undefined;
    if (action === 'reject' && !reason) return;
    try {
      await apiFetch(`/submissions/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ action, reason }),
      });
      loadSubmissions();
      setSelected(null);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  const statusIcon = (s: string) => {
    switch (s) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-danger" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Soumissions</h1>
        <button className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface">
          <FileDown className="h-4 w-4" /> Exporter
        </button>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          {loading ? (
            <p className="text-muted">Chargement...</p>
          ) : submissions.length === 0 ? (
            <p className="text-muted">Aucune soumission reçue.</p>
          ) : (
            <div className="rounded-lg border border-border">
              {submissions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  className={`flex w-full items-center justify-between border-b border-border px-4 py-3 text-left last:border-0 hover:bg-surface ${selected === s.id ? 'bg-surface' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {statusIcon(s.status)}
                    <div>
                      <p className="text-sm font-medium">{s.submittedBy?.fullName || 'Inconnu'}</p>
                      <p className="text-xs text-muted">{new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted">v{s.formVersion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {detail && (
          <div className="w-96 space-y-4 rounded-lg border border-border bg-surface p-4">
            <h3 className="font-semibold">Détail de la soumission</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted">Statut :</span> {(detail as { status?: string }).status}</p>
              <p><span className="text-muted">Version :</span> {(detail as { formVersion?: number }).formVersion}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleReview((detail as { id: string }).id, 'approve')}
                className="flex-1 rounded-md bg-success px-3 py-1.5 text-sm font-medium text-white hover:bg-success/90"
              >
                Approuver
              </button>
              <button
                onClick={() => handleReview((detail as { id: string }).id, 'reject')}
                className="flex-1 rounded-md bg-danger px-3 py-1.5 text-sm font-medium text-white hover:bg-danger/90"
              >
                Rejeter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
