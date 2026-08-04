import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RH11Client } from "../client/rh11-client.js";
import type { Project, ProjectListItem, MessageResponse, ProjectStatsResponse, KeywordProjection, ProjectionMeta } from "../client/types.js";
import { formatResult, formatErrorResult } from "../utils/response.js";

// Valid Amazon region codes (validated against CONSTANTS['MARKETPLACES'] in backend)
const VALID_REGIONS = [
  "US", "CA", "MX",          // Americas
  "UK", "DE", "FR", "IT",    // Europe
  "ES", "NL", "SE", "TR",    // Europe cont.
  "JP", "AU", "IN",          // Asia-Pacific
  "AE", "BR", "SG", "SA",   // Rest of world
] as const;

export function registerProjectsTools(server: McpServer, client: RH11Client) {
  server.registerTool(
    "rh11_projects_list",
    {
      description:
        "List Rhodium11 Amazon projects with optional filters. Returns ASIN, keyword, active status, and current service volumes.",
      inputSchema: {
        // Marketplace: currently Amazon-only. To re-enable walmart/target,
        // restore: marketplace: z.enum(["amazon", "walmart", "target"]).optional()
        region: z
          .enum(VALID_REGIONS)
          .optional()
          .describe("Filter by Amazon region"),
        active: z.boolean().optional().describe("Filter by active status"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const query: Record<string, string> = { marketplace: "amazon" };
        if (params.region !== undefined) query.region = params.region;
        if (params.active !== undefined) query.active = String(params.active);

        const res = await client.request<ProjectListItem[]>(
          "GET",
          "/api/v1/projects",
          undefined,
          query,
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.registerTool(
    "rh11_projects_create",
    {
      description:
        "Create a new Rhodium11 Amazon project. If a project with the same ASIN+keyword+region was previously archived, it will be reactivated instead (returns 201). ASIN must be a valid Amazon ASIN. Keyword must be 3-200 characters.",
      inputSchema: {
        // Marketplace: currently Amazon-only. To re-enable walmart/target,
        // restore: marketplace: z.enum(["amazon", "walmart", "target"])
        region: z
          .enum(VALID_REGIONS)
          .describe("Amazon region code"),
        asin: z
          .string()
          .describe("Amazon ASIN (e.g. 'B01MTJK06C')"),
        keyword: z
          .string()
          .min(3)
          .max(200)
          .describe("Target keyword (3-200 characters)"),
      },
    },
    async (params) => {
      try {
        const res = await client.request<Project>("POST", "/api/v1/projects", {
          marketplace: "amazon",
          region: params.region,
          product_id: params.asin,
          keyword: params.keyword,
        });
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.registerTool(
    "rh11_projects_get",
    {
      description:
        "Get detailed info for a specific Rhodium11 project including schedule, services, and SERP data.",
      inputSchema: {
        ui_id: z.string().describe("Project unique identifier"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const res = await client.request<Project>(
          "GET",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}`,
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.registerTool(
    "rh11_projects_update",
    {
      description:
        "Update a Rhodium11 project. Currently supports toggling the active status (pause/resume). To archive a project, use rh11_projects_archive instead.",
      inputSchema: {
        ui_id: z.string().describe("Project unique identifier"),
        active: z.boolean().optional().describe("Set active status (true=resume, false=pause)"),
      },
      annotations: { idempotentHint: true },
    },
    async (params) => {
      try {
        // Backend expects `{action: "activate"|"pause"|"archive"}` (see mpux-flask
        // routes_projects.py update_project). Translate the boolean MCP-facing
        // `active` flag into the corresponding action verb. Archive uses its own tool.
        if (params.active === undefined) {
          return formatErrorResult(
            new Error("At least one field (active) must be provided"),
          );
        }

        const body = { action: params.active ? "activate" : "pause" };

        const res = await client.request<Project>(
          "PATCH",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}`,
          body,
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.registerTool(
    "rh11_projects_archive",
    {
      description:
        "Archive (soft delete) a Rhodium11 Amazon project. The project can be reactivated by creating a new project with the same ASIN+keyword+region.",
      inputSchema: {
        ui_id: z.string().describe("Project unique identifier"),
      },
      annotations: { destructiveHint: true },
    },
    async (params) => {
      try {
        const res = await client.request<MessageResponse>(
          "DELETE",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}`,
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.registerTool(
    "rh11_projects_get_stats",
    {
      description:
        "Get daily stats for a Rhodium11 project: service execution (SFB, ATC, Wishlist, PGV), SERP rankings, ARA analytics, Brand Referral, and Search Query data. Note: this call may be slow (~1-2s) due to 14+ backend DB queries.",
      inputSchema: {
        ui_id: z.string().describe("Project unique identifier"),
        days: z
          .number()
          .int()
          .min(1)
          .max(365)
          .optional()
          .describe("Number of days of history (default 30, max 365)"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const query: Record<string, string> = {};
        if (params.days !== undefined) query.days = String(params.days);

        const res = await client.request<ProjectStatsResponse>(
          "GET",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}/stats`,
          undefined,
          query,
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.registerTool(
    "rh11_projects_get_projection",
    {
      description:
        "Get the recommended daily quantities for a project's keyword: how many purchases a day it takes to reach the top three, with a confidence range and matching add-to-cart and pageview volumes. Also returns how big the keyword is, what share the third-placed product holds, how often products that reach the top three keep the position, and a flag when the project is configured well above what the keyword can support. Use this before changing a schedule, or to check whether current volumes are sensible. Purchases do most of the ranking work; add-to-carts and pageviews carry far less weight on their own and are sized as supporting activity. Check keyword_market.third_place_share_basis: 'conversion' means measured, 'click' means estimated from click data, 'tier' means the typical share for keywords this size rather than anything measured on this one. When expectations.low_confidence is true, work from purchases_per_day_low/high rather than the single figure. A status other than 'ok' means no numbers are available and the message says why; 'stale_market' and 'error' are temporary, 'unsupported' and 'no_data' are not.",
      inputSchema: {
        ui_id: z.string().describe("Project unique identifier"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const res = await client.request<KeywordProjection>(
          "GET",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}/projection`,
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.registerTool(
    "rh11_keywords_projection",
    {
      description:
        "Research keywords BEFORE creating projects for them. Give it candidate keywords and it returns, for each, how big the keyword is, what share the third-placed product holds, and the daily purchases it would take to reach the top three, with a confidence range and matching add-to-cart and pageview volumes. Use it to compare candidates, size a launch, or check whether a keyword is worth targeting at all. Keywords Amazon barely reports come back as low_demand, meaning competition is minimal. Purchases do most of the ranking work; add-to-carts and pageviews carry far less weight on their own. Check keyword_market.third_place_share_basis to tell a measured share from one estimated from clicks or substituted from keywords of the same size, and prefer the low/high range whenever expectations.low_confidence is true. Returns {projections, budget}: budget carries daily_budget and daily_budget_used so you can pace yourself. Only newly looked-up keywords count against it; cached ones are free. Max 100 keywords per call.",
      inputSchema: {
        keywords: z
          .array(z.string().min(1))
          .min(1)
          .max(100)
          .describe("Candidate keywords to evaluate (max 100 per call)"),
        region: z
          .enum(VALID_REGIONS)
          .optional()
          .describe("Amazon region, defaults to US"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const res = await client.request<KeywordProjection[], ProjectionMeta>(
          "POST",
          "/api/v1/keywords/projection",
          { keywords: params.keywords, region: params.region ?? "US" },
        );
        // Pass the budget counters through. The description tells the agent a
        // daily budget exists; without these it can only find the limit by
        // hitting it.
        return formatResult({ projections: res.data, budget: res.meta });
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}
