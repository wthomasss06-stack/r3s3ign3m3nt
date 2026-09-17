export type FieldType = "text" | "phone" | "email" | "number" | "date" | "select" | "checkbox" | "signature";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
}

export interface PublicFormData {
  organization_name: string;
  fields_schema: FormField[];
}

export interface CheckInRecord {
  id: string;
  responses: Record<string, string | boolean>;
  signature_blob: string | null;
  created_at_client: string;
  synced_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type AccountRole = "BOSS" | "GERANT" | "STAFF";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: AccountRole;
  organization_id: string;
  organization_name: string;
}

export interface Organization {
  id: string;
  name: string;
  qr_secure_token: string;
  created_at: string;
}

export interface ApiErrorShape {
  error: { message: string; retryable: boolean };
}
