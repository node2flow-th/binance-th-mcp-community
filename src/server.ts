/**
 * Shared MCP Server — used by both Node.js (index.ts) and CF Worker (worker.ts)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { BinanceClient } from './binance-client.js';
import { TOOLS } from './tools.js';

export interface BinanceMcpConfig {
  apiKey: string;
  secretKey: string;
}

export function handleToolCall(
  toolName: string,
  args: Record<string, unknown>,
  client: BinanceClient
) {
  // Strip _fields param (Smithery quality — not a Binance API param)
  const { _fields, ...params } = args;

  switch (toolName) {
    // ========== General (3) ==========
    case 'bth_server_time':
      return client.getServerTimePublic();
    case 'bth_exchange_info':
      return client.getExchangeInfo();
    case 'bth_symbol_type':
      return client.getSymbolType();

    // ========== Market Data (7) ==========
    case 'bth_order_book':
      return client.getOrderBook(params as { symbol: string; limit?: number });
    case 'bth_recent_trades':
      return client.getRecentTrades(params as { symbol: string; limit?: number });
    case 'bth_aggregate_trades':
      return client.getAggregateTrades(params);
    case 'bth_klines':
      return client.getKlines(params);
    case 'bth_ticker_24hr':
      return client.getTicker24hr(params as { symbol: string });
    case 'bth_ticker_price':
      return client.getTickerPrice(
        Object.keys(params).length ? (params as { symbol?: string }) : undefined
      );
    case 'bth_book_ticker':
      return client.getBookTicker(params as { symbol: string });

    // ========== Account (3) ==========
    case 'bth_account_info':
      return client.getAccountInfo(Object.keys(params).length ? params : undefined);
    case 'bth_trade_list':
      return client.getTradeList(params);
    case 'bth_trade_fee':
      return client.getTradeFee(Object.keys(params).length ? params : undefined);

    // ========== Orders (6) ==========
    case 'bth_query_order':
      return client.queryOrder(params);
    case 'bth_new_order':
      return client.newOrder(params);
    case 'bth_cancel_order':
      return client.cancelOrder(params);
    case 'bth_open_orders':
      return client.getOpenOrders(Object.keys(params).length ? params : undefined);
    case 'bth_all_orders':
      return client.getAllOrders(params);
    case 'bth_cancel_all_orders':
      return client.cancelAllOrders(params);

    // ========== Wallet (4) ==========
    case 'bth_withdraw':
      return client.withdraw(params);
    case 'bth_deposit_address':
      return client.getDepositAddress(params);
    case 'bth_deposit_history':
      return client.getDepositHistory(Object.keys(params).length ? params : undefined);
    case 'bth_withdraw_history':
      return client.getWithdrawHistory(Object.keys(params).length ? params : undefined);

    // ========== SubAccount (1) ==========
    case 'bth_sub_account_transfer':
      return client.subAccountTransfer(params);

    // ========== User Data Stream (3) ==========
    case 'bth_create_listen_key':
      return client.createListenKey();
    case 'bth_keepalive_listen_key':
      return client.keepaliveListenKey(params.listenKey as string);
    case 'bth_close_listen_key':
      return client.closeListenKey(params.listenKey as string);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export function createServer(config?: BinanceMcpConfig) {
  const server = new McpServer({
    name: 'binance-th-mcp',
    version: '1.0.0',
  });

  let client: BinanceClient | null = null;

  // Register all 27 tools with annotations
  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema as any,
        annotations: tool.annotations,
      },
      async (args: Record<string, unknown>) => {
        const apiKey =
          config?.apiKey ||
          (args as Record<string, unknown>).BINANCE_TH_API_KEY as string;
        const secretKey =
          config?.secretKey ||
          (args as Record<string, unknown>).BINANCE_TH_SECRET_KEY as string;

        // Public endpoints don't need API keys
        const publicTools = [
          'bth_server_time', 'bth_exchange_info', 'bth_symbol_type',
          'bth_order_book', 'bth_recent_trades', 'bth_aggregate_trades',
          'bth_klines', 'bth_ticker_24hr', 'bth_ticker_price', 'bth_book_ticker',
        ];

        if (!publicTools.includes(tool.name) && (!apiKey || !secretKey)) {
          return {
            content: [{ type: 'text' as const, text: 'Error: BINANCE_TH_API_KEY and BINANCE_TH_SECRET_KEY are required for this operation. Set them as environment variables or pass via config.' }],
            isError: true,
          };
        }

        if (!client || config?.apiKey !== apiKey) {
          client = new BinanceClient({
            apiKey: apiKey || '',
            secretKey: secretKey || '',
          });
        }

        try {
          const result = await handleToolCall(tool.name, args, client);
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
            isError: false,
          };
        } catch (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          };
        }
      }
    );
  }

  // Register prompts
  server.prompt(
    'market-data-analysis',
    'Guide for fetching and analyzing Binance TH market data',
    async () => {
      return {
        messages: [{
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              'You are a Binance Thailand market data analyst. Help me fetch and analyze crypto market data.',
              '',
              'Available market tools:',
              '1. **Price check** — bth_ticker_price for current price (single or all symbols)',
              '2. **24hr stats** — bth_ticker_24hr for price change, volume, high/low',
              '3. **Candlesticks** — bth_klines for OHLCV data (1m to 1M intervals)',
              '4. **Order book** — bth_order_book for bid/ask depth',
              '5. **Recent trades** — bth_recent_trades for latest executed trades',
              '6. **Book ticker** — bth_book_ticker for best bid/ask',
              '7. **Exchange info** — bth_exchange_info for trading rules and filters',
              '',
              'Tips:',
              '- Symbol format: BTCTHB, ETHUSDT, BNBBTC (uppercase, no separator)',
              '- Kline intervals: 1m, 5m, 15m, 1h, 4h, 1d, 1w',
              '- Market data endpoints are public (no API key needed)',
              '- Use bth_symbol_type to check GLOBAL vs SITE (Thailand-specific) symbols',
            ].join('\n'),
          },
        }],
      };
    },
  );

  server.prompt(
    'trading-and-orders',
    'Guide for placing and managing orders on Binance TH',
    async () => {
      return {
        messages: [{
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              'You are a Binance Thailand trading assistant. Help me manage orders safely.',
              '',
              'WARNING: All trading operations use REAL MONEY. There is no testnet.',
              '',
              'Available trading tools:',
              '1. **Place order** — bth_new_order (LIMIT, MARKET, STOP_LOSS_LIMIT, etc.)',
              '2. **Check order** — bth_query_order by orderId or clientOrderId',
              '3. **Cancel order** — bth_cancel_order (single) or bth_cancel_all_orders (all for symbol)',
              '4. **Open orders** — bth_open_orders to see pending orders',
              '5. **All orders** — bth_all_orders for full history',
              '6. **Account** — bth_account_info for balances and permissions',
              '7. **Trade history** — bth_trade_list for executed trades',
              '8. **Fees** — bth_trade_fee for maker/taker commission rates',
              '',
              'Order types:',
              '- LIMIT: price + quantity + timeInForce (GTC/IOC/FOK)',
              '- MARKET: quantity OR quoteOrderQty',
              '- STOP_LOSS_LIMIT: price + quantity + stopPrice + timeInForce',
              '',
              'Always check bth_account_info for balance before placing orders.',
              'Always verify order with bth_query_order after placement.',
            ].join('\n'),
          },
        }],
      };
    },
  );

  // Register resources
  server.resource(
    'server-info',
    'binance-th://server-info',
    {
      description: 'Connection status and available tools for this Binance TH MCP server',
      mimeType: 'application/json',
    },
    async () => {
      return {
        contents: [{
          uri: 'binance-th://server-info',
          mimeType: 'application/json',
          text: JSON.stringify({
            name: 'binance-th-mcp',
            version: '1.0.0',
            connected: !!config,
            tools_available: TOOLS.length,
            tool_categories: {
              general: 3,
              market_data: 7,
              account: 3,
              orders: 6,
              wallet: 4,
              sub_account: 1,
              user_data_stream: 3,
            },
            base_url: 'https://api.binance.th',
          }, null, 2),
        }],
      };
    },
  );

  // Override tools/list handler to return raw JSON Schema with property descriptions.
  (server as any).server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: TOOLS.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations,
    })),
  }));

  return server;
}
