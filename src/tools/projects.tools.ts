import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RH11Client } from "../client/rh11-client.js";
import type { Project, ProjectListItem, MessageResponse, ProjectStatsResponse } from "../client/types.js";
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
  server.tool(
    "rh11_projects_list",
    "List Rhodium11 Amazon projects with optional filters. Returns ASIN, keyword, active status, and current service volumes.",
    {
      // Marketplace: currently Amazon-only. To re-enable walmart/target,
      // restore: marketplace: z.enum(["amazon", "walmart", "target"]).optional()
      region: z
        .enum(VALID_REGIONS)
        .optional()
        .describe("Filter by Amazon region"),
      active: z.boolean().optional().describe("Filter by active status"),
    },
    { readOnlyHint: true  },
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

  server.tool(
    "rh11_projects_create",
    "Create a new Rhodium11 Amazon project. If a project with the same ASIN+keyword+region was previously archived, it will be reactivated instead (returns 201). ASIN must be a valid Amazon ASIN. Keyword must be 3-200 characters.",
    {
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
    {},
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

  server.tool(
    "rh11_projects_get",
    "Get detailed info for a specific Rhodium11 project including schedule, services, and SERP data.",
    {
      ui_id: z.string().describe("Project unique identifier"),
    },
    { readOnlyHint: true  },
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

  server.tool(
    "rh11_projects_update",
    "Update a Rhodium11 project. Currently supports toggling the active status (pause/resume). To archive a project, use rh11_projects_archive instead.",
    {
      ui_id: z.string().describe("Project unique identifier"),
      active: z.boolean().optional().describe("Set active status (true=resume, false=pause)"),
    },
    { idempotentHint: true  },
    async (params) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.active !== undefined) body.active = params.active;

        if (Object.keys(body).length === 0) {
          return formatErrorResult(
            new Error("At least one field (active) must be provided"),
          );
        }

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

  server.tool(
    "rh11_projects_archive",
    "Archive (soft delete) a Rhodium11 Amazon project. The project can be reactivated by creating a new project with the same ASIN+keyword+region.",
    {
      ui_id: z.string().describe("Project unique identifier"),
    },
    { destructiveHint: true  },
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

  server.tool(
    "rh11_projects_get_stats",
    "Get daily stats for a Rhodium11 project: service execution (SFB, ATC, Wishlist, PGV), SERP rankings, ARA analytics, Brand Referral, and Search Query data. Note: this call may be slow (~1-2s) due to 14+ backend DB queries.",
    {
      ui_id: z.string().describe("Project unique identifier"),
      days: z
        .number()
        .int()
        .min(1)
        .max(365)
        .optional()
        .describe("Number of days of history (default 30, max 365)"),
    },
    { readOnlyHint: true },
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
}
