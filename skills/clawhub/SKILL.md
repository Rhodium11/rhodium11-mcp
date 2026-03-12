---
name: amazon-ranking-tools
description: "Amazon product ranking and sales velocity tools for sellers. Manage ATC (Add to Cart), PGV (Page View), and SFB (Search Find Buy) campaigns to boost BSR, increase product visibility, and accelerate sales. 21 tools for project management, scheduling, order tracking, wallet balance, team sub-accounts, and service rate lookups. Supports Amazon, Walmart, and Target marketplaces across all regions. Automate daily campaign volumes, monitor order status, and scale ranking efforts — all through natural language. Keywords: amazon ranking tools, boost amazon sales, amazon SEO, product ranking, ASIN, sales velocity, campaign management, ranking acceleration, traffic generation, amazon seller tools."
version: 1.0.0
metadata:
  openclaw:
    emoji: "🚀"
    primaryEnv: "RH11_API_KEY"
    requires:
      env: ["RH11_API_KEY"]
      bins: ["npx"]
    install:
      - id: node-install
        kind: brew
        formula: node
        bins: ["node", "npx"]
        label: "Install Node.js (brew)"
        os: ["darwin", "linux"]
---

# Amazon Ranking Tools

Claude uses these instructions to help Amazon sellers manage product ranking campaigns through the rhodium11-mcp server.

## When to Activate

Activate this skill when the user asks about any of the following:

- Boosting Amazon product ranking or BSR
- Setting up ATC (Add to Cart), PGV (Page View), or SFB (Search Find Buy) campaigns
- Managing product ranking projects for Amazon, Walmart, or Target
- Scheduling daily campaign volumes
- Checking wallet balance or transaction history
- Viewing or managing orders for ranking services
- Managing team members / sub-accounts
- Checking service pricing or subscription details

## Setup — Getting an API Key

If the user does not have `RH11_API_KEY` configured, walk them through setup:

1. **Create an account** at https://app.rhodium11.com (free to sign up)
2. **Generate an API key** at https://app.rhodium11.com/settings — the key starts with `cak_`
3. **Configure the MCP server** by adding this to the user's Claude Code MCP config (`~/.claude/settings.json` or project-level `.mcp.json`):

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

Authentication is automatic after setup. The server exchanges the API key for a JWT on first use, refreshes it proactively, and retries on expiry. No manual token management needed.

## Available Tools (21)

All tools are prefixed with `rh11_`. Use them by name.

### Account (4 tools)
| Tool | What it does |
|------|-------------|
| `rh11_account_get` | Get account info (email, name, company, plan) |
| `rh11_account_update_profile` | Update first name, last name, or company |
| `rh11_account_get_service_rates` | Get current pricing for ATC, PGV, SFB services |
| `rh11_account_get_subscription` | Get subscription plan details, fees, discounts |

### Wallet (2 tools)
| Tool | What it does |
|------|-------------|
| `rh11_wallet_get_balance` | Check credits and USD balance |
| `rh11_wallet_get_transactions` | View transaction history (paginated) |

### Projects (5 tools)
| Tool | What it does |
|------|-------------|
| `rh11_projects_list` | List projects with optional marketplace/region/active filters |
| `rh11_projects_create` | Create a new project (marketplace + region + ASIN + keyword) |
| `rh11_projects_get` | Get project details including schedule and SERP data |
| `rh11_projects_update` | Pause or resume a project |
| `rh11_projects_archive` | Archive (soft delete) a project |

### Schedule (3 tools)
| Tool | What it does |
|------|-------------|
| `rh11_schedule_get` | View the daily schedule for a project |
| `rh11_schedule_set` | Set a full per-day schedule (up to 365 days) |
| `rh11_schedule_quick_set` | Quick-set uniform daily volumes for ATC, PGV, SFB |

### Orders (3 tools)
| Tool | What it does |
|------|-------------|
| `rh11_orders_list` | List orders (paginated, newest first) |
| `rh11_orders_get` | Get order details and status |
| `rh11_orders_report_issue` | Report an issue with an order (max 5 per order) |

### Sub-Accounts (4 tools)
| Tool | What it does |
|------|-------------|
| `rh11_subaccounts_list` | List team member sub-accounts |
| `rh11_subaccounts_create` | Create a new sub-account |
| `rh11_subaccounts_update` | Update sub-account details |
| `rh11_subaccounts_delete` | Delete a sub-account |

## Services Explained

- **Add to Cart (ATC)** — Generates add-to-cart actions on the target product to boost ranking signals.
- **Page View (PGV)** — Drives product page views to increase visibility and organic ranking.
- **Search Find Buy (SFB)** — Searches a keyword, finds the product, completes a purchase (includes rebate). The most powerful service for sales velocity and keyword ranking.

## Important Guardrails

- Always check wallet balance before recommending large schedule increases.
- When creating projects, confirm the ASIN and keyword with the user before calling the tool.
- Schedule changes replace existing schedules — warn the user before overwriting.
- Issue reports are limited to 5 per order. Do not retry if a limit error is returned.
- The `rh11_projects_archive` tool is destructive. Confirm with the user before archiving.
- Never suggest volumes without the user understanding the per-unit cost. Use `rh11_account_get_service_rates` first.

## Common Workflows

1. **New campaign setup**: Create project -> Check rates -> Set schedule -> Monitor orders
2. **Campaign review**: List projects -> Get project details -> Check wallet -> Adjust schedule
3. **Issue resolution**: List orders -> Get order details -> Report issue if needed
