import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RH11Client } from "../client/rh11-client.js";
import type { Order, MessageResponse } from "../client/types.js";
import { formatResult, formatPaginatedResult, formatErrorResult } from "../utils/response.js";

export function registerOrdersTools(server: McpServer, client: RH11Client) {
  server.tool(
    "rh11_orders_list",
    "List Rhodium11 orders (paginated, newest first). Includes order status, campaign, region, and issue report status.",
    {
      page: z.number().int().min(1).optional().describe("Page number (default 1)"),
      per_page: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Results per page (default 50, max 100)"),
    },
    { readOnlyHint: true  },
    async (params) => {
      try {
        const query: Record<string, string> = {};
        if (params.page !== undefined) query.page = String(params.page);
        if (params.per_page !== undefined)
          query.per_page = String(params.per_page);

        const res = await client.request<Order[]>(
          "GET",
          "/api/v1/orders",
          undefined,
          query,
        );
        if (res.meta) {
          return formatPaginatedResult(res.data, res.meta);
        }
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "rh11_orders_get",
    "Get detailed info for a specific Rhodium11 order.",
    {
      order_id: z.string().describe("Order identifier"),
    },
    { readOnlyHint: true  },
    async (params) => {
      try {
        const res = await client.request<Order>(
          "GET",
          `/api/v1/orders/${encodeURIComponent(params.order_id)}`,
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "rh11_orders_report_issue",
    "Report an issue with a Rhodium11 order. Maximum 5 issue reports per order — do not retry if you receive a limit error. Description must be 1-1000 characters.",
    {
      order_id: z.string().describe("Order identifier"),
      description: z
        .string()
        .min(1)
        .max(1000)
        .describe("Issue description (1-1000 characters)"),
    },
    { destructiveHint: false  },
    async (params) => {
      try {
        const res = await client.request<MessageResponse>(
          "POST",
          `/api/v1/orders/${encodeURIComponent(params.order_id)}/report-issue`,
          { description: params.description },
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}
