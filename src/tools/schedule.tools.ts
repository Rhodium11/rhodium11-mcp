import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RH11Client } from "../client/rh11-client.js";
import type { ScheduleEntry, ScheduleResponse } from "../client/types.js";
import { formatResult, formatErrorResult } from "../utils/response.js";

const scheduleEntrySchema = z.object({
  date: z
    .string()
    .describe("Date in YYYY-MM-DD format, or 'ongoing' for all future days until next update"),
  atc: z.number().int().min(0).describe("Add-to-cart volume"),
  sfb: z.number().int().min(0).describe("Search-find-buy volume"),
  pgv: z.number().int().min(0).describe("Page view volume"),
  // Wishlist scheduling is not yet supported by the backend (always pass 0)
  wishlist: z.number().int().min(0).describe("Wishlist volume (not yet supported — must be 0)"),
});

export function registerScheduleTools(server: McpServer, client: RH11Client) {
  server.registerTool(
    "rh11_schedule_get",
    {
      description:
        "Get the current schedule for a Rhodium11 project. Shows per-day service volumes (atc, sfb, pgv, wishlist).",
      inputSchema: {
        ui_id: z.string().describe("Project unique identifier"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const res = await client.request<ScheduleResponse>(
          "GET",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}/schedule`,
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.registerTool(
    "rh11_schedule_set",
    {
      description:
        "Set the full per-day schedule for a Rhodium11 project. Replaces any existing schedule. Each entry represents one day with volumes for atc, sfb, pgv, and wishlist. Max 365 entries.",
      inputSchema: {
        ui_id: z.string().describe("Project unique identifier"),
        schedule: z
          .array(scheduleEntrySchema)
          .min(1)
          .max(365)
          .describe("Array of daily schedule entries"),
      },
      annotations: { destructiveHint: true, idempotentHint: true },
    },
    async (params) => {
      try {
        // Body must wrap entries in a `schedule` key
        const res = await client.request<ScheduleResponse>(
          "PUT",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}/schedule`,
          { schedule: params.schedule },
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.registerTool(
    "rh11_schedule_quick_set",
    {
      description:
        "Quick-set uniform daily volumes for a Rhodium11 project. WARNING: This clears any existing per-day schedule and replaces it with uniform values. All omitted fields default to 0.",
      inputSchema: {
        ui_id: z.string().describe("Project unique identifier"),
        atc: z.number().int().min(0).optional().describe("Add-to-cart volume per day (default 0)"),
        sfb: z.number().int().min(0).optional().describe("Search-find-buy volume per day (default 0)"),
        pgv: z.number().int().min(0).optional().describe("Page view volume per day (default 0)"),
        wishlist: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe("Wishlist volume per day (not yet supported — must be 0)"),
      },
      annotations: { destructiveHint: true, idempotentHint: true },
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {
          atc: params.atc ?? 0,
          sfb: params.sfb ?? 0,
          pgv: params.pgv ?? 0,
          wishlist: params.wishlist ?? 0,
        };

        const res = await client.request<ScheduleResponse>(
          "POST",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}/schedule/quick`,
          body,
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}
