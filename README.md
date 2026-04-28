# rhodium11-mcp

MCP server for [Rhodium11](https://rhodium11.com). Exposes 19 tools for managing projects, schedules, orders, wallet, and feedback through any MCP-compatible AI agent.

## Quick Start

### With Claude Desktop / Claude Code

Add to your MCP config:

```json
{
  "mcpServers": {
    "rhodium11": {
      "command": "npx",
      "args": ["-y", "rhodium11-mcp"],
      "env": {
        "RH11_API_KEY": "cak_your_key_here"
      }
    }
  }
}
```

### With Cursor

Add the same configuration to your Cursor MCP settings.

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RH11_API_KEY` | Yes | — | Customer API key (`cak_` prefix) |
| `RH11_BASE_URL` | No | `https://app.rhodium11.com` | API base URL |

## Tools (19)

### Account
| Tool | Description |
|------|-------------|
| `rh11_account_get` | Get account info |
| `rh11_account_update_profile` | Update profile (first_name, last_name, company) |
| `rh11_account_get_service_rates` | Get current pricing rates |
| `rh11_account_get_subscription` | Get subscription info |

### Wallet
| Tool | Description |
|------|-------------|
| `rh11_wallet_get_balance` | Get wallet balance (credits + USD) |
| `rh11_wallet_get_transactions` | Get transaction history (paginated) |

### Projects
| Tool | Description |
|------|-------------|
| `rh11_projects_list` | List projects (with marketplace/region/active filters) |
| `rh11_projects_create` | Create a new project |
| `rh11_projects_get` | Get project details |
| `rh11_projects_update` | Pause/resume a project |
| `rh11_projects_archive` | Archive (soft delete) a project |
| `rh11_projects_get_stats` | Get daily stats (execution, SERP, ARA, BR, SQR, ranks) |

### Schedule
| Tool | Description |
|------|-------------|
| `rh11_schedule_get` | Get project schedule |
| `rh11_schedule_set` | Set full per-day schedule |
| `rh11_schedule_quick_set` | Quick-set uniform daily volumes |

### Orders
| Tool | Description |
|------|-------------|
| `rh11_orders_list` | List orders (paginated) |
| `rh11_orders_get` | Get order details |
| `rh11_orders_report_issue` | Report an issue (max 5 per order) |

### Feedback
| Tool | Description |
|------|-------------|
| `rh11_feedback_submit` | Submit feedback (10-5000 characters) |

## Authentication

Authentication is handled automatically. The server exchanges your `RH11_API_KEY` for a JWT on the first tool call, proactively refreshes before expiry, and retries once on 401 errors. No manual token management needed.

## Configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `RH11_API_KEY` | _(required)_ | Customer API key (starts with `cak_`). |
| `RH11_BASE_URL` | `https://app.rhodium11.com` | Override for staging or self-hosted backends. |
| `RH11_LOCK_SFB_DAYS` | `2` | Length (in days) of the SFB lock window surfaced via `sfb_lock_info`. Should match the backend's `LOCK_SFB_DAYS` setting. |

### `sfb_lock_info` on schedule responses

`rh11_schedule_get`, `rh11_schedule_set`, and `rh11_schedule_quick_set` augment the response with an `sfb_lock_info` block when scheduled SFB units fall inside the lock window. The backend (mpux-flask) freezes the next N days of SFB once a project has active SFB running — this field surfaces how many units are committed and the earliest date you can change SFB freely. Informational only; the backend remains the authority.

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
