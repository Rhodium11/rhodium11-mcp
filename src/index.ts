#!/usr/bin/env node

import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { RH11Client } from "./client/rh11-client.js";
import { registerAccountTools } from "./tools/account.tools.js";
import { registerWalletTools } from "./tools/wallet.tools.js";
import { registerProjectsTools } from "./tools/projects.tools.js";
import { registerScheduleTools } from "./tools/schedule.tools.js";
import { registerOrdersTools } from "./tools/orders.tools.js";
import { registerFeedbackTools } from "./tools/feedback.tools.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

const apiKey = process.env.RH11_API_KEY;
if (!apiKey) {
  console.error("RH11_API_KEY environment variable is required");
  process.exit(1);
}

const baseUrl =
  process.env.RH11_BASE_URL || "https://app.rhodium11.com";

// User-Agent identifies traffic as MCP-originated server-side so we can
// differentiate MCP usage from other Customer API consumers and tag push
// notifications accordingly.
const userAgent = `rhodium11-mcp/${pkg.version}`;

const client = new RH11Client(apiKey, baseUrl, userAgent);

const server = new McpServer({
  name: "rhodium11",
  version: pkg.version,
});

registerAccountTools(server, client);
registerWalletTools(server, client);
registerProjectsTools(server, client);
registerScheduleTools(server, client);
registerOrdersTools(server, client);
registerFeedbackTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
