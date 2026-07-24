'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Plus, FileText, Eye } from 'lucide-react';

interface Form {
  id: string;
  name: string;
  status: string;
  currentVersion: number;
  versionCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function FormsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    apiFetch<Form[]>(`/projects/${projectId}/forms`)
      .then(setForms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const form = await apiFetch<Form>(`/projects/${projectId}/forms`, {
      method: 'POST',
      body: JSON.stringify({ name: newName.trim() }),
    });
    setForms((f) => [form, ...f]);
    setShowCreate(false);
    setNewName('');
    router.push(`/projects/${projectId}/forms/${form.id}`);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Formulaires</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Créer un formulaire
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 flex gap-3 rounded-lg border border-border bg-surface p-4">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom du formulaire"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button type="submit" disabled={!newName.trim()} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            Créer
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-muted">Chargement...</p>
      ) : forms.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-muted">
          <FileText className="h-12 w-12" />
          <p>Aucun formulaire. Créez votre premier formulaire.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          {forms.map((f) => (
            <div key={f.id} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
              <div>
                <p className="font-medium">{f.name}</p>
                <p className="text-xs text-muted">
                  v{f.currentVersion} · {f.versionCount} version{f.versionCount > 1 ? 's' : ''} · {f.status}
                </p>
              </div>
              <button
                onClick={() => router.push(`/projects/${projectId}/forms/${f.id}`)}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Eye className="h-4 w-4" /> Éditer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
