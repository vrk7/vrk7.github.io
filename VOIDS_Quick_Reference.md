# VOIDS Interview - Quick Reference Card

## YOUR ELEVATOR PITCH (30 seconds)
"I'm a full-stack AI engineer who specializes in building production systems that handle complex data with clean, intuitive UX. I've shipped systems to AWS, optimized latency by 50%, and built data-heavy interfaces—from contract analysis to real-time voice systems. I own features end-to-end: from understanding user needs, to backend architecture, to frontend deployment. VOIDS' challenge of presenting complex forecasting data through digestible UI is exactly what I love solving."

---

## TOP 3 PROJECTS TO REFERENCE

### 1. Contract Clause Analyzer (http://35.178.58.160/)
**Tag:** "Data-heavy UI for complex backend"
**Key Points:**
- Multi-step pipeline (extraction → RAG → scoring → LLM) → Simple streaming UI
- PostgreSQL + ChromaDB, FastAPI + React 18, SSE real-time updates
- Production AWS deployment with Docker Compose
- **VOIDS Parallel:** "Like forecasting dashboards: complex backend logic → actionable UI"

### 2. Voice Agent
**Tag:** "Real-time performance optimization"
**Key Points:**
- Sub-400ms barge-in, <900ms TTFB (p95)
- Metrics tracking: TTFB histograms, latency percentiles
- Load harness: 20 concurrent calls, automated testing
- **VOIDS Parallel:** "Dashboard performance and observability for B2B SaaS"

### 3. Kontext.dev
**Tag:** "Production B2B SaaS work"
**Key Points:**
- 50% latency reduction through vector indexing optimization
- API-layer orchestration, CI-driven testing, Docker/AWS deployment
- **VOIDS Parallel:** "Recent SaaS experience with performance focus"

---

## TECH STACK BRIDGE (VOIDS ↔ YOU)

| VOIDS Uses | You Have | Talking Point |
|-----------|----------|---------------|
| TypeScript | TypeScript, Node.js, Next.js, React | "Used in Contract Analyzer frontend, comfortable with type-safe APIs" |
| Next.js 15 | Next.js (listed), React 18 | "Understand full-stack Next.js paradigm, built React 18 with Vite" |
| PostgreSQL | PostgreSQL 15 (production) | "Contract Analyzer: async SQLAlchemy, production deployment" |
| Drizzle ORM | SQLAlchemy (Python ORM) | "ORMs share core concepts—schema, migrations, queries. Quick ramp-up" |
| TailwindCSS | CSS, responsive design | "Used in projects, understand utility-first CSS" |
| Python pipelines | Extensive Python/PyTorch | "Sony, Kontext, MGH—data processing, ML pipelines" |

---

## YOUR 5 SUPERPOWERS FOR VOIDS

1. **End-to-End Ownership:** Built complete products from scratch (Contract Analyzer, Voice Agent)
2. **Performance Optimization:** 50% latency reduction, sub-400ms barge-in, load testing
3. **Production Experience:** AWS EC2, Docker, PostgreSQL, comprehensive testing
4. **Data-Heavy UX:** Contract analysis, metrics dashboards, real-time streaming
5. **AI Background:** Unique edge for AI-based forecasting platform—understand ML models & limitations

---

## TOP 10 QUESTIONS FOR TOBI (Pick 5-6)

### Technical
1. "You're migrating NestJS → Next.js. What drove that decision?"
2. "How do you handle ETL from raw e-commerce data (Shopify/WooCommerce) to forecasts?"
3. "Pre-compute forecasts in batch jobs, or on-demand when users load dashboard?"
4. "Testing approach? How balance speed with reliability?"

### Product
5. "Example of a prediction that saved a customer from stockout/cash flow issue?"
6. "Most complex feature request where UI/UX was challenging due to data complexity?"
7. "How do engineers gather customer feedback? Direct interaction?"

### Team
8. "Engineering team size? Biggest bottlenecks this hire would solve?"
9. "With 300% growth, what scaling challenges in next 6-12 months?"
10. "Beyond first 3 months, what makes this hire 'a home run'?"

---

## HANDLING OBJECTIONS

### "Not enough TypeScript production experience"
✅ "Fair—recent work is Python-heavy. But I've used TypeScript (React 18 + Vite), and my Pydantic experience translates directly to TypeScript's type system. Type safety patterns are language-agnostic. At Capgemini, I adapted across SAP UI (JS), ABAP, SQL—I ramp up quickly."

### "No eCommerce or B2B SaaS experience"
✅ "True—no eCommerce specifically. But Capgemini was 3 years building enterprise finance systems (daily usage, high-volume). Core challenge is the same: reliable systems with complex logic → clean UI. Contract Analyzer is essentially B2B SaaS: professional tool with usage tracking, rate limiting, AWS production deployment."

### "Strong AI background—is this too ML-focused?"
✅ "Actually a differentiator. VOIDS is AI-based forecasting—you're building interfaces for AI systems. I understand ML models, their limits, how to present probabilistic predictions user-friendly. Plus, I've built end-to-end products (not just models). Full-stack engineer who understands AI—ideal for VOIDS."

---

## KEY STATS TO DROP

- **Capgemini:** 3 years full-stack (2019-2022), daily usage by finance teams
- **Kontext:** 50% latency reduction
- **Voice Agent:** <400ms barge-in, <900ms TTFB (p95), 20 concurrent call testing
- **Contract Analyzer:** 7 clause types, PostgreSQL + ChromaDB, AWS EC2 production, comprehensive pytest suite
- **Sony:** Temporally-aware semantic retrieval, SLURM distributed systems
- **MGH:** 81-89% IoU segmentation, Visual Question Localization

---

## WHITEBOARD PREP

### If asked: "Design a dashboard showing forecasts for 1,000 SKUs"

**API:**
```
GET /api/forecasts?customer_id=X&status=at_risk&limit=50&offset=0
Response: {
  products: [{sku, name, current_stock, forecast_7d, risk_level, recommended_action}],
  total_count
}
```

**Database Query:**
```sql
SELECT p.sku, p.name, i.current_stock, f.forecast_7d, f.risk_level
FROM products p
JOIN inventory i ON p.id = i.product_id
JOIN forecasts f ON p.id = f.product_id
WHERE p.customer_id = ? AND f.risk_level IN ('high', 'medium')
ORDER BY f.risk_level DESC
LIMIT 50 OFFSET 0;
```

**Frontend:**
- Pagination (50 per page)
- Color-coded risk (red/yellow/green)
- Click to expand: lazy-load detailed chart
- Filters: risk level, category, forecast range

**Optimization (if asked):**
- Indexes on (customer_id, sku_id, date)
- Materialized views for "products at risk" aggregates
- Redis caching for frequently accessed forecasts
- Table partitioning by date range

---

## DOMAIN KNOWLEDGE (FORECASTING 101)

**Key Concepts:**
- **Demand Forecasting:** Time series prediction (daily/weekly demand per SKU)
- **Safety Stock:** Buffer inventory to prevent stockouts
- **Reorder Point:** Inventory level that triggers new order
- **Lead Time:** Time from order to delivery
- **Stockout:** When inventory reaches zero (lost sales)
- **Overstocking:** Too much inventory (cash tied up, storage costs)

**Your Angle:**
"Haven't built forecasting systems, but worked with time-series data at Sony (temporal semantic retrieval) and MGH (real-time surgical tracking). Core challenge is similar: process temporal streams, make predictions, present actionable insights through clean UI."

---

## CLOSING STATEMENT

"I'm genuinely excited about VOIDS. You're solving a real problem for SMEs—inventory inefficiencies can make or break small brands. From a technical perspective, I love the challenge of data-heavy interfaces that stay intuitive—it's exactly what I did in my projects. I'm confident I can contribute from day one, and I'm excited to learn from you and Jannik. Let's make this happen."

---

## MINDSET REMINDERS

✅ **Be confident but humble** - You've shipped products to production
✅ **Show curiosity** - Ask great questions (you prepared 10!)
✅ **Be specific** - Use project examples, not generic answers
✅ **Demonstrate ownership** - "I built this myself, here's the demo"
✅ **Show excitement** - You genuinely like this problem space

**Tobi said:** "We're already genuinely impressed by your background."
**You belong in this conversation. Go crush it!** 🚀
