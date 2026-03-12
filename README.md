# rhodium11-mcp

MCP server for [Rhodium11](https://rhodium11.com) Amazon ranking services. Exposes 21 tools for managing projects, schedules, orders, wallet, and sub-accounts through any MCP-compatible AI agent.

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

## Tools (21)

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

### Sub-Accounts
| Tool | Description |
|------|-------------|
| `rh11_subaccounts_list` | List sub-accounts |
| `rh11_subaccounts_create` | Create sub-account |
| `rh11_subaccounts_update` | Update sub-account (supports email rename) |
| `rh11_subaccounts_delete` | Delete sub-account (deactivates associated API keys) |

## Authentication

Authentication is handled automatically. The server exchanges your `RH11_API_KEY` for a JWT on the first tool call, proactively refreshes before expiry, and retries once on 401 errors. No manual token management needed.

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
