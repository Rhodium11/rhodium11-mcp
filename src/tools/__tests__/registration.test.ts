import { describe, it, expect } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAccountTools } from "../account.tools.js";
import { registerProjectsTools } from "../projects.tools.js";
import { registerOrdersTools } from "../orders.tools.js";
import { registerScheduleTools } from "../schedule.tools.js";
import { registerWalletTools } from "../wallet.tools.js";
import { registerFeedbackTools } from "../feedback.tools.js";

describe("tool registration", () => {
  it("every registered tool has a callable handler", () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    const fakeClient = {} as any;
    registerAccountTools(server, fakeClient);
    registerProjectsTools(server, fakeClient);
    registerOrdersTools(server, fakeClient);
    registerScheduleTools(server, fakeClient);
    registerWalletTools(server, fakeClient);
    registerFeedbackTools(server, fakeClient);

    const registered = (server as any)._registeredTools as Record<string, unknown>;
    const names = Object.keys(registered);
    expect(names.length).toBe(19);
    for (const [name, tool] of Object.entries(registered)) {
      expect(typeof (tool as any).handler, `${name} handler`).toBe("function");
    }
  });
});
