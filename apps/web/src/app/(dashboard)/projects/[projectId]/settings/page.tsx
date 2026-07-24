'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<{ name: string; description: string | null }>(`/projects/${projectId}`)
      .then((p) => {
        setName(p.name);
        setDescription(p.description || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, description }),
      });
    } catch (err) {
      alert((err as Error).message);
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!window.confirm('Êtes-vous sûr de vouloir archiver ce projet ?')) return;
    try {
      await apiFetch(`/projects/${projectId}`, { method: 'DELETE' });
      router.push('/projects');
    } catch (err) {
      alert((err as Error).message);
    }
  }

  if (loading) return <p className="text-muted">Chargement...</p>;

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Nom du projet</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="desc" className="block text-sm font-medium">Description</label>
          <textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </form>

      <div className="border-t border-border pt-6">
        <h2 className="mb-2 font-semibold text-danger">Zone dangereuse</h2>
        <p className="mb-4 text-sm text-muted">L&apos;archivage du projet le rend inactif. Les données restent accessibles en lecture.</p>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 rounded-md border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10"
        >
          <Trash2 className="h-4 w-4" /> Archiver le projet
        </button>
      </div>
    </div>
  );
}
