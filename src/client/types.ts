/** API response envelope for success responses. */
export interface ApiSuccessResponse<T, M = PaginationMeta> {
  status: "success";
  data: T;
  meta?: M;
}

/** API response envelope for error responses. */
export interface ApiErrorResponse {
  status: "error";
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Returned by POST /keywords/projection. Carries the daily budget counters,
 *  so an agent can pace itself instead of discovering the limit by hitting it.
 *  Only newly looked-up keywords count against the budget; cached ones are
 *  free. */
export interface ProjectionMeta {
  region: string;
  requested: number;
  new_keywords_looked_up: number;
  daily_budget: number;
  daily_budget_used: number;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

/** POST /auth/token response — includes both tokens + cid. */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  cid: string;
}

/** POST /auth/refresh response — access_token only, NO refresh_token. */
export interface RefreshResponse {
  access_token: string;
}

/** Stored JWT state within RH11Client. */
export interface JwtState {
  access_token: string;
  refresh_token: string;
  /** Unix seconds when the access token expires. */
  expires_at: number;
}

// ── Account ──────────────────────────────────────────────────────────────────

export interface Account {
  cid: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  account_type: string;
  dt_created: string;
  plan: string;
}

export interface Subscription {
  account_type: string;
  use_wallet: boolean;
  plansv3: boolean;
  plan_label: string;
  subscription_fee: number;
  plans_discount: number;
}

export interface ServiceRates {
  [key: string]: unknown;
}

// ── Wallet ───────────────────────────────────────────────────────────────────

export interface WalletBalance {
  credits: number;
  usd: number;
  warning?: string;
}

export interface Transaction {
  id: string;
  dt_utc: string;
  name: string;
  event: string;
  credits: number;
  credit_balance: number | null;
  usd: number;
  usd_balance: number | null;
  source: string;
}

// ── Projects ─────────────────────────────────────────────────────────────────

export interface Project {
  ui_id: string;
  cid: string;
  marketplace: string;
  region: string;
  asin: string | null;
  itemid: string | null;
  keyword: string;
  active: boolean;
  archived: boolean;
  dt_utc: string;
  product_id: string;
  services: {
    atc: number;
    sfb: number;
    pgv: number;
    wishlist: number;
  };
  scheduling: ScheduleEntry[];
  data: {
    serps: Record<string, unknown>;
  };
  unavailable: boolean;
}

export interface ProjectListItem {
  ui_id: string;
  marketplace: string;
  region: string;
  asin: string | null;
  itemid: string | null;
  keyword: string;
  active: boolean;
  archived: boolean;
  product_id: string;
  services: {
    atc: number;
    sfb: number;
    pgv: number;
    wishlist: number;
  };
}

// ── Schedule ─────────────────────────────────────────────────────────────────

export interface ScheduleEntry {
  id: string;         // e.g. "04032026" or "ongoing"
  date: string;       // e.g. "04/03/2026" or "ongoing"
  atc: number;
  purchase: number;   // backend renames sfb → purchase
  pageview: number;   // backend renames pgv → pageview
  wishlist: number;
}

export interface ScheduleResponse {
  ui_id: string;
  services: {
    atc: number;
    sfb: number;
    pgv: number;
    wishlist: number;
  };
  scheduling: ScheduleEntry[];
}

// ── Project Stats ───────────────────────────────────────────────────────────

export interface ProjectStatsResponse {
  days: number;
  total: number;
  stats: ProjectStatsDay[];
}

export interface ProjectStatsDay {
  date: string;                    // YYYYMMDD
  dt: string | null;               // ISO datetime with timezone
  services: {
    sfb: ServiceDayStats;
    atc: ServiceDayStats;
    wishlist: ServiceDayStats;
    pgv: ServiceDayStats;
  };
  serp: Record<string, unknown> | null;
  ara: Record<string, unknown> | null;
  br: Record<string, unknown> | null;
  sqr: Record<string, unknown> | null;
  ranks: unknown[] | null;
}

export interface ServiceDayStats {
  assignments: number | null;
  executed: number;
}

// ── Orders ───────────────────────────────────────────────────────────────────

export interface Order {
  order_id: string;
  cid: string;
  status: string;
  dt_utc: string;
  items: unknown[];
  campaign: string;
  region: string;
  asin: string | null;
  keyword: string;
  ui_id: string;
  issue_reported: boolean;
}

// ── Sub-Accounts ─────────────────────────────────────────────────────────────

export interface SubAccount {
  email: string;
  first_name: string;
  last_name: string;
}

// ── Generic message response (archive, sub-account update/delete) ────────────

export interface MessageResponse {
  message: string;
  [key: string]: unknown;
}

// ── Keyword projection (GET /projects/{ui_id}/projection) ────────────────────

export type ProjectionStatus =
  /** A recommendation is available. */
  | "ok"
  /** Too little search volume for extra activity to buy rank. No numbers. */
  | "low_demand"
  /** The term is not in the search-terms archive. No numbers. */
  | "no_data"
  /** This marketplace is not covered by the archive. No numbers. */
  | "unsupported"
  /** That marketplace's search data is behind, so answering now would be
   *  based on old activity. Self-healing; retry later. No numbers. */
  | "stale_market"
  /** The upstream archive could not be reached. Transient. No numbers. */
  | "error"
  /** Keyword projections are not configured on this environment. */
  | "unconfigured";

export interface KeywordProjection {
  status: ProjectionStatus;
  keyword: string;
  region: string;
  ui_id?: string;
  asin?: string;
  configured?: {
    purchases_per_day: number;
    add_to_carts_per_day: number;
    pageviews_per_day: number;
    wishlists_per_day: number;
  };
  recommended: {
    purchases_per_day?: number;
    purchases_per_day_low?: number;
    purchases_per_day_high?: number;
    add_to_carts_per_day?: number;
    pageviews_per_day?: number;
  };
  keyword_market?: {
    size: string;
    search_frequency_rank: number;
    estimated_purchases_per_day: number;
    third_place_share_pct: number;
    /** How third_place_share_pct was arrived at:
     *  "conversion" - measured from Amazon's published purchase share.
     *  "click"      - estimated from click share; treat as an estimate and
     *                 work from the low/high range, not the single figure.
     *  "tier"       - not measured on this keyword at all; the typical share
     *                 for keywords of this size. */
    third_place_share_basis?: "conversion" | "click" | "tier";
  };
  expectations?: {
    hold_top3_after_2_weeks_pct: number;
    hold_top3_after_4_weeks_pct: number;
    /** True when the figure is derived rather than measured, or rests on a
     *  thin window. The low/high range is widened to match; prefer it over
     *  purchases_per_day when this is set. */
    low_confidence: boolean;
  };
  overspend?: {
    services: Array<{ service: string; configured: number; recommended: number }>;
    note: string;
  };
  data_through?: string;
  message?: string;
}
