"use client";

import { useState } from "react";
import TravelForm, { TravelParams } from "@/components/TravelForm";
import AgentStream from "@/components/AgentStream";
import ItineraryDisplay from "@/components/ItineraryDisplay";
import type { AgentStep, Itinerary } from "@/lib/types";

type AppState = "idle" | "planning" | "done" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePlan(params: TravelParams) {
    setState("planning");
    setSteps([]);
    setItinerary(null);
    setError(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to connect to planning service");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === "[DONE]") continue;

          try {
            const event = JSON.parse(raw);
            if (event.type === "step") {
              const incoming = event.step as AgentStep;
              setSteps((prev) => {
                const idx = prev.findIndex((s) => s.id === incoming.id);
                if (idx !== -1) {
                  const next = [...prev];
                  next[idx] = incoming;
                  return next;
                }
                return [...prev, incoming];
              });
            } else if (event.type === "itinerary") {
              setItinerary(event.itinerary as Itinerary);
              setState("done");
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          } catch {
            // skip malformed lines
          }
        }
      }

      if (state !== "done") setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  function reset() {
    setState("idle");
    setSteps([]);
    setItinerary(null);
    setError(null);
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              V
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Voyage</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
              powered by Hermes Agent
            </span>
          </div>
          {state !== "idle" && (
            <button
              onClick={reset}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← New trip
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {state === "idle" && (
          <div className="fade-in">
            {/* Hero */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                Plan your perfect trip
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  with an AI agent
                </span>
              </h1>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                Hermes Agent researches destinations, checks conditions, scouts activities,
                and builds a personalised day-by-day itinerary — all in one go.
              </p>
            </div>

            {/* Capability chips */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {[
                "🔍 Web research",
                "🌤 Weather insights",
                "🏨 Accommodation picks",
                "🗺 Day-by-day plans",
                "💡 Local tips",
                "💸 Budget estimates",
              ].map((cap) => (
                <span
                  key={cap}
                  className="text-sm px-3 py-1.5 rounded-full glass text-slate-300"
                >
                  {cap}
                </span>
              ))}
            </div>

            <TravelForm onSubmit={handlePlan} />
          </div>
        )}

        {(state === "planning" || state === "done") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
            <AgentStream steps={steps} isLive={state === "planning"} />
            {itinerary ? (
              <ItineraryDisplay itinerary={itinerary} />
            ) : (
              <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-64">
                <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <span className="text-2xl blink">✦</span>
                </div>
                <p className="text-slate-400">
                  Hermes Agent is building your itinerary…
                </p>
              </div>
            )}
          </div>
        )}

        {state === "error" && (
          <div className="max-w-lg mx-auto text-center fade-in">
            <div className="glass rounded-2xl p-8 border border-red-500/20">
              <p className="text-red-400 font-medium mb-2">Planning failed</p>
              <p className="text-slate-400 text-sm mb-6">{error}</p>
              <button
                onClick={reset}
                className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
