# VOIDS Interview - Technical Deep Dive

## Architecture & Code Examples for Discussion

---

## 1. CONTRACT CLAUSE ANALYZER - ARCHITECTURE

### System Overview
```
┌─────────────────┐
│   React 18 UI   │  (Vite, TypeScript)
└────────┬────────┘
         │ HTTP + SSE
┌────────▼────────┐
│  FastAPI Backend│  (Python, async/await)
└────┬───────┬────┘
     │       │
     │       └──────► ChromaDB (Vector Store)
     │                 └─ Playbook embeddings
     │                 └─ all-MiniLM-L6-v2
     │
     ├──────────────► PostgreSQL 15
     │                 └─ Analysis results
     │                 └─ Playbook versions
     │
     └──────────────► Claude API (Sonnet 4)
                       └─ LLM validation (optional)
```

### Key Architectural Decisions

**1. SSE for Real-Time Streaming**
```python
# Custom EventBus for async communication
class EventBus:
    def __init__(self):
        self.queue = asyncio.Queue()

    async def emit(self, event: dict):
        await self.queue.put(event)

    async def listen(self):
        while True:
            event = await self.queue.get()
            yield event

# SSE endpoint
@app.get("/api/stream")
async def stream_analysis(request: Request):
    event_bus = EventBus()

    # Start analysis in background
    asyncio.create_task(run_analysis(event_bus))

    # Stream events to client
    async def event_stream():
        async for event in event_bus.listen():
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

**Why SSE over WebSocket?**
- Simpler for one-way server→client updates
- Works with HTTP/2, no need for separate WebSocket protocol
- Automatic reconnection in EventSource API
- **Relevance to VOIDS:** Dashboard updates (forecast refreshes, alert notifications) fit SSE perfectly

---

**2. PostgreSQL + SQLite Auto-Detection**
```python
# Environment-based database selection
import os
from sqlalchemy.ext.asyncio import create_async_engine

def get_database_url():
    """Auto-detect database: PostgreSQL in prod, SQLite in dev"""
    if os.getenv("DATABASE_URL"):
        # Production: PostgreSQL
        url = os.getenv("DATABASE_URL")
        # Handle asyncpg driver
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url
    else:
        # Development: SQLite with async support
        return "sqlite+aiosqlite:///./local.db"

engine = create_async_engine(get_database_url(), echo=False)
```

**Why This Matters for VOIDS:**
- Easy local development (no need for Docker PostgreSQL)
- Production-ready PostgreSQL for real customers
- Same codebase, different deployment targets

---

**3. RAG with Grounding Enforcement**
```python
async def retrieve_context(clause_text: str, clause_type: str):
    """Retrieve relevant playbook sections via ChromaDB"""
    # Query vector store
    results = chroma_collection.query(
        query_texts=[clause_text],
        where={"clause_type": clause_type},
        n_results=3
    )

    # Return with metadata for grounding
    return [
        {
            "content": doc,
            "metadata": meta,
            "chunk_id": chunk_id
        }
        for doc, meta, chunk_id in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["ids"][0]
        )
    ]

async def validate_with_llm(clause: str, context: list):
    """LLM validation with citation requirement"""
    prompt = f"""
    Analyze this clause against the playbook context.
    CRITICAL: You MUST cite which chunk ID supports each finding.
    If no chunk supports a finding, do NOT include it.

    Clause: {clause}
    Context: {context}
    """

    response = await claude_api.messages.create(...)

    # Parse response and validate citations
    findings = parse_findings(response)
    grounded_findings = [
        f for f in findings
        if f.get("citation") in [c["chunk_id"] for c in context]
    ]

    return grounded_findings
```

**Why Grounding Matters for VOIDS:**
- Forecasting systems must show "why" (which historical data, trends)
- Users need to trust predictions → citations build trust
- Similar pattern: "Demand forecast: 150 units (based on last 8 weeks' trend, holiday spike in 2024)"

---

## 2. VOICE AGENT - REAL-TIME PERFORMANCE

### Latency Optimization Strategy

**1. Barge-In Detection (<400ms target)**
```python
class BargeInController:
    def __init__(self):
        self.current_tts_task = None
        self.playback_start_time = None

    async def handle_user_speech_detected(self):
        """Cancel TTS immediately when user speaks"""
        if self.current_tts_task and not self.current_tts_task.done():
            stop_start = time.time()
            self.current_tts_task.cancel()
            stop_latency = (time.time() - stop_start) * 1000  # ms

            # Log metrics
            logger.info(f"Barge-in stop latency: {stop_latency:.1f}ms")

            # Send metrics to client
            await websocket.send_json({
                "type": "barge_in",
                "stop_latency_ms": stop_latency
            })
```

**2. Latency-Masking Fillers**
```python
async def handle_llm_inference(user_query: str, websocket):
    """Stream fillers while waiting for LLM"""
    inference_start = time.time()

    # Start LLM call (non-blocking)
    llm_task = asyncio.create_task(llm_api.complete(user_query))

    # Stream fillers if LLM takes >200ms
    filler_task = asyncio.create_task(
        stream_fillers_with_delay(websocket, threshold_ms=200)
    )

    # Wait for LLM
    response = await llm_task
    filler_task.cancel()

    inference_time = (time.time() - inference_start) * 1000
    logger.info(f"LLM inference: {inference_time:.1f}ms")

    return response

async def stream_fillers_with_delay(websocket, threshold_ms=200):
    """Stream Malayalam fillers to mask latency"""
    await asyncio.sleep(threshold_ms / 1000)

    fillers = ["Mm...", "Aa...", "Sheri..."]
    for filler in fillers[:2]:  # Max 2 fillers
        # Send filler audio
        await websocket.send_json({
            "type": "filler_start",
            "text": filler
        })
        await asyncio.sleep(0.3)  # 300ms between fillers
```

**VOIDS Relevance:**
- Dashboard load times: Show skeleton UI immediately, stream data as it loads
- Forecast calculations: Show "Calculating..." with progress, don't block UI
- Real-time updates: Push notifications when new risks detected

---

**3. Load Testing Harness**
```python
async def concurrent_load_test(num_connections=20):
    """Simulate concurrent WebSocket connections"""
    scenarios = [
        ("barge_in", test_barge_in_scenario),
        ("payment", test_payment_confirmation),
        ("sales", test_sales_pitch),
        ("unclear", test_unclear_audio),
        ("filler", test_filler_timing)
    ]

    # Run all scenarios concurrently
    tasks = []
    for i in range(num_connections):
        scenario_name, scenario_fn = scenarios[i % len(scenarios)]
        tasks.append(scenario_fn(session_id=f"test_{i}"))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Aggregate metrics
    ttfb_values = [r["ttfb_ms"] for r in results if "ttfb_ms" in r]
    barge_in_values = [r["barge_in_ms"] for r in results if "barge_in_ms" in r]

    print(f"TTFB p50: {np.percentile(ttfb_values, 50):.1f}ms")
    print(f"TTFB p95: {np.percentile(ttfb_values, 95):.1f}ms")
    print(f"Barge-in median: {np.median(barge_in_values):.1f}ms")
```

**VOIDS Relevance:**
- Need to test dashboard performance with 50+ concurrent users
- Validate API response times under load
- Ensure forecasting queries don't slow down with multiple customers

---

## 3. KONTEXT.DEV - VECTOR SEARCH OPTIMIZATION

### 50% Latency Reduction - How?

**Before: Naive Vector Search**
```python
# Problem: Full collection scan every query
async def search_documents(query: str):
    # Embed query
    query_embedding = await embed_text(query)

    # Search entire collection (slow!)
    results = await vector_store.query(
        vector=query_embedding,
        top_k=10
    )
    return results
```
**Latency: ~800ms for 10k documents**

---

**After: Metadata Filtering + Indexing**
```python
# Solution: Pre-filter with metadata, then vector search
async def search_documents_optimized(query: str, filters: dict):
    query_embedding = await embed_text(query)

    # Pre-filter by metadata (indexed)
    # e.g., document_type, created_date, user_id
    results = await vector_store.query(
        vector=query_embedding,
        filter={
            "document_type": filters.get("type"),
            "user_id": filters.get("user_id")
        },
        top_k=10
    )
    return results
```
**Latency: ~400ms for same 10k documents (50% reduction)**

**Why It Worked:**
1. **Metadata indexing:** Filter to 1k relevant docs before vector search
2. **Smaller search space:** Faster similarity computation
3. **Schema normalization:** Consistent metadata structure → better indexing

**VOIDS Relevance:**
- Forecasting queries often filtered by customer_id, product_category, date_range
- Pre-filtering before expensive computations (similar pattern)
- Indexing strategy critical for multi-tenant SaaS

---

## 4. CAPGEMINI - ENTERPRISE DEBUGGING

### End-to-End Data Tracing Example

**Problem:**
Finance team reports ledger mismatch: "Invoice shows $10,000, but GL account shows $9,950."

**Debugging Process:**
```
1. Frontend (SAP UI):
   - Check user input: Did they enter $10,000?
   - Inspect UI state: Any JavaScript errors?

2. ABAP Business Logic:
   - Add breakpoints in billing transaction (VF01)
   - Trace function modules: BAPI_BILLINGDOC_CREATE
   - Check pricing procedure: Is discount applied?

3. Database (SQL):
   - Query VBRK (billing header) and VBRP (billing items)
   - SELECT * FROM VBRP WHERE VBELN = 'INV12345';
   - Check if discount line item exists in KONV table

4. Root Cause:
   - Discount condition applied at pricing step
   - UI didn't display discount (display logic bug)
   - Fix: Update UI to show all pricing elements
```

**VOIDS Relevance:**
- Complex systems have multi-layer bugs (UI, business logic, database)
- Need to trace data flow end-to-end
- Forecasting systems similar: input data → model → predictions → UI
- If forecast wrong: bad input data? model issue? display bug?

---

## 5. DATABASE DESIGN FOR VOIDS (HYPOTHETICAL)

### Schema for Inventory Forecasting System

```sql
-- Core tables
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inventory_snapshots (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    snapshot_date DATE NOT NULL,
    current_stock INT NOT NULL,
    reserved_stock INT DEFAULT 0,
    available_stock INT GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    UNIQUE(product_id, snapshot_date)
);

CREATE TABLE demand_history (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    date DATE NOT NULL,
    units_sold INT NOT NULL,
    UNIQUE(product_id, date)
);

CREATE TABLE forecasts (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    forecast_date DATE NOT NULL,  -- When forecast was generated
    target_date DATE NOT NULL,     -- Date being forecasted
    predicted_demand INT NOT NULL,
    confidence_lower INT,
    confidence_upper INT,
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
    recommended_action TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, forecast_date, target_date)
);

-- Indexes for performance
CREATE INDEX idx_products_customer ON products(customer_id);
CREATE INDEX idx_inventory_product_date ON inventory_snapshots(product_id, snapshot_date);
CREATE INDEX idx_demand_product_date ON demand_history(product_id, date);
CREATE INDEX idx_forecasts_product_risk ON forecasts(product_id, risk_level, target_date);
CREATE INDEX idx_forecasts_customer_risk ON forecasts(product_id, risk_level)
    INCLUDE (predicted_demand, recommended_action);

-- Materialized view for dashboard (pre-aggregated)
CREATE MATERIALIZED VIEW high_risk_products AS
SELECT
    p.customer_id,
    p.sku,
    p.name,
    p.category,
    i.available_stock,
    f.predicted_demand,
    f.target_date,
    f.risk_level,
    f.recommended_action
FROM products p
JOIN inventory_snapshots i ON p.id = i.product_id
JOIN forecasts f ON p.id = f.product_id
WHERE f.risk_level IN ('high', 'medium')
  AND f.target_date >= CURRENT_DATE
  AND f.target_date <= CURRENT_DATE + INTERVAL '30 days'
  AND i.snapshot_date = (
      SELECT MAX(snapshot_date)
      FROM inventory_snapshots
      WHERE product_id = p.id
  );

-- Refresh materialized view (run after forecasting job)
REFRESH MATERIALIZED VIEW CONCURRENTLY high_risk_products;
```

### Query Examples for Dashboard

**1. Get At-Risk Products for Customer**
```sql
SELECT * FROM high_risk_products
WHERE customer_id = $1
ORDER BY risk_level DESC, target_date ASC
LIMIT 50 OFFSET $2;
```
**Performance:** ~10ms with indexes (vs ~500ms without materialized view)

---

**2. Product Detail: Forecast Trend**
```sql
SELECT
    target_date,
    predicted_demand,
    confidence_lower,
    confidence_upper
FROM forecasts
WHERE product_id = $1
  AND forecast_date = (SELECT MAX(forecast_date) FROM forecasts WHERE product_id = $1)
  AND target_date >= CURRENT_DATE
  AND target_date <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY target_date ASC;
```
**Use Case:** Chart showing next 90 days' demand forecast with confidence bands

---

**3. Historical Accuracy Tracking**
```sql
SELECT
    f.target_date,
    f.predicted_demand,
    d.units_sold AS actual_demand,
    ABS(f.predicted_demand - d.units_sold) AS error,
    CASE
        WHEN d.units_sold = 0 THEN NULL
        ELSE ABS(f.predicted_demand - d.units_sold) * 100.0 / d.units_sold
    END AS error_percentage
FROM forecasts f
JOIN demand_history d ON f.product_id = d.product_id AND f.target_date = d.date
WHERE f.product_id = $1
  AND f.target_date < CURRENT_DATE
ORDER BY f.target_date DESC
LIMIT 30;
```
**Use Case:** Show forecast accuracy over time to build user trust

---

## 6. TYPESCRIPT + NEXT.JS PATTERNS FOR VOIDS

### Type-Safe API with Next.js App Router

```typescript
// app/api/forecasts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema (like Pydantic in Python)
const ForecastQuerySchema = z.object({
  customer_id: z.string().uuid(),
  risk_level: z.enum(['low', 'medium', 'high']).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Validate query params
  const result = ForecastQuerySchema.safeParse({
    customer_id: searchParams.get('customer_id'),
    risk_level: searchParams.get('risk_level'),
    limit: searchParams.get('limit'),
    offset: searchParams.get('offset'),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues },
      { status: 400 }
    );
  }

  const { customer_id, risk_level, limit, offset } = result.data;

  // Query database (using Drizzle ORM)
  const forecasts = await db
    .select()
    .from(forecastsTable)
    .where(eq(forecastsTable.customerId, customer_id))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ forecasts });
}
```

**Key Points:**
- Zod for runtime validation (equivalent to Pydantic)
- Type-safe database queries with Drizzle
- Next.js App Router for co-located API + UI

---

### React Server Components for Data-Heavy UI

```typescript
// app/dashboard/page.tsx (Server Component)
import { ForecastList } from '@/components/ForecastList';
import { db } from '@/lib/db';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { customer_id: string };
}) {
  // Fetch data on server (no loading state needed)
  const forecasts = await db
    .select()
    .from(highRiskProductsView)
    .where(eq(highRiskProductsView.customerId, searchParams.customer_id));

  return (
    <div>
      <h1>Inventory Forecast Dashboard</h1>
      <ForecastList forecasts={forecasts} />
    </div>
  );
}

// components/ForecastList.tsx (Client Component for interactivity)
'use client';

import { useState } from 'react';

export function ForecastList({ forecasts }) {
  const [filter, setFilter] = useState('all');

  const filtered = forecasts.filter(f =>
    filter === 'all' || f.risk_level === filter
  );

  return (
    <div>
      <FilterButtons filter={filter} setFilter={setFilter} />
      <div className="grid gap-4">
        {filtered.map(forecast => (
          <ForecastCard key={forecast.id} forecast={forecast} />
        ))}
      </div>
    </div>
  );
}
```

**Benefits:**
- Server Components: Fetch data on server, no client-side loading
- Client Components: Add interactivity where needed
- Progressive Enhancement: Works without JS, enhanced with JS

---

## 7. OBSERVABILITY & METRICS

### What VOIDS Likely Needs

**1. Application Metrics**
```typescript
// Track API latency
import { performance } from 'perf_hooks';

async function apiHandler(req, res) {
  const start = performance.now();

  try {
    const result = await processRequest(req);
    const duration = performance.now() - start;

    // Log metrics (could send to Prometheus, Datadog, etc.)
    logger.info('api_request', {
      endpoint: req.url,
      duration_ms: duration,
      status: 'success',
    });

    return res.json(result);
  } catch (error) {
    const duration = performance.now() - start;

    logger.error('api_request', {
      endpoint: req.url,
      duration_ms: duration,
      status: 'error',
      error: error.message,
    });

    throw error;
  }
}
```

**2. Forecast Accuracy Metrics**
```sql
-- Daily job: Compare predictions vs. actual sales
CREATE TABLE forecast_accuracy_metrics (
    id UUID PRIMARY KEY,
    date DATE NOT NULL,
    total_forecasts INT,
    mae FLOAT,  -- Mean Absolute Error
    mape FLOAT, -- Mean Absolute Percentage Error
    forecasts_within_10_percent INT,
    forecasts_within_20_percent INT
);

-- Calculate daily
INSERT INTO forecast_accuracy_metrics (date, ...)
SELECT
    CURRENT_DATE,
    COUNT(*),
    AVG(ABS(f.predicted_demand - d.units_sold)) AS mae,
    AVG(ABS(f.predicted_demand - d.units_sold) * 100.0 / NULLIF(d.units_sold, 0)) AS mape,
    SUM(CASE WHEN ABS(f.predicted_demand - d.units_sold) * 100.0 / d.units_sold <= 10 THEN 1 ELSE 0 END),
    SUM(CASE WHEN ABS(f.predicted_demand - d.units_sold) * 100.0 / d.units_sold <= 20 THEN 1 ELSE 0 END)
FROM forecasts f
JOIN demand_history d ON f.product_id = d.product_id AND f.target_date = d.date
WHERE f.target_date = CURRENT_DATE - INTERVAL '1 day';
```

**VOIDS Context:**
"As a B2B SaaS, you probably track forecast accuracy as a key product metric. I'd be curious how you surface this to customers—showing 'Our model was 85% accurate last month' builds trust."

---

## 8. POTENTIAL TECHNICAL CHALLENGES AT VOIDS

### Challenge 1: Multi-Tenant Data Isolation

**Problem:**
50+ customers, each with thousands of SKUs. Must ensure customer A never sees customer B's data.

**Solution:**
```typescript
// Row-level security in PostgreSQL
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY customer_isolation ON products
    USING (customer_id = current_setting('app.current_customer_id')::uuid);

// Set customer context in API
await db.execute(
  sql`SET LOCAL app.current_customer_id = ${customer_id}`
);

// All queries automatically filtered
const products = await db.select().from(productsTable);
// Only returns products for current_customer_id
```

---

### Challenge 2: Handling Large Time-Series Data

**Problem:**
100 SKUs × 365 days × 2 years = 73,000 rows per customer. Queries slow.

**Solution:**
```sql
-- Partition by date
CREATE TABLE demand_history (
    id UUID,
    product_id UUID,
    date DATE,
    units_sold INT
) PARTITION BY RANGE (date);

CREATE TABLE demand_history_2024 PARTITION OF demand_history
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE demand_history_2025 PARTITION OF demand_history
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Queries only scan relevant partitions
SELECT * FROM demand_history
WHERE product_id = $1 AND date >= '2024-06-01';
-- Only scans demand_history_2024 and demand_history_2025
```

---

### Challenge 3: Real-Time Dashboard Updates

**Problem:**
Forecasting job runs nightly. How to notify users when new risks detected?

**Solution:**
```typescript
// Option 1: Polling (simple)
// Frontend: Poll /api/notifications every 30s

// Option 2: Server-Sent Events (better)
// app/api/notifications/stream/route.ts
export async function GET(request: NextRequest) {
  const customerId = request.headers.get('x-customer-id');

  const stream = new ReadableStream({
    async start(controller) {
      // Poll database for new notifications
      const interval = setInterval(async () => {
        const newNotifications = await db
          .select()
          .from(notificationsTable)
          .where(eq(notificationsTable.customerId, customerId))
          .where(eq(notificationsTable.isRead, false));

        if (newNotifications.length > 0) {
          controller.enqueue(
            `data: ${JSON.stringify(newNotifications)}\n\n`
          );
        }
      }, 5000);  // Check every 5s

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## 9. YOUR TECHNICAL PHILOSOPHY (FOR DISCUSSION)

### When to Optimize for Speed vs. Maintainability

**Speed (MVP, prototyping):**
- Inline SQL queries (no ORM overhead)
- Co-locate everything in one file
- Use `any` types if needed
- Skip comprehensive tests (manual QA)

**Maintainability (production, long-term):**
- ORM for type-safe queries (Drizzle)
- Modular architecture (separate files, clear boundaries)
- Strict TypeScript, no `any`
- Comprehensive test suite (unit + integration)

**Your Approach:**
"I start with speed for the first iteration—get something working, get user feedback. Once the feature proves valuable, I refactor for maintainability. For example, my Contract Analyzer started as a single Python file. After validating the idea, I split it into 13 modules with clear boundaries, added comprehensive tests, and deployed to AWS. I know when to make each trade-off."

---

## 10. QUESTIONS YOU MIGHT ASK TOBI (TECHNICAL)

1. **"What's your deployment pipeline? Vercel auto-deploys on merge to main, or do you have staging/prod branches?"**

2. **"How do you handle database migrations? Drizzle has a migration system—do you run migrations as part of deployment, or manually?"**

3. **"For forecasting models, do you retrain per customer, or is it one global model? If per-customer, how do you handle model versioning?"**

4. **"What's your monitoring/alerting setup? Do you use Vercel's built-in monitoring, or external tools like Datadog/Sentry?"**

5. **"How do you handle long-running forecasting jobs? Background workers, or just cron jobs on Vercel?"**

---

## FINAL THOUGHT

**You've built production systems. You understand trade-offs. You ship fast without cutting corners.**

**VOIDS needs someone who can:**
- Own features end-to-end ✅ (Contract Analyzer, Voice Agent)
- Optimize performance ✅ (50% latency reduction, <400ms barge-in)
- Build data-heavy UIs ✅ (Contract analysis, metrics dashboards)
- Work in ambiguity ✅ (Sony, Kontext, MGH—all research-heavy roles)

**You're the engineer they're looking for. Go show them.** 🚀
