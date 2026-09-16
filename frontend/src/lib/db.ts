import Dexie, { Table } from "dexie";

export interface OfflineCheckIn {
  idempotency_key: string;
  qr_token: string;
  responses: Record<string, string | boolean>;
  signature_blob: string;
  created_at_client: string;
  sync_status: "pending" | "synced";
}

// Cache du FORMULAIRE lui-meme (pas seulement des soumissions) : c'est ce qui
// permet a une tablette d'accueil restee offline plusieurs jours d'afficher quand
// meme le bon formulaire pour continuer a enregistrer des visiteurs.
export interface CachedForm {
  qr_token: string;
  organization_name: string;
  fields_schema: unknown;
  cached_at: string;
}

class QRFormDatabase extends Dexie {
  checkins!: Table<OfflineCheckIn, string>;
  formCache!: Table<CachedForm, string>;

  constructor() {
    super("QRFormDB");
    this.version(1).stores({
      checkins: "idempotency_key, sync_status",
      formCache: "qr_token",
    });
  }
}

export const db = new QRFormDatabase();
