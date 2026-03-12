import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RH11Client } from "../client/rh11-client.js";
import type { SubAccount, MessageResponse } from "../client/types.js";
import { formatResult, formatErrorResult } from "../utils/response.js";

export function registerSubaccountsTools(
  server: McpServer,
  client: RH11Client,
) {
  server.tool(
    "rh11_subaccounts_list",
    "List all Rhodium11 sub-accounts (email, first_name, last_name).",
    {},
    { readOnlyHint: true  },
    async () => {
      try {
        const res = await client.request<SubAccount[]>(
          "GET",
          "/api/v1/sub-accounts",
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "rh11_subaccounts_create",
    "Create a new Rhodium11 sub-account. Requires email, password (min 8 chars), first_name, and last_name. Consider generating a secure random password for the sub-account.",
    {
      email: z.string().email().describe("Sub-account email address"),
      password: z
        .string()
        .min(8)
        .describe("Password (minimum 8 characters)"),
      first_name: z.string().describe("First name"),
      last_name: z.string().describe("Last name"),
    },
    { destructiveHint: false  },
    async (params) => {
      try {
        const res = await client.request<SubAccount>(
          "POST",
          "/api/v1/sub-accounts",
          {
            email: params.email,
            password: params.password,
            first_name: params.first_name,
            last_name: params.last_name,
          },
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "rh11_subaccounts_update",
    "Update a Rhodium11 sub-account. To rename the email, pass the new email in the body. Only provided fields are updated. Response is a confirmation message only.",
    {
      email: z.string().email().describe("Current email of the sub-account (path identifier)"),
      new_email: z
        .string()
        .email()
        .optional()
        .describe("New email address (renames the sub-account atomically)"),
      password: z
        .string()
        .min(8)
        .optional()
        .describe("New password (minimum 8 characters)"),
      first_name: z.string().optional().describe("New first name"),
      last_name: z.string().optional().describe("New last name"),
    },
    { idempotentHint: true  },
    async (params) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.new_email !== undefined) body.email = params.new_email;
        if (params.password !== undefined) body.password = params.password;
        if (params.first_name !== undefined)
          body.first_name = params.first_name;
        if (params.last_name !== undefined) body.last_name = params.last_name;

        const res = await client.request<MessageResponse>(
          "PATCH",
          `/api/v1/sub-accounts/${encodeURIComponent(params.email)}`,
          body,
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "rh11_subaccounts_delete",
    "Delete a Rhodium11 sub-account. WARNING: This also deactivates all API keys associated with the sub-account. This action cannot be undone.",
    {
      email: z.string().email().describe("Email of the sub-account to delete"),
    },
    { destructiveHint: true  },
    async (params) => {
      try {
        const res = await client.request<MessageResponse>(
          "DELETE",
          `/api/v1/sub-accounts/${encodeURIComponent(params.email)}`,
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}
