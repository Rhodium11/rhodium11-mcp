import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RH11Client } from "../client/rh11-client.js";
import type { Project, ProjectListItem, MessageResponse } from "../client/types.js";
import { formatResult, formatErrorResult } from "../utils/response.js";

export function registerProjectsTools(server: McpServer, client: RH11Client) {
  server.tool(
    "rh11_projects_list",
    "List Rhodium11 projects with optional filters. Returns product_id (ASIN for Amazon, itemid for other marketplaces), keyword, active status, and current service volumes.",
    {
      marketplace: z
        .enum(["amazon", "walmart", "target"])
        .optional()
        .describe("Filter by marketplace"),
      region: z.string().optional().describe("Filter by region (e.g. 'US', 'UK')"),
      active: z.boolean().optional().describe("Filter by active status"),
    },
    { readOnlyHint: true  },
    async (params) => {
      try {
        const query: Record<string, string> = {};
        if (params.marketplace !== undefined)
          query.marketplace = params.marketplace;
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
    "Create a new Rhodium11 project. If a project with the same product_id+keyword+region was previously archived, it will be reactivated instead (returns 201). For Amazon, product_id must be a valid ASIN. Keyword must be 3-200 characters.",
    {
      marketplace: z
        .enum(["amazon", "walmart", "target"])
        .describe("Marketplace (amazon, walmart, target)"),
      region: z.string().describe("Region code (e.g. 'US', 'UK', 'DE')"),
      product_id: z
        .string()
        .describe("Product identifier (ASIN for Amazon, item ID for others)"),
      keyword: z
        .string()
        .min(3)
        .max(200)
        .describe("Target keyword (3-200 characters)"),
    },
    { destructiveHint: false  },
    async (params) => {
      try {
        const res = await client.request<Project>("POST", "/api/v1/projects", {
          marketplace: params.marketplace,
          region: params.region,
          product_id: params.product_id,
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
    "Archive (soft delete) a Rhodium11 project. The project can be reactivated by creating a new project with the same product_id+keyword+region.",
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
}
