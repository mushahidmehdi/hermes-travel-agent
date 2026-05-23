# AI Travel Planner powered by Hermes Agent

> Plan your perfect trip with multi-step AI research. Hermes Agent researches your destination, scouts activities, checks conditions, and builds a personalised day-by-day itinerary — all in one go.

## What it does

You enter a destination, travel dates, interests, and budget. Hermes Agent then:

1. **Researches** the destination using its built-in web search tools
2. **Scouts** attractions, restaurants, and activities matching your interests
3. **Plans** a day-by-day itinerary with morning / afternoon / evening breakdowns
4. **Estimates** costs and adds local insider tips
5. **Streams** its thinking steps live to the UI as it works

The entire planning is done by Hermes Agent — not a static template, not a simple API call. Real multi-step agentic reasoning.

## Tech stack

| Layer     | Tech                                                                          |
| --------- | ----------------------------------------------------------------------------- |
| Frontend  | Next.js 16 (App Router), Tailwind CSS                                         |
| AI Agent  | [Hermes Agent](https://github.com/NousResearch/hermes-agent) by Nous Research |
| LLM       | DeepSeek (via Hermes Agent)                                                   |
| Streaming | Server-Sent Events (SSE)                                                      |

## How Hermes Agent is used

The Next.js API route spawns Hermes Agent in non-interactive mode:

```bash
hermes chat --query "<travel prompt>" --quiet --yolo --model deepseek-chat --provider deepseek
```

Hermes uses its 40+ built-in tools to research the destination, then outputs a structured JSON itinerary. The API route streams progress steps to the frontend in real time as Hermes works.

## Getting started

### 1. Install Hermes Agent

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.zshrc
```

### 2. Clone and install

```bash
git clone https://github.com/mushahidmehdi/hermes-travel-agent
cd hermes-travel-agent
npm install
```

### 3. Add your DeepSeek API key

Create `.env.local`:

```
DEEPSEEK_API_KEY=your-key-here
```

Get a free key at [platform.deepseek.com](https://platform.deepseek.com).

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.tsx              # Main UI (client component)
  api/plan/route.ts     # Spawns Hermes Agent, streams SSE
components/
  TravelForm.tsx        # Destination / dates / interests form
  AgentStream.tsx       # Live agent thinking steps panel
  ItineraryDisplay.tsx  # Day-by-day itinerary display
lib/
  types.ts              # Shared TypeScript types
```

## Built for the Hermes Agent Challenge

This project was built for the [DEV Hermes Agent Challenge](https://dev.to/challenges/hermes).
Hermes Agent is at the heart of the experience — doing real multi-step research and planning, not just a single LLM call.

---

Built by [@mushahidmehdi](https://dev.to/mushahidmehdi)
