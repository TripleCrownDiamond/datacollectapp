'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Plus, FolderKanban } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  formCount: number;
  createdAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    apiFetch<Project[]>('/projects')
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const project = await apiFetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name: newName.trim() }),
    });
    setProjects((p) => [project, ...p]);
    setShowCreate(false);
    setNewName('');
    router.push(`/projects/${project.id}`);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projets</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nouveau projet
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 flex gap-3 rounded-lg border border-border bg-surface p-4">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom du projet"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Créer
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-muted">Chargement...</p>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-muted">
          <FolderKanban className="h-12 w-12" />
          <p>Aucun projet. Créez votre premier projet pour commencer.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => router.push(`/projects/${p.id}`)}
              className="rounded-lg border border-border bg-surface p-4 text-left transition-shadow hover:shadow-md"
            >
              <h3 className="font-semibold">{p.name}</h3>
              {p.description && <p className="mt-1 text-sm text-muted line-clamp-2">{p.description}</p>}
              <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                <span className={`rounded-full px-2 py-0.5 capitalize ${p.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'}`}>
                  {p.status}
                </span>
                <span>{p.formCount} formulaire{p.formCount > 1 ? 's' : ''}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
