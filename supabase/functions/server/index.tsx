import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-User-Id"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Middleware to extract user ID
app.use("*", async (c, next) => {
  const userId = c.req.header("X-User-Id");
  c.set("userId", userId || "default");
  await next();
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint - auto-confirms email since SMTP is not configured
app.post("/auth/signup", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Create Supabase Admin client to bypass email confirmation
    const { createClient } = await import("jsr:@supabase/supabase-js@2.49.8");
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        db: {
          schema: 'public',
          pool: {
            mode: 'pooler'
          }
        }
      }
    );

    // Create user with auto-confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since SMTP is not configured
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log(`User created successfully: ${email}`);
    return c.json({ user: data.user });
  } catch (error: any) {
    console.error('Signup endpoint error:', error);
    return c.json({ error: error.message || 'Failed to create user' }, 500);
  }
});

// Helper function to decode GBK/GB2312 encoded text
async function fetchAndDecode(url: string, headers: Record<string, string>) {
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  // Try to decode as GBK first (common for Chinese finance APIs)
  try {
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('gbk');
    return decoder.decode(buffer);
  } catch {
    // Fallback to UTF-8 if GBK fails
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  }
}

// Get stock data endpoint
// Uses Tencent Finance API for real-time Chinese stock data
app.get("/stock/:code", async (c) => {
  try {
    const code = c.req.param("code");
    
    if (!code) {
      return c.json({ error: "Stock code is required" }, 400);
    }

    console.log(`Fetching stock data for code: ${code}`);

    // Determine market prefix based on stock code
    let marketCode = '';
    
    if (code.startsWith('6')) {
      // Shanghai Stock Exchange
      marketCode = `sh${code}`;
    } else if (code.startsWith('0') || code.startsWith('3')) {
      // Shenzhen Stock Exchange
      marketCode = `sz${code}`;
    } else if (code.startsWith('5') || code.startsWith('1')) {
      // ETFs - could be either SH or SZ, try SH first
      marketCode = `sh${code}`;
    } else {
      console.error(`Invalid stock code format: ${code}`);
      return c.json({ error: "Invalid stock code format" }, 400);
    }

    console.log(`Market code determined: ${marketCode}`);

    // Try Tencent Finance API first
    const tencentUrl = `https://qt.gtimg.cn/q=${marketCode}`;
    console.log(`Fetching from Tencent API: ${tencentUrl}`);
    
    let text: string;
    try {
      text = await fetchAndDecode(tencentUrl, {
        'Referer': 'https://gu.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
    } catch (error) {
      console.error(`Tencent API failed: ${error}`);
      return c.json({ error: `API request failed: ${error.message}` }, 500);
    }

    console.log(`Tencent API response: ${text.substring(0, 200)}`);

    // Parse Tencent response
    // Format: v_sh600519="1~贵州茅台~600519~1670.00~1649.99~..."
    const match = text.match(/="([^"]*)"/);
    
    if (!match || !match[1]) {
      console.error(`Failed to parse Tencent response, trying Sina API fallback`);
      
      // Fallback to Sina Finance API
      const sinaUrl = `https://hq.sinajs.cn/list=${marketCode}`;
      console.log(`Fetching from Sina API: ${sinaUrl}`);
      
      try {
        text = await fetchAndDecode(sinaUrl, {
          'Referer': 'https://finance.sina.com.cn/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
      } catch (error) {
        console.error(`Sina API failed: ${error}`);
        return c.json({ error: "Stock not found or invalid code" }, 404);
      }
      
      console.log(`Sina API response: ${text.substring(0, 200)}`);
      
      const sinaMatch = text.match(/="([^"]*)"/);
      
      if (!sinaMatch || !sinaMatch[1]) {
        console.error('Stock not found in both APIs');
        return c.json({ error: "Stock not found or invalid code" }, 404);
      }
      
      const sinaData = sinaMatch[1].split(',');
      
      if (sinaData.length < 4 || !sinaData[0]) {
        console.error('Invalid Sina data received');
        return c.json({ error: "Invalid stock data received" }, 500);
      }
      
      const name = sinaData[0];
      const currentPrice = parseFloat(sinaData[3]);
      const yesterdayClose = parseFloat(sinaData[2]);
      const change = currentPrice - yesterdayClose;
      const changePercent = yesterdayClose > 0 ? (change / yesterdayClose) * 100 : 0;
      
      console.log(`Successfully parsed Sina data: ${name}, ${currentPrice}`);
      
      return c.json({
        code: code,
        name: name,
        price: currentPrice,
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        yesterdayClose: yesterdayClose,
      });
    }

    const data = match[1].split('~');
    
    if (data.length < 5 || !data[1]) {
      console.error('Invalid Tencent data format');
      return c.json({ error: "Invalid stock data received" }, 500);
    }

    const name = data[1];
    const currentPrice = parseFloat(data[3]);
    const yesterdayClose = parseFloat(data[4]);
    const change = currentPrice - yesterdayClose;
    const changePercent = yesterdayClose > 0 ? (change / yesterdayClose) * 100 : 0;

    console.log(`Successfully parsed Tencent data: ${name}, ${currentPrice}`);

    return c.json({
      code: code,
      name: name,
      price: currentPrice,
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      yesterdayClose: yesterdayClose,
    });

  } catch (error) {
    console.error(`Error fetching stock data for ${c.req.param("code")}: ${error}`);
    return c.json({ error: "Failed to fetch stock data", details: error.message }, 500);
  }
});

// Get Hong Kong stock data endpoint
app.get("/hk-stock/:code", async (c) => {
  try {
    const code = c.req.param("code");
    
    if (!code) {
      return c.json({ error: "Stock code is required" }, 400);
    }

    console.log(`Fetching HK stock data for code: ${code}`);

    // Format HK stock code for API (e.g., 00700 -> hk00700)
    const marketCode = `hk${code}`;
    console.log(`Market code determined: ${marketCode}`);

    // Try Tencent Finance API first
    const tencentUrl = `https://qt.gtimg.cn/q=${marketCode}`;
    console.log(`Fetching from Tencent API: ${tencentUrl}`);
    
    let text: string;
    try {
      text = await fetchAndDecode(tencentUrl, {
        'Referer': 'https://gu.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
    } catch (error) {
      console.error(`Tencent API failed: ${error}`);
      return c.json({ error: `API request failed: ${error.message}` }, 500);
    }

    console.log(`Tencent API response: ${text.substring(0, 200)}`);

    // Parse Tencent response
    const match = text.match(/="([^"]*)"/);
    
    if (!match || !match[1]) {
      console.error(`Failed to parse Tencent response, trying Sina API fallback`);
      
      // Fallback to Sina Finance API
      const sinaUrl = `https://hq.sinajs.cn/list=${marketCode}`;
      console.log(`Fetching from Sina API: ${sinaUrl}`);
      
      try {
        text = await fetchAndDecode(sinaUrl, {
          'Referer': 'https://finance.sina.com.cn/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
      } catch (error) {
        console.error(`Sina API failed: ${error}`);
        return c.json({ error: "Stock not found or invalid code" }, 404);
      }
      
      console.log(`Sina API response: ${text.substring(0, 200)}`);
      
      const sinaMatch = text.match(/="([^"]*)"/);
      
      if (!sinaMatch || !sinaMatch[1]) {
        console.error('Stock not found in both APIs');
        return c.json({ error: "Stock not found or invalid code" }, 404);
      }
      
      const sinaData = sinaMatch[1].split(',');
      
      if (sinaData.length < 7) {
        console.error('Invalid Sina data received');
        return c.json({ error: "Invalid stock data received" }, 500);
      }
      
      const name = sinaData[1];
      const currentPrice = parseFloat(sinaData[6]);
      const yesterdayClose = parseFloat(sinaData[3]);
      const change = currentPrice - yesterdayClose;
      const changePercent = yesterdayClose > 0 ? (change / yesterdayClose) * 100 : 0;
      
      console.log(`Successfully parsed Sina HK data: ${name}, ${currentPrice}`);
      
      return c.json({
        code: code,
        name: name,
        price: currentPrice,
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        yesterdayClose: yesterdayClose,
      });
    }

    const data = match[1].split('~');
    
    if (data.length < 5 || !data[1]) {
      console.error('Invalid Tencent HK data format');
      return c.json({ error: "Invalid stock data received" }, 500);
    }

    const name = data[1];
    const currentPrice = parseFloat(data[3]);
    const yesterdayClose = parseFloat(data[4]);
    const change = currentPrice - yesterdayClose;
    const changePercent = yesterdayClose > 0 ? (change / yesterdayClose) * 100 : 0;

    console.log(`Successfully parsed Tencent HK data: ${name}, ${currentPrice}`);

    return c.json({
      code: code,
      name: name,
      price: currentPrice,
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      yesterdayClose: yesterdayClose,
    });

  } catch (error) {
    console.error(`Error fetching HK stock data for ${c.req.param("code")}: ${error}`);
    return c.json({ error: "Failed to fetch stock data", details: error.message }, 500);
  }
});

// Watchlist endpoints

// Get watchlist
app.get("/watchlist", async (c) => {
  try {
    const userId = c.get("userId");
    const watchlist = await kv.getByPrefix(`${userId}:watchlist:`);
    // Always return an array, even if empty
    return c.json({ watchlist: Array.isArray(watchlist) ? watchlist : [] });
  } catch (error) {
    console.error(`Error fetching watchlist: ${error}`);
    // Return empty array on error instead of 500
    return c.json({ watchlist: [] });
  }
});

// Add to watchlist
app.post("/watchlist", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    const { stockCode, stockName } = body;
    
    if (!stockCode || !stockName) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    const watchlistId = `${userId}:watchlist:${stockCode}`;
    const item = {
      id: watchlistId,
      stockCode,
      stockName,
      addedAt: new Date().toISOString()
    };
    
    await kv.set(watchlistId, item);
    console.log(`Added to watchlist: ${watchlistId}`);
    
    return c.json({ item });
  } catch (error) {
    console.error(`Error adding to watchlist: ${error}`);
    return c.json({ error: "Failed to add to watchlist", details: error.message }, 500);
  }
});

// Remove from watchlist
app.delete("/watchlist/:code", async (c) => {
  try {
    const userId = c.get("userId");
    const code = c.req.param("code");
    const watchlistId = `${userId}:watchlist:${code}`;
    await kv.del(watchlistId);
    console.log(`Removed from watchlist: ${watchlistId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error removing from watchlist: ${error}`);
    return c.json({ error: "Failed to remove from watchlist", details: error.message }, 500);
  }
});

// Transaction endpoints

// Get all transactions for a user
app.get("/transactions", async (c) => {
  try {
    const userId = c.get("userId");
    const transactions = await kv.getByPrefix(`${userId}:transaction:`);
    // Always return an array, even if empty
    return c.json({ transactions: Array.isArray(transactions) ? transactions : [] });
  } catch (error) {
    console.error(`Error fetching transactions: ${error}`);
    // Return empty array on error instead of 500
    return c.json({ transactions: [] });
  }
});

// Add a new transaction
app.post("/transactions", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    const { stockCode, stockName, type, price, quantity, date, fees, total } = body;
    
    if (!stockCode || !stockName || !type || !price || !quantity || !date) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    const transactionId = `${userId}:transaction:${Date.now()}_${stockCode}`;
    
    // Use provided total if available, otherwise calculate it
    const finalTotal = total !== undefined 
      ? Number(total)
      : (type === 'buy' 
          ? Number(price) * Number(quantity) + Number(fees || 0)
          : Number(price) * Number(quantity) - Number(fees || 0));
    
    const transaction = {
      id: transactionId,
      stockCode,
      stockName,
      type, // 'buy' or 'sell'
      price: Number(price),
      quantity: Number(quantity),
      date,
      fees: Number(fees || 0),
      total: finalTotal,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(transactionId, transaction);
    console.log(`Transaction added: ${transactionId}`);
    
    return c.json({ transaction });
  } catch (error) {
    console.error(`Error adding transaction: ${error}`);
    return c.json({ error: "Failed to add transaction", details: error.message }, 500);
  }
});

// Update a transaction
app.put("/transactions/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");
    
    // Verify the transaction belongs to this user
    if (!id.startsWith(`${userId}:`)) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    
    const body = await c.req.json();
    const { stockCode, stockName, type, price, quantity, date, fees, total } = body;
    
    if (!stockCode || !stockName || !type || !price || !quantity || !date) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Use provided total if available, otherwise calculate it
    const finalTotal = total !== undefined 
      ? Number(total)
      : (type === 'buy' 
          ? Number(price) * Number(quantity) + Number(fees || 0)
          : Number(price) * Number(quantity) - Number(fees || 0));
    
    const transaction = {
      id,
      stockCode,
      stockName,
      type,
      price: Number(price),
      quantity: Number(quantity),
      date,
      fees: Number(fees || 0),
      total: finalTotal,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(id, transaction);
    console.log(`Transaction updated: ${id}`);
    
    return c.json({ transaction });
  } catch (error) {
    console.error(`Error updating transaction: ${error}`);
    return c.json({ error: "Failed to update transaction", details: error.message }, 500);
  }
});

// Delete a transaction
app.delete("/transactions/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");
    
    // Verify the transaction belongs to this user
    if (!id.startsWith(`${userId}:`)) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    
    await kv.del(id);
    console.log(`Transaction deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error deleting transaction: ${error}`);
    return c.json({ error: "Failed to delete transaction", details: error.message }, 500);
  }
});

// Get portfolio summary
app.get("/portfolio", async (c) => {
  try {
    const userId = c.get("userId");
    const transactions = await kv.getByPrefix(`${userId}:transaction:`);
    
    // Calculate holdings from transactions
    const holdings = new Map();
    
    // Handle case where transactions might be null or not an array
    const txArray = Array.isArray(transactions) ? transactions : [];
    
    for (const transaction of txArray) {
      const { stockCode, stockName, type, price, quantity } = transaction;
      
      if (!holdings.has(stockCode)) {
        holdings.set(stockCode, {
          stockCode,
          stockName,
          totalQuantity: 0,
          totalCost: 0,
          transactions: []
        });
      }
      
      const holding = holdings.get(stockCode);
      holding.transactions.push(transaction);
      
      if (type === 'buy') {
        holding.totalQuantity += quantity;
        holding.totalCost += price * quantity;
      } else if (type === 'sell') {
        holding.totalQuantity -= quantity;
        holding.totalCost -= price * quantity;
      }
    }
    
    // Calculate average cost for each holding
    const portfolioHoldings = Array.from(holdings.values())
      .filter(h => h.totalQuantity > 0)
      .map(h => ({
        ...h,
        averageCost: h.totalCost / h.totalQuantity
      }));
    
    return c.json({ holdings: portfolioHoldings });
  } catch (error) {
    console.error(`Error fetching portfolio: ${error}`);
    // Return empty holdings on error
    return c.json({ holdings: [] });
  }
});

Deno.serve(app.fetch);
