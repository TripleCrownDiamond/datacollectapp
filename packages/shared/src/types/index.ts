// Re-export types inferred from zod schemas
export type {
  User,
  Organization,
  OrganizationMember,
  Project,
  Form,
  FormVersion,
  FormSchema,
  Question,
  QuestionOption,
  Submission,
  SubmissionMeta,
  Attachment,
  ConsentInfo,
} from '../schemas/index.js';

// ── Additional types not derived from schemas ──

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
  total?: number;
}

/** Geospatial point (GeoJSON Point) */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

/** Geospatial polygon (GeoJSON Polygon) */
export interface GeoPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

/** Sync cursor (opaque timestamp-based) */
export interface SyncCursor {
  cursor: string;
  hasMore: boolean;
}

/** Coordinate with accuracy */
export interface GpsCoordinate {
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  altitude?: number;
  timestamp: string;
}
