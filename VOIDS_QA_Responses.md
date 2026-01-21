# VOIDS Interview - Q&A Preparation
## Anticipated Questions & Your Prepared Responses

---

## OPENING / BACKGROUND QUESTIONS

### Q1: "Walk me through your background and why you're interested in VOIDS."

**Your Answer:**
"I'm a full-stack AI engineer with about 6 years of experience across enterprise systems, research, and startups. I started at Capgemini building production features for SAP finance systems—end-to-end full-stack work with UI, business logic, and SQL databases. That gave me a strong foundation in reliability and data integrity for business-critical systems.

From there, I pivoted to AI/ML, doing research at Harvard Medical School building real-time computer vision systems, and more recently working on production AI systems at Sony and Kontext.dev—semantic retrieval, vector search, and optimization work.

What excites me about VOIDS is the intersection of those two experiences: you're building a B2B SaaS platform that uses AI to solve a real business problem—inventory inefficiencies. The technical challenge of presenting complex forecasting data through clean, actionable UI is exactly what I love solving. I built a contract analysis system that does something similar: complex multi-step backend processing presented through a real-time streaming interface. VOIDS feels like the perfect next step—applying my full-stack and AI experience to a product that's already proven with 50+ customers and scaling fast."

---

### Q2: "Why are you leaving your current role / why the job search?"

**Your Answer:**
"My recent roles have been internships and freelance work—intentionally so, to explore different problem spaces and build a strong foundation in AI systems. At Sony, I worked on semantic retrieval and neural reconstruction in a research-heavy environment. At Kontext, I built production vector search systems. Both were fantastic learning experiences.

Now I'm looking for a full-time role where I can take long-term ownership of a product and see the impact of my work compounding over time. VOIDS fits perfectly—you're at an inflection point with 300% growth, expanding the team, and doubling ARR. I want to be part of that journey, owning features from customer feedback through to production deployment. The fast-paced, high-ownership culture you describe is exactly what I'm looking for."

---

## TECHNICAL EXPERIENCE QUESTIONS

### Q3: "Tell me about a time you optimized performance in a system. What was the problem and how did you solve it?"

**Your Answer:**
"At Kontext.dev, I was working on a vector search system over Turbopuffer. The initial implementation was doing full collection scans on every query—searching through 10,000+ document embeddings every time. Latency was around 800ms, which is too slow for a real-time SDK that other services depend on.

I optimized it by implementing metadata-normalized schemas and query-time filtering. Instead of scanning all 10k documents, I pre-filtered by metadata first—things like document_type, user_id, and date ranges—which reduced the search space to about 1,000 relevant documents. Then I did the vector similarity search on that smaller set.

The result was a 50% latency reduction—down to about 400ms. The key insight was that not all documents are equally relevant for every query, so filtering early in the pipeline saves computation. I also added proper indexing on the metadata fields in the database, which made the pre-filtering step very fast.

This same principle would apply at VOIDS—for example, when a user loads their dashboard, you don't need to compute forecasts for all 1,000 SKUs upfront. You could pre-filter by risk level or product category, compute only what's needed, and lazy-load details on-demand."

---

### Q4: "How do you approach building a new feature from scratch?"

**Your Answer:**
"I start by deeply understanding the user problem—not just what they're asking for, but why they need it. Then I break it down into the smallest possible version that delivers value, and iterate from there.

For example, when I built my Contract Clause Analyzer, I started with: 'Users need to know if their contract deviates from company playbook.' The simplest version was:
1. Extract clauses from the contract (regex-based)
2. Compare to playbook (exact match first, then semantic)
3. Show results in a list

I built that in a week, got feedback, and then added more sophistication—RAG retrieval for better context, LLM validation for complex cases, real-time streaming so users see progress, and eventually usage tracking and cost estimation.

The key is shipping something quickly to validate the direction, then layering on polish. I don't over-engineer upfront—I build what's needed now, with an architecture that can grow later. That's the pragmatic, customer-focused approach you describe in the job posting."

---

### Q5: "Describe your experience with TypeScript and Next.js. How comfortable are you with the stack?"

**Your Answer:**
"I've worked with TypeScript in my Contract Analyzer project—used React 18 with TypeScript for the frontend, with Vite as the build tool. I'm comfortable with type-safe component props, discriminated unions for different states, and using TypeScript to catch errors at compile time rather than runtime.

For Next.js specifically, I've used it in smaller projects and understand the full-stack paradigm—App Router vs. Pages Router, Server Components vs. Client Components, and how API routes work. I know Next.js 15 uses the App Router by default, which is great for co-locating data fetching with UI.

I'll be transparent—I haven't shipped a large production Next.js app, but I have the fundamentals. My Python work with FastAPI is very similar: type-safe APIs with Pydantic, async/await patterns, and clear separation of concerns. The patterns translate directly. I'm confident I can ramp up quickly—I've switched between stacks before (SAP UI5, React, Python) and have consistently delivered production features within weeks of starting."

**Follow-up if pressed:**
"If there's a specific Next.js pattern or feature you're curious about, I'm happy to discuss. For example, I understand how Server Components improve performance by moving data fetching to the server, reducing client-side JavaScript. For a dashboard with lots of data, that's a huge win."

---

### Q6: "What's your experience with PostgreSQL and ORMs?"

**Your Answer:**
"I've used PostgreSQL extensively in my Contract Analyzer. I set up PostgreSQL 15 in Docker, used SQLAlchemy ORM for async operations, and designed a schema for storing analysis results and playbook versions. I also built an auto-detection system that uses PostgreSQL in production and SQLite in local dev—same codebase, different deployment targets.

I understand indexing strategies—B-tree indexes for range queries, composite indexes for multi-column lookups. For example, in a forecasting system, you'd want indexes on (customer_id, sku_id, date) for fast time-series queries.

I haven't used Drizzle ORM specifically, but I've used SQLAlchemy (Python) and understand ORM patterns: schema definitions, migrations, query builders, and relations. ORMs share core concepts across languages. If you're migrating from NestJS with TypeORM to Next.js with Drizzle, I'd be able to contribute quickly—the database fundamentals are the same."

---

### Q7: "How do you handle data-heavy UIs? Our customers need to see thousands of SKUs with forecasts, but it needs to load fast."

**Your Answer:**
"There are a few key strategies I'd use:

**1. Progressive Loading:**
Don't load all 1,000 SKUs upfront. Load the top 50 'at-risk' products first—those are what the user cares about most. Then paginate or use infinite scroll for the rest.

**2. Server-Side Aggregation:**
Pre-compute aggregate metrics like 'X products at risk of stockout' or 'Total cash tied up in inventory' in the database (maybe with a materialized view), so the API returns them instantly. Don't compute in the browser.

**3. Lazy Loading for Details:**
Show a list view with high-level info (SKU, risk level, current stock). When the user clicks for details, fetch the full forecast chart with 90 days of predictions. Use React Suspense or skeleton loaders so the UI feels fast.

**4. Virtualization:**
If you must show a long list (e.g., 1,000 rows), use a virtualization library like react-window. It only renders the rows currently visible, so you get smooth scrolling even with huge datasets.

**5. Caching:**
Cache frequently accessed data—either in the database (Redis), or at the API level. If a user reloads their dashboard within 5 minutes, serve cached data instead of recomputing forecasts.

I applied similar principles in my Contract Analyzer. The backend does complex multi-step processing, but the user just sees a progress bar and then results streaming in. The UI stays responsive because I don't block on the full computation—I stream partial results via Server-Sent Events."

---

### Q8: "Tell me about a time you had to debug a complex issue across multiple layers of a system."

**Your Answer:**
"At Capgemini, I dealt with a ledger mismatch issue: an invoice showed $10,000, but the general ledger account showed $9,950. Finance teams were confused because the numbers didn't reconcile.

I traced the data end-to-end:
1. **Frontend (SAP UI):** Verified the user entered $10,000—no input error.
2. **Business Logic (ABAP):** Added breakpoints in the billing transaction code. Found that a discount condition was being applied during pricing calculation—so the net amount was $9,950.
3. **Database (SQL):** Queried the billing tables (VBRK, VBRP) and pricing conditions table (KONV). Confirmed the discount line item existed in the database.
4. **Root Cause:** The UI wasn't displaying the discount breakdown—it only showed the gross amount. The database was correct, but the display logic was incomplete.
5. **Fix:** Updated the UI to show all pricing elements, including discounts, so users could see why the final amount was $9,950.

This taught me that in complex systems, bugs can exist at any layer. You have to trace the data flow systematically: input → processing → storage → display. It's similar in forecasting systems—if a prediction looks wrong, it could be bad input data, a model issue, a database query bug, or a display error. You need to check each layer."

---

## PRODUCT / DOMAIN QUESTIONS

### Q9: "What do you know about demand forecasting and inventory management?"

**Your Answer:**
"I'll be honest—I haven't built a forecasting system before, but I've researched VOIDS' problem space. From what I understand:

**Demand Forecasting** is predicting how many units of each product will sell in a future period (daily, weekly, monthly). It's typically time-series prediction based on historical sales data, with adjustments for seasonality, trends, and external factors like promotions or holidays.

**Inventory Management** is using those forecasts to decide: when to reorder, how much to order, and how much safety stock to keep. The goal is to avoid two bad outcomes:
- **Stockouts** (inventory hits zero, lost sales)
- **Overstocking** (too much capital tied up in inventory, storage costs, obsolescence risk)

VOIDS automates this: instead of manual spreadsheets, you provide accurate product-level forecasts and proactive recommendations like 'Reorder SKU X by next Tuesday to avoid stockout.'

While I haven't built this specific system, I have worked with time-series data in my research—at Sony with temporally-aware retrieval, and at Harvard with real-time tracking in surgical videos. The core challenge is similar: process temporal data streams, make predictions, and present actionable insights. I'm confident I can learn the domain quickly—I've jumped into new problem spaces before (computer vision, vector search) and delivered production systems."

---

### Q10: "Why do you think our customers care about forecast accuracy?"

**Your Answer:**
"Because bad forecasts are expensive. If you under-forecast demand, you stock out—lost sales, disappointed customers, and potential churn. If you over-forecast, you tie up cash in inventory that sits in a warehouse, plus you pay storage costs and risk obsolescence.

For SME e-commerce brands, cash flow is tight. They can't afford to over-buy inventory, but they also can't afford to lose sales from stockouts. VOIDS gives them confidence: 'Here's what you'll sell in the next 30 days with 85% confidence, so order exactly what you need.'

It's similar to my Contract Analyzer in a way: users need to trust the system's recommendations. In contracts, that means citing which playbook section supports each finding (grounding). In forecasting, it might mean showing historical accuracy ('Our model was 88% accurate last month') or confidence intervals ('We predict 100-150 units, 90% confidence').

Trust is built through accuracy, transparency, and showing your work."

---

## BEHAVIORAL / CULTURE FIT QUESTIONS

### Q11: "VOIDS is fast-paced—we ship daily. How do you handle working in an environment with lots of ambiguity and rapid iteration?"

**Your Answer:**
"I thrive in that environment. My most productive work has been in high-ambiguity settings where I had to figure things out:

- At Sony, I designed a semantic retrieval service from scratch with minimal guidance. I researched approaches, prototyped solutions, got feedback from my advisor, and iterated.
- At Kontext, I was brought in to 'improve retrieval latency.' I had to dig into the codebase, identify bottlenecks, propose solutions, and implement them—all in a 2-month contract.
- My personal projects (Contract Analyzer, Voice Agent) had no requirements doc—just an idea and a goal. I made decisions myself: tech stack, architecture, features to build. Then I shipped and iterated based on what I learned.

I don't need hand-holding. Give me a customer problem, some context on the codebase, and I'll figure out the rest. I'll ask questions when needed, but I default to action. Ship something, get feedback, improve. That's how I work best."

---

### Q12: "Describe a time you disagreed with a technical decision. How did you handle it?"

**Your Answer:**
"At Capgemini, there was a situation where my team wanted to implement a new feature by duplicating existing business logic code rather than refactoring it into a shared function. Their argument was 'It's faster—just copy-paste and modify.'

I disagreed because I knew it would create maintenance debt. If we found a bug in the logic, we'd have to fix it in multiple places. I raised the concern in our planning meeting, explained the trade-off: 'Yes, refactoring takes 2 extra days now, but it saves us weeks of debugging later when this logic inevitably changes.'

The tech lead agreed, and we spent the extra time creating a shared module. Six months later, we had to update the logic for a regulatory change—it took 1 day instead of what would have been a week of chasing down all the copy-pasted instances.

The lesson: I'll advocate for the right technical decision, but I do it respectfully and with data. If I'm overruled, I commit and move forward. But I won't stay silent if I see a clear issue."

---

### Q13: "What motivates you as an engineer?"

**Your Answer:**
"Two things:

**1. Ownership and Impact:**
I love owning something end-to-end and seeing it used. When I deployed my Contract Analyzer to AWS and saw people actually using it—uploading contracts, getting analysis results—that was incredibly rewarding. It's why I'm drawn to VOIDS: I want to build features that customers use daily and that directly impact their business (preventing stockouts, optimizing cash flow).

**2. Technical Excellence:**
I care deeply about building systems that are reliable, performant, and maintainable. When I optimized latency by 50% at Kontext, or when I hit sub-400ms barge-in times in my Voice Agent, that felt great—not because of the numbers, but because I knew it made the product better for users. I don't cut corners.

VOIDS seems like a place where both matter: you ship fast, but you also care about quality. That's my ideal environment."

---

### Q14: "How do you stay up to date with new technologies?"

**Your Answer:**
"I learn by building. When I want to understand a new technology, I don't just read docs—I build something with it.

For example:
- Wanted to learn WebSockets → built a full-duplex voice assistant with real-time streaming
- Wanted to understand RAG better → built a contract analyzer with ChromaDB vector store
- Wanted to learn SSE → implemented streaming in both the Voice Agent and Contract Analyzer

I also follow the Anthropic blog, read Hacker News, and listen to technical podcasts (Changelog, Software Engineering Daily). But reading only gets you so far—you need to build to really understand.

At VOIDS, I'd continue this: if we're using a new pattern in Next.js or a new feature in Drizzle, I'd build a small prototype to understand it fully before applying it to production code."

---

## SCENARIO / PROBLEM-SOLVING QUESTIONS

### Q15: "Design a system for notifying users when a product is predicted to stock out."

**Your Answer:**
"Here's how I'd approach it:

**1. Detection (Backend):**
When the nightly forecasting job runs, it computes demand predictions for the next 30 days. For each product, check:
- Will inventory hit zero before the next reorder arrives?
- Is inventory already below safety stock threshold?

If yes, insert a notification into the database:
```sql
INSERT INTO notifications (customer_id, product_id, severity, message, created_at)
VALUES ($1, $2, 'high', 'SKU X will stock out in 7 days', NOW());
```

**2. Delivery (API + Frontend):**
- **API Endpoint:** `GET /api/notifications?customer_id=X&is_read=false`
- **Frontend:** Poll this endpoint every 30 seconds, or use Server-Sent Events for real-time push
- **UI:** Show a notification badge in the header (e.g., '3 alerts'), dropdown with list of alerts

**3. Actions:**
Each notification includes a recommended action: 'Reorder 200 units by Feb 1st.' User can click 'Mark as Read' or 'Take Action' (maybe integrates with their inventory system).

**4. Escalation:**
For critical alerts (stockout in <3 days), send an email or SMS via a service like SendGrid or Twilio. Track delivery status in the database.

**5. Metrics:**
Track: notification delivery rate, time-to-read, action taken rate. Surface these in an admin dashboard so VOIDS can monitor system effectiveness."

---

### Q16: "How would you optimize a slow database query in production?"

**Your Answer:**
"Here's my systematic approach:

**1. Identify the Slow Query:**
Use PostgreSQL's `pg_stat_statements` extension to find queries with high total execution time or high call count.

**2. Analyze the Query Plan:**
Run `EXPLAIN ANALYZE` on the slow query to see:
- Is it doing a sequential scan (bad) or index scan (good)?
- Are there expensive joins or sorts?
- What's the estimated vs. actual row count?

**3. Add Indexes:**
If it's a sequential scan, add an index on the columns in the WHERE clause:
```sql
CREATE INDEX idx_forecasts_customer_product ON forecasts(customer_id, product_id);
```

**4. Optimize the Query:**
- Reduce columns selected (don't SELECT * if you only need 3 columns)
- Push filtering down (filter early, join late)
- Use EXISTS instead of IN for subqueries (more efficient)

**5. Consider Caching:**
If the query runs frequently with the same params, cache the result in Redis with a TTL (e.g., 5 minutes).

**6. Use Materialized Views:**
For expensive aggregations (e.g., 'top 10 at-risk products'), pre-compute in a materialized view and refresh nightly.

**7. Monitor Post-Fix:**
After deploying the fix, monitor query performance. Did latency drop? Are users seeing faster load times?

I'd document the before/after performance so the team understands the impact."

---

### Q17: "If a customer reports that a forecast is wrong, how would you investigate?"

**Your Answer:**
"I'd trace the data flow from end to end:

**1. Verify the Report:**
- What's the forecasted demand vs. actual sales?
- Is the error a one-time issue or consistent?
- Which product, customer, and time period?

**2. Check Input Data:**
Query the database: `SELECT * FROM demand_history WHERE product_id = X AND date >= '2024-01-01'`
- Is the historical sales data correct?
- Are there missing dates (data gaps)?
- Are there outliers (e.g., one day with 10,000 sales that skews the forecast)?

**3. Check Model Execution:**
- Did the forecasting job run successfully?
- Are there logs showing any errors or warnings?
- Did the model retrain recently (could have regressed)?

**4. Check Business Logic:**
- Is there special handling for this product (e.g., new product with limited history)?
- Are seasonality adjustments applied correctly?
- Is there a promotion or external factor the model doesn't account for?

**5. Check Display Layer:**
- Query the forecast directly: `SELECT * FROM forecasts WHERE product_id = X`
- Is the data in the database correct, but displayed wrong in the UI?

**6. Root Cause and Fix:**
Once I identify the layer where the issue occurred, I'd fix it and add a regression test to prevent recurrence.

**7. Communicate:**
Update the customer: 'We identified the issue (bad input data on Jan 15), fixed it, and reran the forecast. Here's the corrected prediction.' Transparency builds trust."

---

## QUESTIONS ABOUT WORKING WITH CUSTOMERS

### Q18: "The job description mentions engaging directly with customers. How comfortable are you with that?"

**Your Answer:**
"Very comfortable. I think engineers should talk to customers—it's the best way to understand what to build and why.

At Capgemini, I occasionally joined client calls when we were debugging production issues or discussing new features. I had to translate technical details into business terms: 'The ledger mismatch is caused by a discount condition in the pricing procedure' becomes 'The system is correctly applying a 5% early payment discount, but it wasn't showing in the summary screen.'

For VOIDS, I'd love to join customer feedback sessions or support calls. If a customer says 'The forecast feels off for seasonal products,' I want to hear that directly so I can investigate: Is it a data issue? Model limitation? Or are we just not explaining confidence intervals clearly?

I'm also comfortable with async customer interaction—Slack channels, email threads, etc. I've worked remotely in multiple roles and know how to communicate clearly in writing."

---

### Q19: "How would you explain a technical concept (like confidence intervals in forecasts) to a non-technical customer?"

**Your Answer:**
"I'd use an analogy and focus on the outcome, not the math.

**Bad explanation (too technical):**
'Our model uses a 90% confidence interval, which means the true value falls within the range 90% of the time based on the standard error of the prediction.'

**Good explanation (customer-friendly):**
'Think of it like a weather forecast: instead of saying it'll rain exactly 0.5 inches, the forecast says 0.3 to 0.7 inches. That range gives you a more realistic picture—plan for somewhere in that range, not a single number.

Similarly, instead of saying you'll sell exactly 120 units, we say 100-140 units. That range accounts for uncertainty—maybe there's a slow week or a sudden spike. You can use the midpoint (120) for planning, but know it could be 15-20% higher or lower.'

**Follow-up:** 'If you want to be safe, order for the high end (140 units). If you're optimizing cash flow, order for the midpoint (120) and keep some safety stock.'

The key is: translate to their context (business outcomes), not the technical mechanism."

---

## QUESTIONS ABOUT VOIDS SPECIFICALLY

### Q20: "What questions do you have about our product, tech stack, or team?"

**Your Best 5-6 Questions:**

1. **"You're migrating from NestJS to Next.js full-stack. What drove that decision? Is it mainly the unified TypeScript codebase, or are there other benefits you're seeing?"**

2. **"How do you handle the data pipeline from raw e-commerce data (Shopify, WooCommerce, etc.) to your forecasting models? Is there a lot of ETL involved, or do customers push data to you via API?"**

3. **"For forecasting dashboards, do you pre-compute forecasts in batch jobs (e.g., nightly), or do you run them on-demand when users load the dashboard? I'm curious about the trade-off between freshness and performance."**

4. **"What's the most complex feature request you've received from a customer? Something where the UI/UX was particularly challenging because of the underlying data complexity?"**

5. **"You've achieved 300% growth over the past year. What are the scaling challenges you're anticipating in the next 6-12 months? Is it more on the technical side (infrastructure, database performance) or the product side (new features, integrations)?"**

6. **"What does 'success' look like for this role beyond the first 3 months? What would make you think, 'This hire was a home run'?"**

---

## CLOSING QUESTIONS

### Q21: "Do you have any concerns about my background or fit for this role?"

**Your Answer:**
"I'd love to hear if you have any concerns about my background or fit for the role. If there's anything we haven't covered that you'd like to dig into—whether it's my TypeScript experience, my domain knowledge in forecasting, or anything else—I'm happy to address it now."

**Why ask this:**
- Shows confidence
- Gives you a chance to address concerns in real-time
- Demonstrates proactive communication

---

### Q22: "What are your salary expectations?"

**Your Answer (if asked):**
"I'm looking for a competitive salary for a senior full-stack role in Hamburg or remote Germany. From my research, that's typically in the €60-80k range depending on experience and equity. But I'm flexible—I care more about the role, the team, and the growth opportunity. What's the budget for this position?"

**Why this works:**
- Shows you've done research
- Gives a range, not a single number
- Emphasizes fit over money
- Asks them to share their range (turn it around)

---

### Q23: "When can you start?"

**Your Answer:**
"I'm available to start within 2-4 weeks. I'd need a bit of time to wrap up my current commitments and relocate if needed, but I'm eager to get started. If you have a specific timeline in mind, I can work with that."

---

## YOUR FINAL QUESTION TO ASK

### Q24: "What are the next steps in the process?"

**Your Answer:**
"Thanks so much for the conversation, Tobi. I'm really excited about VOIDS and the opportunity to contribute. What are the next steps in the process? Is there a technical assessment, or would there be another round with the team?"

---

## POWER PHRASES TO USE

Throughout the interview, sprinkle in these phrases to reinforce your fit:

- "I love owning features end-to-end—from understanding the customer problem to deploying to production."
- "I've built systems that do something similar—complex backend logic presented through clean, intuitive UI."
- "I'm comfortable with ambiguity—I don't need a detailed spec, just a problem to solve."
- "I care deeply about performance and reliability—users notice when things are fast and just work."
- "I ship fast, but I don't cut corners. I know when to optimize for speed vs. long-term maintainability."
- "I've demonstrated I can ramp up quickly in new domains—computer vision at Harvard, vector search at Kontext, enterprise systems at Capgemini."

---

## MINDSET GOING IN

**Remember:**
- Tobi said they're "genuinely impressed" by your background
- This is a conversation, not an interrogation
- You're evaluating them as much as they're evaluating you
- Show curiosity, confidence, and enthusiasm
- Be yourself—they want to know the real you

**You've got this. Go crush it!** 🚀
