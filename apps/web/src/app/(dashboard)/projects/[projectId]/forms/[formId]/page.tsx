'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Save, Send, Eye, Plus, Trash2, GripVertical } from 'lucide-react';

interface Question {
  name: string;
  type: string;
  label: Record<string, string>;
  required: boolean;
  options?: { value: string; label: Record<string, string> }[];
  relevant?: string;
  constraint?: string;
}

interface Page {
  name: string;
  label?: Record<string, string>;
  questions: Question[];
  repeat: boolean;
}

interface FormSchema {
  name: string;
  defaultLanguage: string;
  languages: string[];
  pages: Page[];
}

const QUESTION_TYPES = [
  { value: 'text', label: 'Texte' },
  { value: 'integer', label: 'Nombre entier' },
  { value: 'decimal', label: 'Nombre décimal' },
  { value: 'date', label: 'Date' },
  { value: 'select_one', label: 'Choix unique' },
  { value: 'select_multiple', label: 'Choix multiple' },
  { value: 'geopoint', label: 'GPS' },
  { value: 'photo', label: 'Photo' },
  { value: 'note', label: 'Note' },
  { value: 'calculate', label: 'Calcul' },
];

let questionCounter = 0;
function genName(): string {
  questionCounter++;
  return `q_${questionCounter}`;
}

export default function FormBuilderPage() {
  const { projectId, formId } = useParams();
  const router = useRouter();
  const [schema, setSchema] = useState<FormSchema>({
    name: '',
    defaultLanguage: 'fr',
    languages: ['fr'],
    pages: [{ name: 'page1', questions: [], repeat: false }],
  });
  const [formName, setFormName] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch<{ name: string; draftSchema: FormSchema | null }>(`/forms/${formId}`)
      .then((f) => {
        setFormName(f.name);
        if (f.draftSchema) setSchema(f.draftSchema);
        setLoaded(true);
      })
      .catch(console.error);
  }, [formId]);

  const autoSave = useCallback(async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      await apiFetch(`/forms/${formId}`, {
        method: 'PATCH',
        body: JSON.stringify({ draftSchema: schema }),
      });
      setDirty(false);
    } catch { /* ignore */ }
    setSaving(false);
  }, [formId, schema, dirty]);

  useEffect(() => {
    if (!dirty || !loaded) return;
    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [dirty, loaded, autoSave]);

  function updateSchema(updater: (s: FormSchema) => FormSchema) {
    setSchema(updater(schema));
    setDirty(true);
  }

  function addQuestion(pageIdx: number, type: string) {
    updateSchema((s) => {
      const pages = [...s.pages];
      const q: Question = {
        name: genName(),
        type,
        label: { fr: '' },
        required: false,
        ...(type === 'select_one' || type === 'select_multiple'
          ? { options: [{ value: 'opt1', label: { fr: 'Option 1' } }] }
          : {}),
      };
      pages[pageIdx] = { ...pages[pageIdx], questions: [...pages[pageIdx].questions, q] };
      return { ...s, pages };
    });
  }

  function removeQuestion(pageIdx: number, qIdx: number) {
    updateSchema((s) => {
      const pages = [...s.pages];
      pages[pageIdx] = {
        ...pages[pageIdx],
        questions: pages[pageIdx].questions.filter((_, i) => i !== qIdx),
      };
      return { ...s, pages };
    });
  }

  function updateQuestion(pageIdx: number, qIdx: number, updater: (q: Question) => Question) {
    updateSchema((s) => {
      const pages = [...s.pages];
      const questions = [...pages[pageIdx].questions];
      questions[qIdx] = updater(questions[qIdx]);
      pages[pageIdx] = { ...pages[pageIdx], questions };
      return { ...s, pages };
    });
  }

  async function handlePublish() {
    setPublishing(true);
    setError('');
    try {
      await apiFetch(`/forms/${formId}/publish`, { method: 'POST' });
      router.push(`/projects/${projectId}/forms`);
    } catch (err) {
      setError((err as Error).message || 'Erreur de publication');
    }
    setPublishing(false);
  }

  if (!loaded) {
    return <p className="text-muted">Chargement...</p>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <input
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="text-2xl font-bold bg-transparent outline-none border-b border-transparent focus:border-primary"
        />
        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-muted">Sauvegarde...</span>}
          {error && <span className="text-xs text-danger">{error}</span>}
          <button
            onClick={handlePublish}
            disabled={publishing || !dirty}
            className="flex items-center gap-1 rounded-md bg-success px-3 py-1.5 text-sm font-medium text-white hover:bg-success/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Publier
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1">
        <div className="w-48 space-y-2">
          <p className="text-xs font-semibold uppercase text-muted">Types de questions</p>
          {QUESTION_TYPES.map((qt) => (
            <button
              key={qt.value}
              onClick={() => addQuestion(schema.pages.length - 1, qt.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-left text-sm hover:bg-primary/10"
            >
              {qt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4">
          {schema.pages.map((page, pageIdx) => (
            <div key={page.name} className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted">Page {pageIdx + 1}</span>
              </div>

              {page.questions.length === 0 && (
                <p className="py-8 text-center text-sm text-muted">
                  Ajoutez une question depuis la palette de gauche
                </p>
              )}

              <div className="space-y-2">
                {page.questions.map((q, qIdx) => (
                  <div key={q.name} className="rounded-md border border-border bg-background p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                            {q.type}
                          </span>
                          <span className="text-xs text-muted">{q.name}</span>
                          {q.required && <span className="text-xs text-danger">*</span>}
                        </div>
                        <input
                          value={q.label?.fr || ''}
                          onChange={(e) =>
                            updateQuestion(pageIdx, qIdx, (qq) => ({
                              ...qq,
                              label: { ...qq.label, fr: e.target.value },
                            }))
                          }
                          placeholder="Libellé de la question"
                          className="w-full bg-transparent text-sm outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) =>
                            updateQuestion(pageIdx, qIdx, (qq) => ({ ...qq, required: e.target.checked }))
                          }
                          title="Obligatoire"
                          className="h-4 w-4"
                        />
                        <button
                          onClick={() => removeQuestion(pageIdx, qIdx)}
                          className="text-muted hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
