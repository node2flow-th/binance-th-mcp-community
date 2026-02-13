# Binance TH MCP Server

[![npm version](https://img.shields.io/npm/v/@node2flow/binance-th-mcp.svg)](https://www.npmjs.com/package/@node2flow/binance-th-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP (Model Context Protocol) server for Binance Thailand (Gulf Binance) API. Market data, trading, orders, wallet, and account management through 27 tools.

Works with Claude Desktop, Cursor, VS Code, and any MCP client.

> **WARNING**: This package interacts with a real cryptocurrency exchange. There is **no testnet**. All trading and withdrawal operations use **real money**. Use with caution.

---

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "binance-th": {
      "command": "npx",
      "args": ["-y", "@node2flow/binance-th-mcp"],
      "env": {
        "BINANCE_TH_API_KEY": "your-api-key",
        "BINANCE_TH_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

### Cursor / VS Code

Add to MCP settings:

```json
{
  "mcpServers": {
    "binance-th": {
      "command": "npx",
      "args": ["-y", "@node2flow/binance-th-mcp"],
      "env": {
        "BINANCE_TH_API_KEY": "your-api-key",
        "BINANCE_TH_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

### Market Data Only (No API Key)

Market data tools (10 tools) work without API keys:

```json
{
  "mcpServers": {
    "binance-th": {
      "command": "npx",
      "args": ["-y", "@node2flow/binance-th-mcp"]
    }
  }
}
```

### HTTP Mode (Streamable HTTP)

```bash
BINANCE_TH_API_KEY=xxx BINANCE_TH_SECRET_KEY=xxx npx @node2flow/binance-th-mcp --http
```

Server starts on port 3000 (configurable via `PORT` env var). MCP endpoint: `http://localhost:3000/mcp`

---

## Configuration

| Environment Variable | Required | Description |
|---|---|---|
| `BINANCE_TH_API_KEY` | For trading | API key from Binance TH |
| `BINANCE_TH_SECRET_KEY` | For trading | Secret key for HMAC signing |
| `PORT` | No | Port for HTTP server (default: `3000`, only with `--http`) |

---

## All Tools (27 tools)

### General (3 tools)

| Tool | Description |
|---|---|
| `bth_server_time` | Get server time (for timestamp sync) |
| `bth_exchange_info` | Get trading rules, symbols, and filters |
| `bth_symbol_type` | Check GLOBAL vs SITE (Thailand) symbols |

### Market Data (7 tools) — No API key needed

| Tool | Description |
|---|---|
| `bth_order_book` | Get order book (bids/asks) depth |
| `bth_recent_trades` | Get recent trades for a symbol |
| `bth_aggregate_trades` | Get compressed aggregate trades |
| `bth_klines` | Get candlestick/OHLCV data |
| `bth_ticker_24hr` | Get 24-hour price statistics |
| `bth_ticker_price` | Get latest price (single or all) |
| `bth_book_ticker` | Get best bid/ask price |

### Account (3 tools)

| Tool | Description |
|---|---|
| `bth_account_info` | Get balances and account permissions |
| `bth_trade_list` | Get trade history for a symbol |
| `bth_trade_fee` | Get maker/taker fee rates |

### Orders (6 tools)

| Tool | Description |
|---|---|
| `bth_new_order` | Place a new order (LIMIT, MARKET, etc.) |
| `bth_query_order` | Query order status by ID |
| `bth_cancel_order` | Cancel a specific order |
| `bth_open_orders` | Get all open/pending orders |
| `bth_all_orders` | Get full order history |
| `bth_cancel_all_orders` | Cancel all open orders for a symbol |

### Wallet (4 tools)

| Tool | Description |
|---|---|
| `bth_withdraw` | Withdraw crypto (IRREVERSIBLE) |
| `bth_deposit_address` | Get deposit address for a coin |
| `bth_deposit_history` | Get deposit history |
| `bth_withdraw_history` | Get withdrawal history |

### SubAccount (1 tool)

| Tool | Description |
|---|---|
| `bth_sub_account_transfer` | Transfer assets between sub-accounts |

### User Data Stream (3 tools)

| Tool | Description |
|---|---|
| `bth_create_listen_key` | Create WebSocket listen key |
| `bth_keepalive_listen_key` | Extend listen key (every 60 min) |
| `bth_close_listen_key` | Close/invalidate listen key |

---

## Requirements

- **Node.js** 18+
- **Binance TH account** with API keys (for trading operations)

### How to Get API Keys

1. Go to [binance.th](https://www.binance.th) and log in
2. Navigate to **API Management** in account settings
3. Create a new API key
4. Copy both the **API Key** and **Secret Key**
5. Restrict permissions as needed (read-only for market data, enable trading for orders)

### Security Best Practices

- **Never share** API keys or secret keys
- **Use IP whitelist** in API key settings
- **Restrict permissions** to only what you need
- **Read-only keys** for market data monitoring
- **Store secrets in environment variables**, never in code
- **Rotate keys regularly**

---

## Risk Warning

- **No testnet** — All operations execute on the real exchange
- **Real money** — Orders and withdrawals use actual funds
- **Withdrawals are irreversible** — Double-check addresses and amounts
- **Rate limits** — 1200 weight per minute, violations result in 2-minute to 3-day bans
- **Market risk** — Cryptocurrency prices are highly volatile

---

## For Developers

```bash
git clone https://github.com/node2flow-th/binance-th-mcp-community.git
cd binance-th-mcp-community
npm install
npm run build

# Run in stdio mode (market data only)
npm start

# Run with full access
BINANCE_TH_API_KEY=xxx BINANCE_TH_SECRET_KEY=xxx npm start

# Run in HTTP mode
BINANCE_TH_API_KEY=xxx BINANCE_TH_SECRET_KEY=xxx npm start -- --http
```

---

## License

MIT License - see [LICENSE](LICENSE)

Copyright (c) 2026 [Node2Flow](https://node2flow.net)

## Links

- [npm Package](https://www.npmjs.com/package/@node2flow/binance-th-mcp)
- [Binance TH API Docs](https://www.binance.th/api-docs/en/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Node2Flow](https://node2flow.net)
