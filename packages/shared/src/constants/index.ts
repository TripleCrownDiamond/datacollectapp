// ── User roles ──
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  SUPERVISOR: 'supervisor',
  QUALITY_CONTROLLER: 'quality_controller',
  COLLECTOR: 'collector',
  ANALYST: 'analyst',
  OBSERVER: 'observer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ── Project statuses ──
export const PROJECT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

// ── Form statuses ──
export const FORM_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export type FormStatus = (typeof FORM_STATUS)[keyof typeof FORM_STATUS];

// ── Submission statuses ──
export const SUBMISSION_STATUS = {
  DRAFT: 'draft',
  FINALIZED: 'finalized',
  UPLOADING: 'uploading',
  SYNCED: 'synced',
  REJECTED: 'rejected',
  REFUSED: 'refused',
  CONFLICT: 'conflict',
} as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUS)[keyof typeof SUBMISSION_STATUS];

// ── Question types (V1) ──
export const QUESTION_TYPE = {
  TEXT: 'text',
  INTEGER: 'integer',
  DECIMAL: 'decimal',
  DATE: 'date',
  TIME: 'time',
  SELECT_ONE: 'select_one',
  SELECT_MULTIPLE: 'select_multiple',
  GEOPOINT: 'geopoint',
  IMAGE: 'image',
  AUDIO: 'audio',
  SIGNATURE: 'signature',
  NOTE: 'note',
  CALCULATE: 'calculate',
  CONSENT: 'consent',
} as const;

export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

// ── Sync source ──
export const SYNC_SOURCE = {
  NATIVE: 'native',
  OPENROSA: 'openrosa',
} as const;

export type SyncSource = (typeof SYNC_SOURCE)[keyof typeof SYNC_SOURCE];

// ── Consent mode ──
export const CONSENT_MODE = {
  REQUIRED: 'required',
  RECORDED: 'recorded',
} as const;

export type ConsentMode = (typeof CONSENT_MODE)[keyof typeof CONSENT_MODE];

export const CONSENT_METHOD = {
  SIGNATURE: 'signature',
  ORAL: 'oral',
} as const;

export type ConsentMethod = (typeof CONSENT_METHOD)[keyof typeof CONSENT_METHOD];

// ── Media upload status ──
export const UPLOAD_STATUS = {
  LOCAL: 'local',
  UPLOADING: 'uploading',
  STORED: 'stored',
  FAILED: 'failed',
} as const;

export type UploadStatus = (typeof UPLOAD_STATUS)[keyof typeof UPLOAD_STATUS];
