# rhodium11-mcp

MCP server that wraps the Rhodium11 Customer API as 22 MCP tools. Published to npm as `rhodium11-mcp`.

## Architecture

```
MCP Client (Claude Code / Cursor / etc.)
    │  stdio (JSON-RPC 2.0)
    ▼
┌─────────────────────────────┐
│  rhodium11-mcp (this repo)  │
│  McpServer + 22 tools       │
│  RH11Client (JWT lifecycle) │
└──────────┬──────────────────┘
           │  HTTPS (Bearer JWT)
           ▼
┌─────────────────────────────┐
│  Customer API (mpux-flask)  │
│  /api/v1/*  (25 endpoints)  │
└─────────────────────────────┘
```

## Project Structure

- `src/index.ts` — Entry point: McpServer + stdio transport
- `src/client/rh11-client.ts` — HTTP client with JWT lifecycle (lazy auth, proactive refresh, 401 retry)
- `src/client/types.ts` — API request/response type definitions
- `src/tools/*.tools.ts` — Tool registration files (one per domain)
- `src/utils/errors.ts` — RH11ApiError class
- `src/utils/response.ts` — formatResult / formatError / formatPaginatedResult helpers

## Commands

- `npm run build` — Compile TypeScript
- `npm run dev` — Watch mode
- `npm test` — Run vitest
- `npm start` — Run the MCP server

## Key Design Decisions

- Auth is lazy: first tool call triggers JWT exchange, not server boot
- JWT refresh is proactive (30s before expiry) with 401 retry fallback
- `POST /auth/keys` is intentionally excluded (security: AI agent should not mint API keys)
- Tool naming: `rh11_<domain>_<action>`
- Annotations use MCP SDK hints (readOnlyHint, destructiveHint, idempotentHint)

## API Reference

The source of truth for the Customer API is in mpux-flask:
- `mpux-flask/api_customer/SPEC.md` — Full API spec
- `mpux-flask/api_customer/validators.py` — Validation rules
- `mpux-flask/api_customer/serializers.py` — Response shapes

## Configuration

| Env Var | Required | Default |
|---------|----------|---------|
| `RH11_API_KEY` | Yes | — |
| `RH11_BASE_URL` | No | `https://app.rhodium11.com` |
