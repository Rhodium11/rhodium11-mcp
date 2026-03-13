# Amazon Seller Skills & Tools — Competitive Landscape

Research conducted 2026-03-13 across 12 parallel agents.

## Summary

| Platform | Size | Finding |
|----------|------|---------|
| 🏪 [ClawHub](https://clawhub.ai/skills) | 19K+ skills | 5 Amazon skills exist — all buyer/data side. Zero ranking tools |
| 🏪 [skills.sh](https://skills.sh/) | 88K+ skills | Zero Amazon/e-commerce skills of any kind |
| 🔧 MCP Registries | 7 registries, ~50K servers | 13 Amazon MCP servers — all analytics/ads/SP-API. None do ATC/PGV/SFB |
| 💼 Traditional SaaS | Helium 10, Jungle Scout, etc. | 12+ tools mapped — all research/analytics/PPC. No ranking services |

**Bottom line:** `amazon-ranking-tools` would be the first and only skill offering actual ranking services (ATC/PGV/SFB) on any platform.

---

## ClawHub Skills (Amazon/E-commerce)

| Skill | What It Does | Relevance to rh11 |
|-------|-------------|-------------------|
| [`amazon-data`](https://playbooks.com/skills/openclaw/skills/amazon-data) | Product data, pricing, reviews, sales estimates via Canopy API | Data only — no ranking services |
| [`amazon-checkout`](https://playbooks.com/skills/openclaw/skills/amazon-checkout) | Conversational Amazon purchasing with spending limits | Buyer-side, not seller tools |
| [`buy-anything`](https://lobehub.com/skills/openclaw-skills-buy-anything) | General Amazon purchasing from product URLs | Buyer-side |
| [`ecommerce`](https://playbooks.com/skills/openclaw/skills/ecommerce) | Build/operate online stores, payment, inventory | Generic e-commerce, not Amazon ranking |
| [Pangolinfo API](https://www.pangolinfo.com/ai-agent-e-commerce-automation-how-openclaw-connects-with-pangolinfo-api/) | Real-time Amazon structured data (scraping) | Data scraping only |

---

## Amazon MCP Servers (All Registries)

| Server | Maker | Type | What It Does | Gap vs rh11 |
|--------|-------|------|-------------|-------------|
| [Amazon Ads MCP](https://advertising.amazon.com/API/docs/en-us/mcp/mcp-overview) | Amazon (official) | PPC | 50+ tools for Sponsored Products/Brands/Display campaigns | Ads only, no organic ranking |
| [Seller Labs MCP](https://www.sellerlabs.com/amazon-mcp/) | Seller Labs | Analytics | Read-only analytics over 50+ SP-API data tables | Data insights only |
| [Adzviser MCP](https://adzviser.com/connect/amazon-seller-central-to-claude-integration) | Adzviser | Reporting | Seller Central data → Claude (sales, Brand Analytics) | Reporting only |
| [Windsor.ai MCP](https://windsor.ai/connect/amazon-seller-central-mcp/) | Windsor.ai | Reporting | Seller Central data pipeline to AI | Reporting only |
| [AmazonSeller-mcp-server](https://github.com/mattcoatsworth/AmazonSeller-mcp-server) | mattcoatsworth (OSS) | SP-API | Catalog, inventory, orders, reports | Operations, no ranking |
| [amazon_sp_mcp](https://github.com/jay-trivedi/amazon_sp_mcp) | jay-trivedi (OSS) | SP-API | Sales, inventory, returns, listings | Operations, no ranking |
| [Fewsats amazon-mcp](https://github.com/Fewsats/amazon-mcp) | Fewsats (OSS) | Shopping | Search & buy with L402 payments | Consumer-side |
| [rigwild mcp-server-amazon](https://github.com/rigwild/mcp-server-amazon) | Community (OSS) | Shopping | Product search, cart, order history | Consumer-side |
| [Apify Amazon scrapers](https://apify.com/junglee/amazon-crawler/api/mcp) | Apify | Scraping | ASIN, price, ratings, reviews extraction | Data scraping only |
| [Zapier Amazon SC MCP](https://zapier.com/mcp/amazon-seller-central) | Zapier | Automation | Seller Central actions via 30K+ Zapier actions | Generic automation |
| [SP-API MCP on Pipedream](https://mcp.pipedream.com/app/amazon_selling_partner) | Pipedream | SP-API | Selling Partner API via hosted MCP | Operations only |
| [CData Amazon Marketplace](https://cdn.cdata.com/help/ONK/mcp/pg_SellerCentralmodel.htm) | CData | Reporting | Seller Central data model via JDBC drivers | Reporting only |
| [Bright Data eCommerce](https://brightdata.com/ai/mcp-server/ecommerce) | Bright Data | Scraping | Real-time public e-commerce data | Data scraping only |

---

## Traditional Amazon Seller Tools (SaaS)

| Tool | Starting Price | Key Focus | AI Features |
|------|---------------|-----------|-------------|
| [Helium 10](https://www.helium10.com/) | $29/mo | All-in-one (30+ tools), Cerebro, Magnet | AI listing builder, AI images |
| [Jungle Scout](https://www.junglescout.com/) | $29/mo | Product research, Rank Tracker | Catalyst AI, AI review analysis |
| [AMZScout](https://amzscout.net/) | $29/mo | Budget product/keyword research | Chrome extension |
| [SmartScout](https://www.smartscout.com/) | $29/mo | Deep analytics, Traffic Graph | Brand/category revenue estimates |
| [SellerApp](https://www.sellerapp.com/) | Free tier | PPC + analytics | Certified PPC management |
| [Sellerboard](https://sellerboard.com/) | $19/mo | Profit-first analytics | Real-time profit per ASIN |
| [Perpetua](https://perpetua.io/) | $695/mo | Enterprise cross-retailer PPC | Auto bid optimization |
| [Perci AI](https://www.perci.ai/) | Varies | AI listing generation | CoSMo/Rufus-aware |
| [Cosmy AI](https://blog.cosmy.ai/) | Varies | CoSMo/Rufus optimization | Claims Rufus understanding |
| [Viral Launch](https://www.virallaunch.com/) | $69/mo | Launch momentum + market intelligence | Historical trends |
| [SellerSprite](https://www.sellersprite.com/) | Varies | AI keyword analysis | Competitor tracking |
| [MerchantWords](https://www.merchantwords.com/) | Varies | Keyword research | Search volume database |

---

## Distribution Channels for `amazon-ranking-tools`

| Channel | How to Submit | Audience |
|---------|--------------|----------|
| [ClawHub](https://clawhub.ai/) | `clawhub publish ./skills/clawhub --slug amazon-ranking-tools` | OpenClaw users (19K+ skills) |
| [skills.sh](https://skills.sh/) | Push to public GitHub, auto-lists via `npx skills add` | Claude Code, Cursor, Copilot, Codex, 17+ agents |
| [npm](https://www.npmjs.com/) | `npm publish` | Direct MCP users |
| [Glama](https://glama.ai/mcp/servers) | "Add Server" button | MCP ecosystem (19K+ servers) |
| [mcp.so](https://mcp.so/) | Submit button or GitHub issue | MCP ecosystem (18K+ servers) |
| [PulseMCP](https://www.pulsemcp.com/servers) | Web submit form | MCP ecosystem (9K+ servers) |
| [Smithery](https://smithery.ai/) | CLI publish | Hosted MCP option |
| [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | PR to repo | GitHub discovery |
| [Official MCP Registry](https://registry.modelcontextprotocol.io/) | `mcp-publisher` CLI | Canonical MCP registry |
