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
  organization_logo_url: string;
  visit_reasons: string[];
  fields_schema: FormField[];
  form_id: string;
  form_title: string;
  access_point_id: string | null;
  access_point_name: string;
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

export interface CheckInStats {
  total: number;
  today: number;
  peak_hour: string | null;
  hourly: { hour: number; count: number }[];
  frequent_reasons: { label: string; count: number }[];
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
  is_active: boolean;
  access_revoked_at: string | null;
  access_revoked_reason: string;
}

export interface StaffInvitation { id: string; email: string; role: AccountRole; accepted_at: string | null; revoked_at: string | null; revoked_reason: string; created_at: string; }
export interface TeamAccess { members: UserProfile[]; invitations: StaffInvitation[]; }
export interface AuditEvent { id: string; action: string; actor_email: string | null; target_email: string | null; metadata: Record<string, unknown>; created_at: string; }

export interface Organization {
  id: string;
  name: string;
  logo_url: string;
  visit_reasons: string[];
  qr_secure_token: string;
  created_at: string;
}

export interface FormTemplate { id: string; title: string; fields_schema: FormField[]; version: number; is_active: boolean; is_default: boolean; updated_at: string; }
export interface AccessPoint { id: string; name: string; device_label: string; secure_token: string; is_active: boolean; last_seen_at: string | null; created_at: string; form_template: string; form_title: string; public_url: string; }

export interface ApiErrorShape {
  error: { message: string; retryable: boolean };
}

export interface PlatformOverview { organizations: number; users: number; active_users: number; checkins_total: number; checkins_30_days: number; feedback_total: number; feedback_new: number; }
export interface PlatformFeedback { id: string; category: string; category_label: string; message: string; page_url: string; contact_email: string; user_email: string | null; organization_name: string | null; status: string; status_label: string; admin_note: string; created_at: string; updated_at: string; }
export interface PlatformMember { id: string; email: string; full_name: string; role: AccountRole; is_active: boolean; organization_id: string | null; organization_name: string | null; created_at: string; }
export interface PlatformOrganization { id: string; name: string; logo_url: string; visit_reasons: string[]; created_at: string; member_count: number; checkin_count: number; feedback_count: number; members: PlatformMember[]; }
