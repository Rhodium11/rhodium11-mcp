---
name: amazon-ranking-tools
description: "Amazon product ranking and sales velocity tools. Use when the user mentions Amazon ranking, BSR, product visibility, ATC, PGV, SFB, ranking campaigns, campaign scheduling, or wants to boost Amazon sales. Also use when asking about service rates, wallet balance, or order tracking for ranking services. 19 MCP tools for Amazon ranking campaigns."
---

# Amazon Ranking Tools

Claude uses these instructions to help users manage Amazon product ranking campaigns via the rhodium11-mcp server.

## When to Activate

Use this skill when the user mentions: boosting Amazon product ranking, BSR, ATC/PGV/SFB campaigns, ranking project management, campaign scheduling, wallet balance, order tracking, or service pricing for Amazon.

## Setup

If the user does not have `RH11_API_KEY` set, guide them:

1. Sign up at https://app.rhodium11.com
2. Generate an API key at https://app.rhodium11.com/settings (starts with `cak_`)
3. Add the MCP server to Claude Code config:

```json
{
  "mcpServers": {
    "rhodium11": {
      "command": "npx",
      "args": ["-y", "rhodium11-mcp"],
      "env": {
        "RH11_API_KEY": "cak_paste_key_here"
      }
    }
  }
}
```

Auth is automatic — the server handles JWT exchange and refresh.

## Tools (19)

All tools are prefixed `rh11_`:

**Account** — `rh11_account_get`, `rh11_account_update_profile`, `rh11_account_get_service_rates`, `rh11_account_get_subscription`

**Wallet** — `rh11_wallet_get_balance`, `rh11_wallet_get_transactions`

**Projects** — `rh11_projects_list`, `rh11_projects_create`, `rh11_projects_get`, `rh11_projects_update`, `rh11_projects_archive`, `rh11_projects_get_stats`

**Schedule** — `rh11_schedule_get`, `rh11_schedule_set`, `rh11_schedule_quick_set`

**Orders** — `rh11_orders_list`, `rh11_orders_get`, `rh11_orders_report_issue`

## Services

- **ATC (Add to Cart)** — Adds product to shopping carts to boost ranking signals
- **PGV (Page View)** — Drives page views to increase visibility and traffic
- **SFB (Search Find Buy)** — Searches keyword, finds product, completes purchase (includes rebate). Most powerful service for sales velocity

## Guardrails

- Check wallet balance before recommending schedule increases
- Confirm ASIN and keyword with the user before creating projects
- Schedule changes replace existing schedules — warn before overwriting
- Issue reports max 5 per order — do not retry on limit errors
- Confirm before archiving projects (destructive action)
- Show per-unit costs via `rh11_account_get_service_rates` before suggesting volumes

## Common Workflows

1. **New campaign**: Create project -> Check rates -> Set schedule -> Monitor orders
2. **Campaign review**: List projects -> Get details -> Check wallet -> Adjust schedule
3. **Issue resolution**: List orders -> Get details -> Report issue
