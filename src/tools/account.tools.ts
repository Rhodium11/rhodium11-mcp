import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RH11Client } from "../client/rh11-client.js";
import type { Account, ServiceRates, Subscription } from "../client/types.js";
import { formatResult, formatErrorResult } from "../utils/response.js";

export function registerAccountTools(server: McpServer, client: RH11Client) {
  server.tool(
    "rh11_account_get",
    "Get Rhodium11 account info (email, name, company, plan, account type)",
    {},
    { readOnlyHint: true  },
    async () => {
      try {
        const res = await client.request<Account>("GET", "/api/v1/account");
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "rh11_account_update_profile",
    "Update Rhodium11 account profile fields (first_name, last_name, company). At least one field required.",
    {
      first_name: z.string().optional().describe("New first name"),
      last_name: z.string().optional().describe("New last name"),
      company: z.string().optional().describe("New company name"),
    },
    { idempotentHint: true  },
    async (params) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.first_name !== undefined) body.first_name = params.first_name;
        if (params.last_name !== undefined) body.last_name = params.last_name;
        if (params.company !== undefined) body.company = params.company;

        const res = await client.request<Account>(
          "PATCH",
          "/api/v1/account/profile",
          body,
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "rh11_account_get_service_rates",
    "Get current Rhodium11 service pricing rates. Returns empty object if no plan is active.",
    {},
    { readOnlyHint: true  },
    async () => {
      try {
        const res = await client.request<ServiceRates>(
          "GET",
          "/api/v1/account/service-rates",
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "rh11_account_get_subscription",
    "Get Rhodium11 subscription info (plan label, fee, discount, wallet usage)",
    {},
    { readOnlyHint: true  },
    async () => {
      try {
        const res = await client.request<Subscription>(
          "GET",
          "/api/v1/account/subscription",
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}
