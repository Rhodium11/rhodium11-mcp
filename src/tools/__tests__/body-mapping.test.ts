import { describe, it, expect } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAccountTools } from "../account.tools.js";
import { registerProjectsTools } from "../projects.tools.js";

interface CapturedRequest {
  method: string;
  path: string;
  body?: unknown;
}

function makeFakeClient(captured: CapturedRequest[]) {
  return {
    request: async (method: string, path: string, body?: unknown) => {
      captured.push({ method, path, body });
      return { data: { ok: true } };
    },
  } as any;
}

function getHandler(server: McpServer, name: string) {
  const registered = (server as any)._registeredTools as Record<string, { callback?: Function; handler?: Function }>;
  const tool = registered[name];
  // McpServer exposes the handler under different keys depending on registration variant; pick whichever is callable.
  return (tool.callback ?? tool.handler) as Function;
}

describe("rh11_account_update_profile body mapping", () => {
  it("translates `company` (MCP) → `company_name` (backend)", async () => {
    const captured: CapturedRequest[] = [];
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerAccountTools(server, makeFakeClient(captured));

    const handler = getHandler(server, "rh11_account_update_profile");
    await handler({ company: "ACME Inc" });

    expect(captured).toHaveLength(1);
    expect(captured[0].body).toEqual({ company_name: "ACME Inc" });
    // Sanity: the MCP-facing field should NOT leak through as `company`.
    expect((captured[0].body as Record<string, unknown>).company).toBeUndefined();
  });

  it("passes first_name/last_name through unchanged alongside company_name", async () => {
    const captured: CapturedRequest[] = [];
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerAccountTools(server, makeFakeClient(captured));

    const handler = getHandler(server, "rh11_account_update_profile");
    await handler({ first_name: "Tom", last_name: "Jejo", company: "Jejo.ai" });

    expect(captured[0].body).toEqual({
      first_name: "Tom",
      last_name: "Jejo",
      company_name: "Jejo.ai",
    });
  });
});

describe("rh11_projects_update body mapping", () => {
  it("translates `active: true` → `action: 'activate'`", async () => {
    const captured: CapturedRequest[] = [];
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerProjectsTools(server, makeFakeClient(captured));

    const handler = getHandler(server, "rh11_projects_update");
    await handler({ ui_id: "RH123", active: true });

    expect(captured[0].body).toEqual({ action: "activate" });
  });

  it("translates `active: false` → `action: 'pause'`", async () => {
    const captured: CapturedRequest[] = [];
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerProjectsTools(server, makeFakeClient(captured));

    const handler = getHandler(server, "rh11_projects_update");
    await handler({ ui_id: "RH123", active: false });

    expect(captured[0].body).toEqual({ action: "pause" });
  });
});
