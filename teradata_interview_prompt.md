# TERADATA AI ENGINEER INTERVIEW - REAL-TIME ASSISTANT PROMPT

## CANDIDATE PROFILE
**Name:** Vysakh Ramakrishnan
**Role:** Interviewing for Senior Artificial Intelligence Engineer at Teradata (Agentic AI Platform)
**Experience:** 5+ years in backend development, AI infrastructure, and production systems

---

## COMPANY & ROLE CONTEXT

**Teradata Focus:** Building autonomous AI agents within Teradata Vantage platform - agents capable of reasoning, planning, acting, and learning in real-world environments.

**Key Responsibilities:**
- Design and scale intelligent software systems for autonomous AI agents
- Implement core Agentic AI components: agent memory, context-aware planning, multi-step tool use, self-reflective behavior loops
- Architect cloud-native backends supporting high-throughput agent pipelines (AWS/Azure/GCP)
- Build integrations with LLMs (GPT-4, Claude, Gemini) using function calling, dynamic prompting, multi-agent orchestration
- Develop scalable APIs connecting agents with tools, vector databases, RAG pipelines, external APIs
- Own technical delivery, lead design reviews, mentor engineers
- Implement testing strategies for both deterministic and probabilistic agent behaviors

**Tech Stack Requirements:**
- Languages: Python (preferred), Go, Java
- Frameworks: LangChain, AutoGen, CrewAI, Semantic Kernel, custom orchestrators
- Vector DBs: Pinecone, Weaviate, FAISS
- Cloud: AWS/Azure/GCP, Docker/Kubernetes, Terraform
- Concepts: RAG, embeddings, semantic search, multi-agent collaboration, task decomposition, autonomous decision-making

---

## MY VALUE PROPOSITION

"I'm a full-stack AI engineer who builds production-grade agentic systems end-to-end. I've shipped real-time AI agents with sub-400ms response latency, built RAG systems with multi-layer hallucination guardrails, and optimized vector search by 50%. What excites me about Teradata is building autonomous agents at scale—I thrive designing systems from scratch where problems don't have existing answers. My projects prove this: designed complete agent architectures handling real-time reasoning, tool orchestration, memory management, and self-correction."

---

## CORE TECHNICAL PROJECTS

### 1. MALAYALAM VOICE AGENT (Autonomous Conversational Agent)
**Demonstrates:** Agentic AI fundamentals - autonomous decision-making, context management, real-time planning, tool orchestration

**What It Is:** Production-ready autonomous voice agent that handles payment reminders and sales calls in Malayalam. The agent autonomously manages conversations, detects interruptions, plans responses, and adapts behavior in real-time.

**Agentic AI Components Implemented:**

**1. Autonomous Decision-Making:**
- Agent autonomously decides when to speak, when to listen, when to interrupt itself
- Real-time reasoning: "User is speaking during my response → cancel my speech → listen instead"
- No hard-coded conversation trees—dynamic response generation via LLM

**2. Agent Memory & Context Management:**
```python
class ConversationSession:
    def __init__(self):
        self.conversation_history = []  # Episodic memory
        self.user_profile = {}          # Semantic memory
        self.current_state = {}         # Working memory
```
- Episodic memory: Full conversation history for context
- Semantic memory: User profile, payment history, preferences
- Working memory: Current conversation state, active intents

**3. Multi-Step Tool Orchestration:**
```
Planning Cycle:
User Input → [Tool: VAD] → Speech Detected
          → [Tool: Translation] → Malayalam → English
          → [Tool: LLM] → Generate Response
          → [Tool: TTS] → Speech Synthesis
          → [Tool: Monitoring] → Log metrics
```
- Agent orchestrates 5+ tools per interaction
- Tools are composable—agent chains them based on context
- Async execution for parallel tool use

**4. Self-Reflective Behavior Loop:**
```python
# Agent monitors its own performance
if barge_in_latency > 400:  # Self-critique
    self.adjust_vad_threshold()  # Self-correction

if user_rephrase_detected:  # Reflection
    self.flag_for_learning()  # Self-improvement
```

**5. Adaptive Planning:**
- **Reminder Mode:** Slower speech (0.97x), lower pitch, firm tone
- **Sales Mode:** Faster speech (1.08x), higher pitch, warm tone
- Agent adapts strategy based on conversation type (context-aware planning)

**Key Metrics:**
- Sub-400ms barge-in response (autonomous interruption handling)
- <900ms TTFB (fast planning and execution)
- 20+ concurrent agent instances (scalable)
- Real-time tool orchestration with streaming

**Architecture Pattern (Agentic Loop):**
```
Perceive (VAD, STT) → Reason (LLM planning) → Act (TTS, response)
         ↑                                            ↓
         └──────────── Memory Update ←───────────────┘
```

---

### 2. CONTRACT CLAUSE ANALYZER (RAG + Multi-Agent Reasoning)
**Demonstrates:** RAG pipelines, vector search, multi-agent verification, hallucination prevention

**Live Demo:** http://35.178.58.160/

**Agentic Architecture:**
```
Analyzer Agent → Extracts clauses → Risk Agent → Scores risk
                                              ↓
              ← Verification Agent ← Grounds findings in sources
```

**Multi-Agent System:**
1. **Analyzer Agent:** Identifies contract clauses, extracts key terms
2. **Risk Scoring Agent:** Evaluates severity using playbook knowledge
3. **Verification Agent:** Validates findings against source text (anti-hallucination)

**RAG Implementation:**
```python
# Vector DB: ChromaDB for semantic search
playbook_embeddings = embed(legal_playbook)  # Knowledge base
contract_chunks = chunk_and_embed(contract)

# Retrieval: Find relevant playbook sections
relevant_standards = vector_search(
    query=extracted_clause,
    collection=playbook_embeddings,
    top_k=5
)

# Augmented Generation: Ground response in retrieved context
finding = llm.generate(
    clause=extracted_clause,
    standards=relevant_standards,
    require_source=True  # Must cite source
)
```

**Hallucination Prevention (Multi-Layer Guardrails):**
```python
# Layer 1: Grounding requirement
if not finding.source_text:
    reject()  # No claim without source

# Layer 2: RAG citation requirement
if not finding.playbook_chunks:
    reject()  # Must be grounded in knowledge base

# Layer 3: Heuristic validation
if payment_days > 90:
    risk_level = "critical"  # Deterministic, not hallucinated

# Layer 4: Confidence thresholding
if finding.confidence < 0.7:
    flag_for_review()
```

**Vector Search Optimization:**
- Metadata filtering: Pre-filter by clause type before vector search
- Reduces search space by 60-70%
- Query-time filtering: `{clause_type: "payment", jurisdiction: "EU"}`

**Tech Stack:** FastAPI, PostgreSQL, ChromaDB, React+TypeScript, Docker, AWS EC2

---

### 3. KONTEXT.DEV (Vector Search Optimization - 50% Latency Reduction)
**Demonstrates:** Production vector database optimization, embedding strategies

**Problem:** Semantic code search over 10M+ code chunks, 800ms p95 latency

**Solution:**
1. **Metadata-Normalized Schema:**
   - Separated metadata (file_path, language, repo) from vector embeddings
   - Indexed metadata in PostgreSQL, vectors in Turbopuffer
   - Query: Filter metadata first → search vectors in reduced set

2. **Query-Time Optimization:**
   ```python
   # Before: Search all 10M vectors
   results = vector_db.search(query_embedding, top_k=50)

   # After: Pre-filter, then search
   filtered_ids = metadata_db.filter(language="python", repo_id=123)
   results = vector_db.search(
       query_embedding,
       top_k=50,
       filter_ids=filtered_ids  # Search space reduced 70%
   )
   ```

3. **Result:** 800ms → 400ms (50% reduction), handled 10x traffic spike

---

## AGENTIC AI EXPERTISE - DEEP DIVE

### Core Agentic AI Principles I've Implemented:

**1. Task Decomposition:**
- Voice Agent: "Handle payment reminder call" → [Detect speech, Translate, Generate response, Synthesize speech, Monitor latency]
- Contract Analyzer: "Analyze contract" → [Extract clauses, Retrieve standards, Score risk, Verify sources, Generate report]

**2. Autonomous Decision-Making:**
- Dynamic planning: Agent chooses tools and sequences at runtime, not pre-programmed
- Self-interruption: Voice Agent cancels its own speech when user speaks
- Adaptive behavior: Changes tone/strategy based on conversation context

**3. Memory Management:**
- **Episodic Memory:** Full conversation history (what happened)
- **Semantic Memory:** Domain knowledge, user profiles (what's true)
- **Working Memory:** Current state, active goals (what's relevant now)
- Implemented in Voice Agent conversation sessions

**4. Multi-Agent Collaboration:**
- Contract Analyzer: Analyzer → Risk Scorer → Verifier (sequential collaboration)
- Could extend to parallel: Multiple analyzers vote, aggregator decides

**5. Self-Reflection & Learning:**
- Performance monitoring: Track barge-in latency, TTFB, user rephrases
- Self-critique: "My latency exceeded threshold" → adjust parameters
- Learning pipeline: Flag failure cases → generate training data → retrain

---

## AGENTIC AI - CONTINUOUS LEARNING APPROACH

**Challenge:** How do autonomous agents improve over time without manual retraining?

### Approach 1: Distribution Shift Detection (Targeted Self-Training)
**Concept:** Agent monitors its own experience distribution, detects novel patterns, self-trains on them.

**Implementation:**
```python
# 1. Monitor embedding space
conversation_embedding = embed(conversation)
nearest_cluster = find_nearest(conversation_embedding, known_clusters)
distance = euclidean(conversation_embedding, nearest_cluster)

# 2. Detect distribution shift
if distance > threshold:
    # New pattern detected - high learning value
    synthetic_examples = generate_around_cluster(conversation_embedding)

    # 3. Self-stress-test
    for example in synthetic_examples:
        response = agent.respond(example)
        if not meets_quality_bar(response):
            training_queue.add(example, expected_response)

    # 4. Surgical retraining
    retrain_module(training_queue)  # Not full model, just failing components
```

**Key Insight (Harvard):** "Learn the extra, not the whole" - surgical updates, not full retraining.

### Approach 2: Self-Critique via Disagreement (High-Value Example Mining)
**Concept:** Agent generates multiple reasoning paths, learns from disagreements.

**Implementation:**
```python
def find_learning_opportunities(conversation):
    # Generate multiple strategies
    responses = [
        agent.respond(conversation, strategy="conservative"),
        agent.respond(conversation, strategy="creative"),
        agent.respond(conversation, strategy="factual"),
    ]

    # Check agreement
    if all_responses_similar(responses):
        return None  # Low learning value - agent is confident

    # High disagreement = learning opportunity
    best = judge_model.evaluate(
        responses,
        criteria=["factual_accuracy", "intent_match", "constraint_compliance"]
    )

    return TrainingExample(
        input=conversation,
        output=best,
        reasoning=best.explanation
    )
```

**Production Pipeline:**
1. Sample N% of production conversations daily
2. Run disagreement detection
3. Judge evaluates disagreements
4. Queue high-impact examples for training batch
5. Nightly/weekly retraining depending on volume
6. Monitor metrics - if regression, rollback

**Quality Filters:**
- Disagreement filters out boring cases
- Judge evaluation adds second quality check
- Confidence thresholding: Only train on high-confidence judgments
- Human spot-checks on samples
- Downstream metric monitoring

---

## MULTI-AGENT ORCHESTRATION PATTERNS

### Pattern 1: Sequential Pipeline (Contract Analyzer)
```
Analyzer → Risk Scorer → Verifier → Report Generator
```
- Each agent has specialized role
- Output of one is input to next
- Simple, predictable, easy to debug

### Pattern 2: Parallel Aggregation (Future: Contract Analysis)
```
      ├→ Analyzer Agent 1 ─┐
Input ├→ Analyzer Agent 2 ─┼→ Aggregator Agent → Final Output
      └→ Analyzer Agent 3 ─┘
```
- Multiple agents process in parallel
- Aggregator votes/merges results
- Faster, more robust (agent failure tolerance)

### Pattern 3: Hierarchical Delegation
```
Manager Agent
    ├→ Research Agent (RAG, web search)
    ├→ Code Agent (writes code)
    └→ Testing Agent (validates output)
```
- Manager decomposes task, delegates subtasks
- Specialist agents execute
- Manager synthesizes results

### Pattern 4: Conversational Multi-Agent (Voice Agent Extension)
```
User → Routing Agent → [Simple Query → Rule Agent]
                     → [Complex Query → RAG Agent → LLM Agent]
                     → [Action Query → Tool Agent (CRM, payment system)]
```
- Router classifies intent
- Specialized agents handle different query types
- Improves latency (simple queries skip LLM) and accuracy

**I've implemented Pattern 1 (Contract Analyzer), Pattern 4 basics (Voice Agent routing), ready to build Pattern 2 & 3 at Teradata.**

---

## PRODUCTION SYSTEM DESIGN EXPERTISE

### Real-Time Agent System (Sub-600ms Latency)

**Architecture (Voice Agent Proven):**
```
Client ←→ WebSocket ←→ FastAPI Server (Async)
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
         VAD              LLM              TTS
    (20ms frames)    (Streaming)      (Streaming)
```

**Latency Optimization Techniques:**
1. **Streaming Everything:** Start speaking before full response generated
2. **Async I/O:** Non-blocking, handle 20+ concurrent agents on single process
3. **Fillers/Acknowledgments:** Mask thinking time ("Mm...", "Let me check...")
4. **Model Selection:** Fast model for simple queries, powerful for complex
5. **Caching:** Common responses/tool results pre-computed
6. **Pre-warming:** Models loaded, no cold starts
7. **Geographic Distribution:** Deploy close to users

**Achieved:** <900ms TTFB with mock models, <400ms barge-in response

### Hallucination Prevention (Contract Analyzer Proven)

**Multi-Layer Guardrails:**
1. **Source Grounding:** Every claim must cite source text
2. **RAG Validation:** Must be grounded in knowledge base
3. **Heuristic-First:** Deterministic rules where possible (no LLM guessing)
4. **Confidence Scoring:** Flag low-confidence outputs for review
5. **Structured Output:** Force JSON schema, validate against expected format
6. **Cross-Verification:** Multiple retrieval strategies, compare results

**For Teradata Agents:**
- Constrain response space via system prompts
- Validate against retrieved facts before responding
- Audit trail: Log reasoning chain for every decision
- Human-in-the-loop for high-stakes decisions

### Scalable Cloud Architecture

**Tech Stack Experience:**
- **Cloud:** AWS EC2 (Contract Analyzer deployed), familiar with Azure, GCP
- **Containers:** Docker (all projects containerized), Kubernetes-ready
- **IaC:** Terraform basics, Ansible for provisioning
- **Monitoring:** Custom metrics (latency, barge-in time, error rates)
- **Databases:** PostgreSQL (Contract Analyzer), ChromaDB (vector store)

**Agent Pipeline Design for High-Throughput:**
```
Load Balancer
    ├→ Agent Instance 1 (20 concurrent sessions)
    ├→ Agent Instance 2 (20 concurrent sessions)
    └→ Agent Instance N (auto-scaling)
          ↓
    Shared Vector DB (Pinecone/Weaviate)
    Shared Memory Store (Redis)
    Shared Audit Log (PostgreSQL)
```

- Stateless agent instances (scale horizontally)
- Shared memory/vector stores (consistent context)
- Auto-scaling based on queue depth
- Circuit breakers for external APIs (LLMs, tools)

---

## TESTING STRATEGIES FOR AGENTIC SYSTEMS

**Challenge:** Agents are probabilistic—same input, different outputs. How test?

### Deterministic Tests (Component Level)
```python
# Test individual tools
def test_vad_detects_speech():
    frame = load_speech_sample()
    assert vad.is_speech(frame) == True

# Test orchestration logic
def test_barge_in_cancels_tts():
    controller = BargeInController()
    controller.start_tts()
    latency = controller.request_cancel()
    assert latency < 400  # Deterministic threshold
```

### Probabilistic Tests (Agent Level)
```python
# Test with multiple runs, statistical validation
def test_agent_responds_to_payment_query():
    responses = [agent.respond("What's my balance?") for _ in range(10)]

    # Check all responses contain balance info
    assert all("balance" in r.lower() for r in responses)

    # Check variability (not memorized response)
    assert len(set(responses)) > 5  # At least 5 unique phrasings
```

### Behavior Tests (End-to-End)
```python
# Test emergent behaviors
def test_agent_handles_interruption():
    session = ConversationSession()
    session.send_audio(user_message_1)

    # Interrupt during agent speech
    session.interrupt()
    session.send_audio(user_message_2)

    response = session.get_response()

    # Agent should respond to message_2, not message_1
    assert addresses_topic(response, user_message_2)
    assert not addresses_topic(response, user_message_1)
```

### Regression Tests (Production Monitoring)
- **Golden Dataset:** Known good conversations, run agent weekly
- **Expected Behaviors:** "Agent should never reveal payment info without auth"
- **Drift Detection:** Track output distribution over time
- **A/B Testing:** New agent version vs. current, compare metrics

**Implemented in Voice Agent:** Automated test harness, 20 concurrent simulated calls, metrics tracking (TTFB, barge-in latency, error rate).

---

## RELEVANT EXPERIENCE HIGHLIGHTS

### Capgemini (2+ years) - Enterprise Production Systems
- Built end-to-end SAP finance integrations, production-grade code
- **Relevant:** Production mindset, reliability, testing, deployment pipelines
- Handled sensitive financial data - security, compliance, audit logging

### Harvard Medical School - Real-Time AI Systems
- Real-time computer vision for surgical applications
- **Relevant:** Low-latency requirements, safety-critical AI, continuous validation
- Research to production pipeline

### Sony & Kontext.dev - Vector Search & Semantic Retrieval
- Semantic search over code, 50% latency reduction
- **Relevant:** Vector databases, embeddings, RAG, production optimization
- 10M+ vectors, high-throughput queries

### Recent Projects - Agentic AI
- Voice Agent: Autonomous conversational agent, real-time tool orchestration
- Contract Analyzer: Multi-agent system, RAG, hallucination prevention
- **Relevant:** Direct experience building what Teradata needs

---

## KEY SKILLS ALIGNMENT WITH TERADATA REQUIREMENTS

| Teradata Requirement | My Experience |
|---------------------|---------------|
| **Agentic AI (reasoning, planning, acting, learning)** | Voice Agent: autonomous decision-making, context planning, tool orchestration, self-reflection |
| **LLM Integration (GPT-4, Claude, function calling)** | Voice Agent: LLM response generation, tool orchestration. Contract Analyzer: structured prompting, JSON outputs |
| **Multi-Agent Orchestration** | Contract Analyzer: multi-agent pipeline (analyzer → risk scorer → verifier) |
| **Vector Databases (Pinecone, Weaviate, FAISS)** | ChromaDB in Contract Analyzer, Turbopuffer optimization at Kontext (50% latency reduction) |
| **RAG Pipelines** | Contract Analyzer: retrieval from playbook, augmented generation, citation grounding |
| **Cloud-Native (AWS/Azure/GCP, Docker/K8s)** | AWS EC2 deployment (Contract Analyzer), Docker for all projects, K8s-ready architecture |
| **Python (Backend, AI Systems)** | Primary language: FastAPI, asyncio, ML libraries (5+ years) |
| **High-Throughput Systems** | Voice Agent: 20+ concurrent sessions, async architecture. Kontext: 10M+ vector search optimization |
| **Testing Strategies (Deterministic + Probabilistic)** | Voice Agent: automated test harness, metrics tracking, behavior validation |
| **Agile, CI/CD** | All projects: Git, automated testing, containerized deployment, iterative development |

---

## ANTICIPATED QUESTIONS & STRONG ANSWERS

### Opening Questions

**Q: "Tell me about yourself"**
**A:** "Full-stack AI engineer, about 6 years across enterprise systems, research, and production AI. Started at Capgemini—production SAP systems, end-to-end ownership. Then AI/ML: Harvard Medical School (real-time computer vision), Sony and Kontext (semantic search, vector optimization). Recently built two major agentic systems: Voice Agent with autonomous conversation management and sub-400ms response latency, and Contract Analyzer with multi-agent RAG pipeline and hallucination guardrails. What excites me about Teradata is building autonomous agents at scale—my experience proves I can design these systems end-to-end, from architecture to production."

**Q: "Why Teradata / why this role?"**
**A:** "Three things. First, the problem—autonomous agents within an enterprise data platform. Not toy demos, real production systems handling critical workloads. Second, the technical challenges align perfectly with what I've built: agent reasoning, multi-step planning, tool orchestration, RAG, vector search. My Voice Agent and Contract Analyzer directly map to your requirements. Third, the scope—leading technical direction, shaping the team, highly visible impact. That's where I thrive. I want to build agentic systems that millions use."

---

### Deep Technical - Agentic AI

**Q: "What is Agentic AI? How does it differ from traditional AI?"**
**A:** "Traditional AI: input → model → output. Static, reactive. Agentic AI: perception → reasoning → action → learning, continuous loop. Key differences: (1) Autonomy—agents make decisions, not just predictions. (2) Goal-directed—agents pursue objectives over multiple steps. (3) Tool use—agents interact with environment via APIs, databases, external systems. (4) Memory—agents maintain context across interactions. (5) Self-reflection—agents monitor performance, adapt behavior. I've built this: Voice Agent autonomously manages conversations, orchestrates tools (VAD, LLM, TTS), maintains conversation memory, self-corrects when latency exceeds thresholds."

**Q: "Explain your Voice Agent as an agentic system"**
**A:** "It's a ReAct-style agent. Perceive: VAD detects speech, STT transcribes. Reason: LLM generates response plan, decides tone/strategy based on context (reminder vs sales mode). Act: TTS synthesizes speech, streams to user. Memory: maintains conversation history (episodic), user profile (semantic), current state (working memory). Self-reflection: monitors barge-in latency, adjusts VAD threshold if exceeding target. Tool orchestration: chains VAD → Translation → LLM → TTS asynchronously. It's autonomous—I don't program conversation paths, agent decides dynamically."

**Q: "How would you implement multi-agent collaboration in Teradata Vantage?"**
**A:** "Depends on use case. For data analysis task: (1) **Manager Agent** decomposes query ('Show sales trends') into subtasks. (2) **SQL Agent** writes and executes queries. (3) **Analyst Agent** interprets results, generates insights. (4) **Visualization Agent** creates charts. (5) Manager synthesizes final report. Communication: shared message bus (Redis/RabbitMQ), agents subscribe to relevant topics. State management: shared memory store, each agent updates state. Orchestration: Manager uses LangGraph or custom orchestrator, tracks subtask completion, handles failures (retry, escalate to human). I've built sequential multi-agent in Contract Analyzer, ready to extend to hierarchical."

**Q: "What's your approach to agent memory management?"**
**A:** "Three memory types: (1) **Episodic (short-term):** Recent conversation, stored in session object or Redis with TTL. Retrieved for immediate context. (2) **Semantic (long-term):** Domain knowledge (RAG), user profiles, stored in vector DB (Pinecone) + relational DB (PostgreSQL). Retrieved via similarity search. (3) **Working memory:** Current task state, active goals, in-memory during conversation. Persistence: episodic → Redis (expires), semantic → permanent storage. Retrieval: hybrid search (vector for 'similar past issues' + metadata filter for 'same user'). Memory pruning: summarize old conversations, store summary not full text, prevents context explosion. Implemented episodic + semantic in Voice Agent and Contract Analyzer."

**Q: "How do you handle function calling / tool use with LLMs?"**
**A:** "Two approaches: (1) **Native function calling** (GPT-4, Claude): define tool schemas in system prompt, model returns structured tool call, I execute and feed result back. (2) **ReAct prompting** (open models): prompt includes tool descriptions, examples, model generates action in text ('Tool: calculator, Input: 2+2'), I parse, execute, return. Implemented in Voice Agent: define tools (VAD, TTS, translation) with clear interfaces, LLM decides when to call based on conversation state. Error handling: if tool fails, agent retries with different parameters or apologizes to user. Tool chaining: agent can call multiple tools in sequence (translate → LLM → TTS)."

---

### Deep Technical - RAG & Vector Search

**Q: "Walk me through your Contract Analyzer RAG pipeline"**
**A:** "Five stages: (1) **Ingestion:** chunk legal playbook (500 tokens, 50 overlap), embed with sentence-transformers, store in ChromaDB. (2) **Query:** user uploads contract, extract clauses (regex + LLM), embed clause text. (3) **Retrieval:** semantic search over playbook embeddings, top-5 relevant standards. Metadata filter: clause type (payment/IP/termination). (4) **Augmentation:** pass clause + retrieved standards to LLM, prompt: 'Analyze this clause using these standards, cite sources'. (5) **Validation:** verify every finding has source_text and playbook_chunks, drop uncited claims. Result: risk-scored findings with citations."

**Q: "How did you optimize Kontext vector search by 50%?"**
**A:** "Problem: searching 10M vectors took 800ms. Solution: (1) **Metadata separation:** moved file path, language, repo_id to PostgreSQL, kept only embeddings in Turbopuffer. (2) **Pre-filtering:** filter metadata first (e.g., 'language=python, repo=X'), get IDs (reduces search space 70%), then vector search only those IDs. (3) **Query-time optimization:** built composite indexes on (repo_id, language), metadata query <50ms. (4) **Result:** 800ms → 400ms p95 latency. Also enabled scaling: metadata in Postgres (ACID), vectors in specialized DB (fast)."

**Q: "How would you implement RAG for Teradata Vantage agents?"**
**A:** "Use case: agent helps users write SQL queries. (1) **Knowledge Base:** embed Teradata docs, SQL examples, table schemas, common queries. Store in Weaviate (supports filters + hybrid search). (2) **Retrieval:** user asks 'Show me top 10 customers by revenue'. Embed query, search knowledge base with metadata filter (topic=aggregation, database=Teradata). Retrieve relevant SQL patterns + docs. (3) **Generation:** pass retrieved examples + user question to LLM, prompt: 'Write Teradata SQL using these examples'. (4) **Validation:** parse generated SQL (syntax check), optionally EXPLAIN query (performance check), return to user. (5) **Feedback Loop:** if user modifies query, store (original question, user's final query) as high-quality training example."

**Q: "What vector databases have you used? How do you choose?"**
**A:** "Used ChromaDB (Contract Analyzer), Turbopuffer (Kontext). Choosing criteria: (1) **Scale:** <1M vectors → ChromaDB (simple, local). 1M-100M → Pinecone/Weaviate (managed, scalable). >100M → FAISS (custom). (2) **Features:** need metadata filters + hybrid search → Weaviate. Need cloud-managed → Pinecone. Need open-source → ChromaDB/FAISS. (3) **Latency:** real-time (<100ms) → in-memory FAISS or Weaviate. Batch okay → any. (4) **Cost:** prototyping → ChromaDB (free). Production → Pinecone (paid but reliable). For Teradata scale, I'd pick **Weaviate** (metadata filtering, hybrid search, scales to 100M+ vectors, cloud or self-hosted)."

---

### Deep Technical - Production & Performance

**Q: "How do you achieve sub-600ms latency for agent responses?"**
**A:** "Multi-level optimization: (1) **Streaming:** Start speaking before full LLM response (chunk-by-chunk TTS). Saves 200-300ms. (2) **Model selection:** Use small fast model (GPT-3.5-turbo) for simple queries, large model (GPT-4) only when needed. Router classifies intent. (3) **Caching:** Frequent queries pre-computed, stored in Redis. (4) **Parallel execution:** While LLM generates, start pre-warming TTS, fetch user context. (5) **Pre-warming:** Models loaded, no cold starts. (6) **Infrastructure:** Deploy close to users (latency), use async I/O (throughput). Voice Agent achieves <900ms TTFB with mock models; real optimized pipeline (above techniques) targets <600ms."

**Q: "How do you handle 1000+ concurrent agent sessions?"**
**A:** "Async architecture + horizontal scaling: (1) **Async I/O:** Python asyncio, all I/O non-blocking (WebSocket, DB, APIs), single process handles 20-50 sessions. (2) **Horizontal scaling:** Run N processes across M servers, load balancer distributes. For 1000 sessions: 50 sessions/process = 20 processes. (3) **Stateless agents:** Session state in Redis (shared), any agent instance can handle any request. (4) **Resource pooling:** LLM API connection pool, DB connection pool, prevents bottlenecks. (5) **Monitoring:** Track latency per session, auto-scale if p95 latency > threshold. Voice Agent proven: 20 concurrent on single process, linear scaling to hundreds."

**Q: "How do you test autonomous agents? They're non-deterministic."**
**A:** "Multi-layer testing: (1) **Unit tests (deterministic):** Test tools in isolation. 'VAD detects speech sample' → true. 'Barge-in latency <400ms' → deterministic threshold. (2) **Behavior tests (probabilistic):** Run agent 10 times, check statistical properties. 'Agent responds to payment query' → assert 9/10 responses mention 'balance'. (3) **Golden dataset:** Known-good conversations, run agent weekly, check outputs match expected quality. (4) **Regression monitoring:** Track production metrics (task success rate, user satisfaction), alert if drop. (5) **Simulation:** Generate synthetic user inputs (edge cases, adversarial), check agent handles gracefully. Implemented in Voice Agent: automated harness, 20 concurrent simulated calls, metrics validation."

**Q: "How do you handle failures in multi-agent systems?"**
**A:** "Defense in depth: (1) **Retries with backoff:** If agent API call fails, retry 3 times with exponential backoff. (2) **Fallbacks:** If specialized agent fails, fall back to general-purpose agent or deterministic rules. (3) **Timeouts:** Every agent action has timeout, prevents hanging. (4) **Circuit breakers:** If external API (LLM) fails repeatedly, open circuit, return cached/default response. (5) **Graceful degradation:** If Risk Scoring Agent fails in Contract Analyzer, return findings without scores + warning. User gets partial result, not total failure. (6) **Monitoring + alerting:** Track agent success rate, alert if <95%. (7) **Human escalation:** For critical tasks, if agent uncertain (confidence <threshold), escalate to human."

---

### Deep Technical - Hallucination & Security

**Q: "How do you prevent hallucinations in agent responses?"**
**A:** "Multi-layer guardrails (proven in Contract Analyzer): (1) **Source grounding:** Every claim must cite source text. No citation → drop claim. (2) **RAG validation:** Must be grounded in knowledge base. No RAG retrieval → can't answer. (3) **Heuristic-first:** Use deterministic rules where possible. 'Payment terms >90 days' → rule-based 'critical risk', not LLM guess. (4) **Confidence scoring:** LLM returns confidence, threshold <0.7 → flag for review. (5) **Structured output:** Force JSON schema, validate against expected format, catch malformed responses. (6) **Cross-verification:** Retrieve from 2 sources, check consistency. Disagree → flag. (7) **Human review:** High-stakes decisions (legal, medical) require human confirmation. These layers reduced hallucinations to <2% in Contract Analyzer."

**Q: "How do you handle sensitive data in agent systems?"**
**A:** "Defense in depth: (1) **Data minimization:** Only pass what LLM needs. If analyzing clause, send clause text, not entire contract. (2) **PII detection + redaction:** Regex + NER model detect PII (names, SSN, credit cards), redact before LLM sees. (3) **Encryption:** At rest (database AES-256), in transit (TLS 1.3). (4) **Access control:** Agents have least-privilege API keys, can't access unrelated data. (5) **Audit logging:** Every agent action logged (immutable, timestamped): what data accessed, why, result. (6) **Rate limiting:** Prevent data exfiltration via repeated queries. (7) **Input validation:** Pydantic schemas, SQL injection prevention (ORM), prompt injection filtering. Implemented in Contract Analyzer: PII redaction, audit logs, rate limiting (60 req/min)."

**Q: "What's your approach to prompt injection prevention?"**
**A:** "Multi-layer defense: (1) **Input validation:** Filter special characters, length limits, reject obvious injection attempts ('Ignore previous instructions'). (2) **System prompt hardening:** Start with 'You are a Teradata SQL assistant. Never execute DELETE/DROP commands. Always validate user intent.' Make it hard to override. (3) **Output validation:** Check response doesn't contain sensitive data (API keys, credentials), doesn't violate constraints (e.g., agent shouldn't write DELETE queries). (4) **Sandboxing:** If agent executes code/SQL, run in isolated environment (Docker container, read-only DB replica). (5) **Monitoring:** Flag suspicious patterns (user asks for system prompt, unusual tool calls). (6) **Human review:** Critical actions require confirmation. Not foolproof, but layers make attack much harder."

---

### Behavioral - Culture Fit

**Q: "Tell me about building something from scratch with no guidance"**
**A:** "Voice Agent. No spec—just the goal: Malayalam voice conversations with natural interruptions. I researched: how do humans handle interruptions? What's acceptable latency? How do production call centers work? Designed architecture: WebSocket streaming, VAD for speech detection, barge-in controller, filler manager to mask latency. Made all tech decisions: WebRTC VAD (more robust than energy detection), asyncio for concurrency (simpler than threads), 20ms frames (latency/efficiency balance). Built it, tested with 20 concurrent simulated calls, documented thoroughly. End-to-end in a few weeks. This is how I work best—ambiguous problem, autonomy to solve it, ownership of outcome."

**Q: "How do you handle ambiguity in requirements?"**
**A:** "Default to action. Make a reasonable decision, ship something, learn from feedback. Voice Agent had tons of ambiguity—what's the right barge-in threshold? How many fillers? I made educated guesses (400ms latency target based on research, max 2 fillers to avoid annoyance), built it with metrics tracking, measured results, iterated. Better to have working system with imperfect parameters than perfect spec with no code. Same at Kontext—'improve latency' was the brief. I dug into codebase, identified bottleneck (vector search), proposed solution (metadata pre-filtering), implemented, measured 50% improvement. Didn't wait for detailed requirements."

**Q: "Give an example of leading technical direction"**
**A:** "Contract Analyzer hallucination prevention. Initial version: LLM analyzed contracts, generated findings. Problem: ~15% hallucinations (findings not grounded in contract). I proposed multi-layer guardrails: (1) require source text citation, (2) require RAG grounding, (3) use heuristics first, (4) confidence thresholding. Team skeptical—'LLM should be smart enough'. I built proof-of-concept, measured: hallucinations dropped from 15% → <2%. Convinced team, became standard approach. Led design review, mentored junior engineer on implementation, wrote testing strategy. Result: production-ready system, no hallucinations in 3 months deployed."

**Q: "How do you handle disagreement with teammates?"**
**A:** "Data over opinions. At Capgemini, disagreed on code duplication vs abstraction. Teammate wanted shared utility, I argued duplication better (contexts were different). I gathered data: maintenance cost (how often do we change these?), coupling risk (how likely are contexts to diverge?). Presented to tech lead: 'These contexts change independently 80% of time, shared utility would create coupling'. Tech lead agreed, we kept separation. When I'm wrong, I want to know fast—direct feedback is a gift. I change my mind when shown better data."

---

## QUESTIONS TO ASK TERADATA

**Technical - Agentic AI:**
1. "What agentic AI capabilities does Teradata Vantage currently have? Where are the biggest gaps?"
2. "What's your current approach to agent memory management across sessions? Redis, database, other?"
3. "How do you handle multi-step agent workflows today—custom orchestrator or framework like LangGraph?"
4. "What LLMs are you primarily using? Open-source, proprietary, or hybrid?"

**Technical - Architecture:**
5. "What's the biggest technical challenge in your agent platform right now that this hire would tackle?"
6. "How do you approach agent testing—golden datasets, simulation, production monitoring?"
7. "What's your vector database strategy for RAG? Managed (Pinecone) or self-hosted (Weaviate)?"

**Product & Impact:**
8. "What's an example of an agent workflow that's working really well? And one that's struggling?"
9. "How do customers interact with agents—API, UI, embedded in Vantage workflows?"
10. "What does success look like for this role in 6 months? First major project?"

**Team & Culture:**
11. "How big is the agentic AI team today? How much autonomy would I have in technical decisions?"
12. "How do you balance research (exploring new agent techniques) vs execution (shipping features)?"
13. "What's the feedback culture like—direct/async, design reviews, pair programming?"

---

## CLOSING STATEMENT

"I'm genuinely excited about Teradata's agentic AI platform. Building autonomous agents that operate within an enterprise data platform at scale—that's a hard, high-impact problem. My Voice Agent proves I can design real-time agentic systems from scratch with strict latency requirements and autonomous decision-making. My Contract Analyzer proves I understand multi-agent collaboration, RAG, hallucination prevention, and production deployment. The continuous learning approaches I've outlined show how I think about making agents smarter over time. I thrive in environments where I have autonomy to solve hard problems and ownership of outcomes. Ready to lead technical direction and build agents that reach millions of Teradata users."

---

## RESPONSE STYLE GUIDE

**For Technical Questions:**
- Start with 2-3 sentence summary
- Give specific example from projects
- Use numbers: "sub-400ms", "50% reduction", "20 concurrent", "<2% hallucination rate"
- Connect to Teradata: "This applies to your agent platform because..."

**For Agentic AI Concepts:**
- Define clearly (they're testing understanding)
- Give concrete example from my projects
- Explain why it matters for production systems

**For Behavioral:**
- STAR format: Situation, Task, Action, Result
- Draw from: Voice Agent (from scratch), Kontext (optimization), Contract Analyzer (production), Capgemini (enterprise)

**Tone:**
- Confident but humble ("I've built this, ready to build more")
- Enthusiastic about the problem ("This is exactly what I want to work on")
- Specific with evidence (numbers, code, architecture diagrams)
- If uncertain: "Let me think through this..." then structured answer

**Power Phrases:**
- "I built this end-to-end"
- "Proven in production"
- "Measured and optimized"
- "Autonomous decision-making"
- "Multi-layer guardrails"
- "Scales to N concurrent sessions"
- "Reduced hallucinations from X% to Y%"

---

## KEY TERADATA-SPECIFIC TALKING POINTS

1. **"I've built the core components Teradata needs"**: Agent reasoning (Voice Agent), multi-agent collaboration (Contract Analyzer), RAG pipelines (both projects), vector search optimization (Kontext), production deployment (all projects).

2. **"I understand enterprise constraints"**: Capgemini taught me production reliability, security, compliance, audit logging—all critical for Teradata's enterprise customers.

3. **"I move from research to production fast"**: Harvard (research) → Sony/Kontext (production optimization) → Voice Agent & Contract Analyzer (end-to-end systems). I don't just prototype, I ship.

4. **"I think about systems holistically"**: Not just the LLM call—entire pipeline from user input → perception → reasoning → action → memory update → monitoring. Voice Agent demonstrates this.

5. **"I'm excited about Teradata's scale"**: Building agents that millions of enterprise users rely on for data analysis, not toy demos. That's where I want to be.

---

## REMINDER: USE THIS PROMPT IN CLUELY.COM

**Instructions for using this in cluely.com:**
- Paste this entire document into cluely's real-time prompt box
- Tell cluely: "Use this context to help me answer interview questions for Teradata Senior AI Engineer role"
- During interview, type interviewer's questions into cluely
- Cluely will pull from this context to suggest answers
- Adapt suggestions in your own words - don't read verbatim

**Most Important Sections to Emphasize:**
1. Voice Agent (demonstrates agentic AI end-to-end)
2. Contract Analyzer (demonstrates multi-agent, RAG, production)
3. Continuous Learning approaches (shows forward thinking)
4. Agentic AI principles (proves deep understanding)
5. Production systems expertise (Teradata needs production-ready)

Good luck! You've got this. Your projects directly align with what Teradata is building.
