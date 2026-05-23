import { spawn } from "child_process";
import { NextRequest } from "next/server";
import type { TravelParams } from "@/components/TravelForm";
import type { AgentStep, Itinerary } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function buildHermesPrompt(params: TravelParams): string {
  const days = Math.ceil(
    (new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const interests = params.interests.join(", ") || "general sightseeing";

  return `You are a travel planning expert. Plan a ${days}-day trip to ${params.destination} for ${params.travelers} traveler(s).

Trip details:
- Dates: ${params.startDate} to ${params.endDate} (${days} days)
- Budget style: ${params.budget}
- Interests: ${interests}
${params.notes ? `- Special notes: ${params.notes}` : ""}

Please research the destination thoroughly and create a detailed day-by-day itinerary. Use your web search and research tools to find current information about:
1. Best attractions and activities matching their interests
2. Recommended accommodation options for their budget
3. Local food and dining recommendations
4. Practical travel tips and local customs
5. Estimated daily costs

After your research, output a JSON object in this EXACT format (start your final output with \`\`\`json and end with \`\`\`):

\`\`\`json
{
  "destination": "${params.destination}",
  "duration": ${days},
  "summary": "2-3 sentence trip overview",
  "bestTimeNote": "weather/season note if relevant",
  "totalBudget": "estimated total budget range",
  "highlights": ["top activity 1", "top activity 2", "top activity 3"],
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Day theme title",
      "morning": "Morning activity description",
      "afternoon": "Afternoon activity description",
      "evening": "Evening activity description",
      "accommodation": "Hotel/hostel recommendation",
      "tip": "Local insider tip for this day",
      "estimatedCost": "~$XX per person"
    }
  ],
  "packingTips": ["item 1", "item 2", "item 3", "item 4", "item 5"]
}
\`\`\`

Think step by step, research thoroughly, then produce the final JSON.`;
}

function parseItineraryFromOutput(output: string): Itinerary | null {
  const match = output.match(/```json\s*([\s\S]*?)```/);
  if (!match) {
    const jsonMatch = output.match(/\{[\s\S]*"days"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
  try {
    return JSON.parse(match[1].trim());
  } catch {
    return null;
  }
}

const TRACEBACK_PREFIXES = [
  "Traceback", "File \"", "  File \"", "raise ", "KeyboardInterrupt",
  "Exception", "Error:", "Warning:", "  ^", "~~~",
];

function isTraceback(line: string): boolean {
  const t = line.trim();
  return TRACEBACK_PREFIXES.some((p) => t.startsWith(p)) || /^\s+\^+$/.test(t);
}

function classifyLine(line: string): Partial<AgentStep> | null {
  const t = line.trim();
  if (!t || isTraceback(line)) return null;

  const lower = t.toLowerCase();

  if (lower.includes("search") || lower.includes("looking up") || lower.includes("browsing")) {
    return { type: "searching", label: truncate(t, 80) };
  }
  if (lower.includes("found") || lower.includes("reading") || lower.includes("article") || lower.includes("website")) {
    return { type: "researching", label: truncate(t, 80) };
  }
  if (lower.includes("plan") || lower.includes("itinerary") || lower.includes("schedule")) {
    return { type: "planning", label: truncate(t, 80) };
  }
  if (lower.includes("writing") || lower.includes("composing") || lower.includes("generating")) {
    return { type: "writing", label: truncate(t, 80) };
  }
  if (lower.includes("think") || lower.includes("consider") || lower.includes("analyz")) {
    return { type: "thinking", label: truncate(t, 80) };
  }
  // Substantial agent reasoning lines only (not code/json/paths)
  if (
    t.length > 30 &&
    !t.startsWith("{") &&
    !t.startsWith("[") &&
    !t.startsWith("/") &&
    !t.includes("->") &&
    !/^\s*\w+\s*=/.test(t)
  ) {
    return { type: "thinking", label: truncate(t, 80) };
  }
  return null;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export async function POST(req: NextRequest) {
  const params: TravelParams = await req.json();

  const encoder = new TextEncoder();
  let stepCounter = 0;

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(sseEvent(data)));
      }

      function sendStep(partial: Partial<AgentStep>) {
        const step: AgentStep = {
          id: `step-${++stepCounter}`,
          type: partial.type ?? "thinking",
          label: partial.label ?? "Processing…",
          detail: partial.detail,
          done: false,
        };
        send({ type: "step", step });
        // Mark as done shortly after
        setTimeout(() => {
          send({ type: "step", step: { ...step, done: true } });
        }, 800);
      }

      // Initial step
      sendStep({ type: "thinking", label: `Planning your trip to ${params.destination}…` });

      const hermesPath =
        process.env.HERMES_PATH || `${process.env.HOME}/.local/bin/hermes`;
      const prompt = buildHermesPrompt(params);

      let fullOutput = "";
      let hermesReady = false;

      sendStep({ type: "searching", label: `Researching ${params.destination} with Hermes Agent` });

      try {
        await new Promise<void>((resolve, reject) => {
          const child = spawn(
            hermesPath,
            [
              "chat",
              "--query", prompt,
              "--quiet",
              "--yolo",
              "--model", "deepseek-chat",
              "--provider", "deepseek",
            ],
            {
              env: {
                ...process.env,
                DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ?? "",
                // prevent Hermes from trying interactive terminal features
                TERM: "dumb",
                NO_COLOR: "1",
              },
              // detach from parent's signal group so SIGINT to Next.js doesn't kill Hermes
              detached: false,
              stdio: ["ignore", "pipe", "pipe"],
            }
          );

          // kill after 100s if still running
          const killTimer = setTimeout(() => child.kill("SIGTERM"), 100_000);

          child.stdout.on("data", (chunk: Buffer) => {
            const text = chunk.toString();
            fullOutput += text;

            // Emit interesting lines as steps
            const lines = text.split("\n");
            for (const line of lines) {
              const classified = classifyLine(line);
              if (classified) sendStep(classified);
            }
          });

          child.stderr.on("data", (_chunk: Buffer) => {
            // stderr carries spinners/tracebacks — ignore entirely
          });

          child.on("close", () => {
            clearTimeout(killTimer);
            // resolve regardless of exit code — use whatever output we collected
            resolve();
          });

          child.on("error", reject);
        });

        sendStep({ type: "writing", label: "Compiling your personalised itinerary" });

        const itinerary = parseItineraryFromOutput(fullOutput);
        if (itinerary) {
          send({ type: "itinerary", itinerary });
        } else {
          // Fallback: return raw output as a simple itinerary
          send({
            type: "itinerary",
            itinerary: buildFallbackItinerary(params, fullOutput),
          });
        }
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Hermes Agent failed",
        });
      }

      send({ type: "done" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function buildFallbackItinerary(params: TravelParams, rawOutput: string): Itinerary {
  const days = Math.ceil(
    (new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return {
    destination: params.destination,
    duration: days,
    summary: rawOutput.slice(0, 300) + "…",
    highlights: ["Explore local culture", "Try local cuisine", "Visit top attractions"],
    days: Array.from({ length: Math.min(days, 7) }, (_, i) => ({
      day: i + 1,
      date: new Date(
        new Date(params.startDate).getTime() + i * 86400000
      ).toISOString().split("T")[0],
      title: `Day ${i + 1} in ${params.destination}`,
      morning: "Explore the city centre and local markets",
      afternoon: "Visit key attractions and museums",
      evening: "Dinner at a local restaurant, evening stroll",
      accommodation: "Central hotel",
    })),
    packingTips: ["Comfortable walking shoes", "Adapter plug", "Travel insurance", "Camera", "Sunscreen"],
  };
}
