// ── Supported languages ──
export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// ── i18n keys structure ──
export const I18N_KEYS = {
  common: {
    save: 'common.save',
    cancel: 'common.cancel',
    delete: 'common.delete',
    confirm: 'common.confirm',
    loading: 'common.loading',
    error: 'common.error',
    retry: 'common.retry',
    search: 'common.search',
    filter: 'common.filter',
    export: 'common.export',
    sync: 'common.sync',
    offline: 'common.offline',
    required: 'common.required',
    optional: 'common.optional',
  },
  submission: {
    draft: 'submission.draft',
    finalized: 'submission.finalized',
    uploading: 'submission.uploading',
    synced: 'submission.synced',
    rejected: 'submission.rejected',
    refused: 'submission.refused',
    conflict: 'submission.conflict',
  },
  consent: {
    title: 'consent.title',
    accept: 'consent.accept',
    refuse: 'consent.refuse',
    signature: 'consent.signature',
    oral: 'consent.oral',
    readConfirm: 'consent.readConfirm',
    requiredMessage: 'consent.requiredMessage',
  },
  gps: {
    accuracy: 'gps.accuracy',
    threshold: 'gps.threshold',
    forceReason: 'gps.forceReason',
    acquiring: 'gps.acquiring',
  },
  sync: {
    pending: 'sync.pending',
    lastSync: 'sync.lastSync',
    autoSync: 'sync.autoSync',
    wifiOnly: 'sync.wifiOnly',
    deferMedia: 'sync.deferMedia',
    queueEmpty: 'sync.queueEmpty',
  },
  error: {
    network: 'error.network',
    validation: 'error.validation',
    server: 'error.server',
    forbidden: 'error.forbidden',
    notFound: 'error.notFound',
    generic: 'error.generic',
  },
} as const;

/** Type for a translation record (one entry per supported language) */
export type TranslationValue = string;
export type Translations = Record<SupportedLanguage, TranslationValue>;

/** i18n resource shape: key → { fr: string, en: string } */
export type I18nResources = Record<string, Translations>;
