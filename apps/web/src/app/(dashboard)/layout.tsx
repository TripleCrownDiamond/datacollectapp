'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch, setToken, getToken } from '@/lib/api';
import { LogOut, FolderKanban, Map, ClipboardList, Users, Settings, BarChart3 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setToken(token);
    apiFetch<{ fullName: string; email: string }>('/auth/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
      });
  }, [router]);

  function handleLogout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    router.push('/login');
  }

  const projectMatch = pathname.match(/\/projects\/([^/]+)/);
  const projectId = projectMatch?.[1];

  const navLinks = [
    { href: '/projects', label: 'Projets', icon: FolderKanban, active: pathname === '/projects' },
    ...(projectId
      ? [
          { href: `/projects/${projectId}`, label: 'Vue d\'ensemble', icon: BarChart3, active: pathname === `/projects/${projectId}` },
          { href: `/projects/${projectId}/forms`, label: 'Formulaires', icon: ClipboardList, active: pathname.includes('/forms') },
          { href: `/projects/${projectId}/submissions`, label: 'Soumissions', icon: ClipboardList, active: pathname.includes('/submissions') },
          { href: `/projects/${projectId}/map`, label: 'Carte', icon: Map, active: pathname.includes('/map') },
          { href: `/projects/${projectId}/team`, label: 'Équipe', icon: Users, active: pathname.includes('/team') },
          { href: `/projects/${projectId}/settings`, label: 'Paramètres', icon: Settings, active: pathname.includes('/settings') },
        ]
      : []),
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex w-60 flex-col border-r border-border bg-surface">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-lg font-bold text-primary">TerraCollect</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={`sidebar-link w-full text-left ${link.active ? 'active' : ''}`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          {user && (
            <div className="mb-2 px-3 text-xs text-muted">
              <p className="font-medium text-foreground">{user.fullName}</p>
              <p>{user.email}</p>
            </div>
          )}
          <button onClick={handleLogout} className="sidebar-link w-full text-left text-muted hover:text-danger">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
