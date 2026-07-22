import { z } from 'zod';
import {
  ROLES,
  PROJECT_STATUS,
  FORM_STATUS,
  SUBMISSION_STATUS,
  QUESTION_TYPE,
  SYNC_SOURCE,
  CONSENT_MODE,
  CONSENT_METHOD,
  UPLOAD_STATUS,
} from '../constants/index.js';

// ── Organization ──
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ── User ──
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(200),
  avatarUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ── Organization member ──
export const OrganizationMemberSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.PROJECT_MANAGER,
    ROLES.SUPERVISOR,
    ROLES.QUALITY_CONTROLLER,
    ROLES.COLLECTOR,
    ROLES.ANALYST,
    ROLES.OBSERVER,
  ]),
  joinedAt: z.string().datetime(),
  isActive: z.boolean().default(true),
});

// ── Project ──
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum([PROJECT_STATUS.DRAFT, PROJECT_STATUS.ACTIVE, PROJECT_STATUS.ARCHIVED]),
  languages: z.array(z.string()).min(1).default(['fr']),
  defaultLanguage: z.string().default('fr'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ── Question option (for select_one / select_multiple) ──
export const QuestionOptionSchema = z.object({
  value: z.string().min(1),
  label: z.record(z.string(), z.string()), // e.g. { fr: "Oui", en: "Yes" }
});

// ── Question ──
export const QuestionSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
  type: z.enum([
    QUESTION_TYPE.TEXT,
    QUESTION_TYPE.INTEGER,
    QUESTION_TYPE.DECIMAL,
    QUESTION_TYPE.DATE,
    QUESTION_TYPE.TIME,
    QUESTION_TYPE.SELECT_ONE,
    QUESTION_TYPE.SELECT_MULTIPLE,
    QUESTION_TYPE.GEOPOINT,
    QUESTION_TYPE.IMAGE,
    QUESTION_TYPE.AUDIO,
    QUESTION_TYPE.SIGNATURE,
    QUESTION_TYPE.NOTE,
    QUESTION_TYPE.CALCULATE,
    QUESTION_TYPE.CONSENT,
  ]),
  label: z.record(z.string(), z.string()).optional(),
  hint: z.record(z.string(), z.string()).optional(),
  required: z.boolean().default(false),
  relevant: z.string().optional(), // Condition expression
  constraint: z.string().optional(), // Validation expression
  constraintMessage: z.record(z.string(), z.string()).optional(),
  calculation: z.string().optional(), // Calculate formula
  default: z.union([z.string(), z.number()]).optional(),
  options: z.array(QuestionOptionSchema).optional(),
  appearance: z.string().optional(),
  isSensitive: z.boolean().default(false),
  params: z.record(z.string(), z.unknown()).optional(),
});

// ── Consent configuration ──
export const ConsentConfigSchema = z.object({
  enabled: z.boolean().default(false),
  mode: z.enum([CONSENT_MODE.REQUIRED, CONSENT_MODE.RECORDED]).default(CONSENT_MODE.REQUIRED),
  text: z.record(z.string(), z.string()).optional(), // Multilingual consent text
  requireSignature: z.boolean().default(false),
  allowOral: z.boolean().default(true),
});

// ── Form schema (the full form definition) ──
export const FormSchemaSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  defaultLanguage: z.string().default('fr'),
  languages: z.array(z.string()).min(1).default(['fr']),
  pages: z.array(
    z.object({
      name: z.string().min(1),
      label: z.record(z.string(), z.string()).optional(),
      questions: z.array(QuestionSchema),
      repeat: z.boolean().default(false),
      repeatLabel: z.string().optional(), // e.g. "Parcelle {i}"
    }),
  ),
  consent: ConsentConfigSchema.optional(),
});

// ── Form ──
export const FormSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum([FORM_STATUS.DRAFT, FORM_STATUS.PUBLISHED]),
  currentVersion: z.number().int().default(1),
  schema: FormSchemaSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ── Consent info (stored in submission meta) ──
export const ConsentInfoSchema = z.object({
  status: z.enum(['accepted', 'refused']),
  method: z.enum([CONSENT_METHOD.SIGNATURE, CONSENT_METHOD.ORAL]).optional(),
  timestamp: z.string().datetime(),
  signatureAttachmentId: z.string().uuid().optional(),
});

// ── Submission meta ──
export const SubmissionMetaSchema = z.object({
  syncSource: z.enum([SYNC_SOURCE.NATIVE, SYNC_SOURCE.OPENROSA]).default(SYNC_SOURCE.NATIVE),
  deviceId: z.string().optional(),
  appVersion: z.string().optional(),
  consent: ConsentInfoSchema.optional(),
  geoStart: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number(),
    })
    .optional(),
  geoEnd: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number(),
    })
    .optional(),
});

// ── Submission ──
export const SubmissionSchema = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid(),
  formVersion: z.number().int(),
  projectId: z.string().uuid(),
  submittedBy: z.string().uuid(),
  data: z.record(z.string(), z.unknown()),
  meta: SubmissionMetaSchema.optional(),
  status: z.enum([
    SUBMISSION_STATUS.DRAFT,
    SUBMISSION_STATUS.FINALIZED,
    SUBMISSION_STATUS.UPLOADING,
    SUBMISSION_STATUS.SYNCED,
    SUBMISSION_STATUS.REJECTED,
    SUBMISSION_STATUS.REFUSED,
    SUBMISSION_STATUS.CONFLICT,
  ]),
  rejectionReason: z.string().optional(),
  baseRevision: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  syncedAt: z.string().datetime().optional(),
});

// ── Attachment ──
export const AttachmentSchema = z.object({
  id: z.string().uuid(),
  submissionId: z.string().uuid(),
  questionName: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  fileSize: z.number().int().positive(),
  filePath: z.string().optional(), // Local path on device
  storageUrl: z.string().url().optional(), // S3 URL after upload
  uploadStatus: z
    .enum([UPLOAD_STATUS.LOCAL, UPLOAD_STATUS.UPLOADING, UPLOAD_STATUS.STORED, UPLOAD_STATUS.FAILED])
    .default(UPLOAD_STATUS.LOCAL),
  uploadedBytes: z.number().int().default(0),
  createdAt: z.string().datetime(),
});

// ── Auth ──
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  name: z.string().min(1).max(200),
  organizationName: z.string().min(1).max(200),
});

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

// ── Sync ──
export const SyncSubmissionSchema = z.object({
  uuid: z.string().uuid(),
  formId: z.string().uuid(),
  formVersion: z.number().int(),
  data: z.record(z.string(), z.unknown()),
  meta: SubmissionMetaSchema.optional(),
});

// ── Inferred types ──
export type User = z.infer<typeof UserSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Form = z.infer<typeof FormSchema>;
export type FormVersion = { version: number; schema: FormSchema };
export type FormSchema = z.infer<typeof FormSchemaSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;
export type SubmissionMeta = z.infer<typeof SubmissionMetaSchema>;
export type Attachment = z.infer<typeof AttachmentSchema>;
export type ConsentInfo = z.infer<typeof ConsentInfoSchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type ConsentConfig = z.infer<typeof ConsentConfigSchema>;
