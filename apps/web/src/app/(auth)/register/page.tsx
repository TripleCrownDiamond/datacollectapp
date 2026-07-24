'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, setToken } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch<{ accessToken: string; refreshToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('accessToken', data.accessToken);
      router.push('/projects');
    } catch (err) {
      setError((err as Error).message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(['name', 'email', 'password', 'organizationName'] as const).map((field) => (
        <div key={field}>
          <label htmlFor={field} className="block text-sm font-medium capitalize">
            {field === 'organizationName' ? "Nom de l'organisation" : field === 'name' ? 'Nom complet' : field}
          </label>
          <input
            id={field}
            type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
            required
            minLength={field === 'password' ? 12 : 1}
            value={form[field]}
            onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      ))}
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Inscription...' : 'Créer mon compte'}
      </button>
      <p className="text-center text-sm text-muted">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
