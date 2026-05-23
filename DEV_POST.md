---
title: "I gave Hermes Agent a passport — it planned a better trip than I ever could"
published: false
tags: hermesagentchallenge, devchallenge, agents, nextjs
---

*This is a submission for the [Hermes Agent Challenge](https://dev.to/challenges/hermes-agent-2026-05-15)*

---

I'm a terrible travel planner. I open 40 browser tabs, spend three hours on TripAdvisor, forget half of what I found, and end up booking the first hotel that looked decent. Sound familiar?

So when I heard about Hermes Agent — an open-source AI agent with 40+ built-in tools, real web search, and multi-step reasoning — my first thought wasn't *"I'll build a coding assistant"* or *"I'll automate my workflows."*

My first thought was: **what if I just gave it a destination and let it plan the whole trip?**

That question became **Voyage**.

---

## What Voyage actually does

You fill in a form: destination, dates, number of travellers, interests (culture, food, hiking, nightlife…), and budget style. Hit the button. Then watch.

On the left side of the screen, you see Hermes Agent's thinking steps stream in live — *Searching for top attractions in Islamabad*, *Reading local travel guides*, *Planning day-by-day schedule*. On the right, the finished itinerary appears once Hermes is done: a full day-by-day breakdown with morning, afternoon, and evening activities, accommodation picks, cost estimates, and local insider tips.

Here's what it produced for a 5-day trip to Islamabad, Pakistan:

> **Day 1 — Arrival & the Old City**
> Morning: Arrive, check in near F-7 Markaz. Walk to Saidpur Village for breakfast.
> Afternoon: Faisal Mosque — largest in South Asia, stunning modernist architecture at the foot of the Margalla Hills.
> Evening: Lok Virsa Museum for Pakistani folk art and heritage. Dinner at Monal Restaurant for the city views.
> Local tip: Friday prayers fill Faisal Mosque — visit early morning for calm and photos.

It didn't hallucinate. It knew that Monal has city views. It knew Saidpur Village is the good breakfast spot. It knew the Friday prayer timing. That's not training data — that's Hermes actually searching the web during the run.

---

## Why this is an agent problem, not a chatbot problem

Most "AI travel planners" are just ChatGPT with a nicer UI. You ask a question, it generates an answer from training data, you get a plausible-sounding but potentially stale itinerary.

Hermes Agent is different because it *acts*. It:

1. Searches the web for current information about the destination
2. Reads actual travel articles and guides
3. Cross-references multiple sources
4. Reasons about your specific interests and budget
5. Composes a structured plan from everything it found

That's five steps before it writes a single word of your itinerary. A chatbot does zero of them.

---

## The technical side

### Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router) + Tailwind CSS |
| AI Agent | Hermes Agent by Nous Research |
| LLM | DeepSeek (via Hermes Agent — free tier) |
| Streaming | Server-Sent Events (SSE) |

### How Hermes Agent is wired in

Hermes Agent has a `--quiet` flag that makes it perfect for programmatic use — no spinner, no TUI chrome, just clean stdout. The Next.js API route spawns it as a subprocess:

```typescript
const child = spawn(hermesPath, [
  "chat",
  "--query", prompt,
  "--quiet",
  "--yolo",
  "--model", "deepseek-chat",
  "--provider", "deepseek",
], {
  env: { ...process.env, DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY },
  stdio: ["ignore", "pipe", "pipe"],
});
```

Then we stream stdout back to the browser via Server-Sent Events:

```
Browser  →  POST /api/plan
         ←  SSE stream of agent steps + final itinerary JSON
```

The prompt tells Hermes to output a structured JSON block at the end of its run. The API route watches for that block, parses it, and sends it to the frontend as the itinerary.

### The prompt matters

The travel prompt is detailed on purpose — it tells Hermes exactly what to research and what format to return:

```
Plan a 5-day trip to Islamabad for 2 travellers.
Budget: moderate. Interests: culture, food, hiking.

Research the destination thoroughly:
- Best attractions matching their interests
- Recommended accommodation for their budget
- Local food and dining recommendations
- Practical tips and local customs
- Estimated daily costs

Output a JSON itinerary in this format: [...]
```

Giving Hermes a clear research mandate and a structured output format is what turns a vague "plan a trip" request into a reliable, parseable result.

### DeepSeek + Hermes = surprisingly cheap

Hermes Agent is model-agnostic. Switching providers is literally just `--model` and `--provider`. DeepSeek's free tier handled every test run without a single rate limit error. The whole app costs essentially nothing to run.

---

## Three things that surprised me about Hermes Agent

**1. `--quiet` mode is genuinely great for embedding.**
Most CLI tools weren't designed to be spawned by another process. Hermes's quiet mode was — clean stdout, no escape codes, just the agent's output. Made integration trivial.

**2. The model-agnostic design is real, not marketing.**
I tested with Anthropic first, switched to DeepSeek to save cost, and the only change was two flags. No code changes, no prompt changes, no adapter layer. It just worked.

**3. It finds things I wouldn't think to search for.**
I knew about Faisal Mosque. I didn't know about Saidpur Village for breakfast, or that Monal has the best city views, or the Friday prayer timing tip. Hermes found those because it was actually reading travel guides, not just recalling common knowledge.

---

## Try it yourself

**Repo:** [github.com/mushahidmehdi/hermes-travel-agent](https://github.com/mushahidmehdi/hermes-travel-agent)

**Prerequisites:**
- [Hermes Agent](https://github.com/NousResearch/hermes-agent) installed
- Free [DeepSeek API key](https://platform.deepseek.com) (takes 2 minutes)
- Node.js 18+

```bash
# 1. Install Hermes Agent
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.zshrc

# 2. Clone and run Voyage
git clone https://github.com/mushahidmehdi/hermes-travel-agent
cd hermes-travel-agent
npm install
echo "DEEPSEEK_API_KEY=your-key-here" > .env.local
npm run dev
```

Open `http://localhost:3000`, pick a destination, and watch Hermes work.

---

## What I'd build next

- **Live flight prices** — Hermes has browser tools. Pointing it at Google Flights for real pricing is very doable.
- **Iterative planning** — A "refine this day" button that sends a follow-up query to Hermes with the existing itinerary as context.
- **Shareable itineraries** — Persist the JSON output so you can send a link to your travel partner.

---

The thing that stuck with me building this: Hermes Agent isn't just a better chatbot. It's a different kind of tool. Giving it a task and watching it actually *do the work* — search, read, reason, plan — feels genuinely different from asking a language model to generate an answer.

Give it a passport. See what it does.

Built for the [Hermes Agent Challenge](https://dev.to/challenges/hermes). Repo is above — if you build on it or fork it, I'd love to see what you make.
