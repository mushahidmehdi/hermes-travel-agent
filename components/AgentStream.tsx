"use client";

import type { AgentStep } from "@/lib/types";

const STEP_ICONS: Record<AgentStep["type"], string> = {
  thinking: "🧠",
  searching: "🔍",
  researching: "📖",
  planning: "🗺",
  writing: "✍️",
};

interface Props {
  steps: AgentStep[];
  isLive: boolean;
}

export default function AgentStream({ steps, isLive }: Props) {
  return (
    <div className="glass rounded-2xl p-6 flex flex-col h-fit max-h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.06]">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <span className="text-sm">☤</span>
          </div>
          {isLive && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 blink" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Hermes Agent</p>
          <p className="text-xs text-slate-500">
            {isLive ? "Working on your trip…" : `Completed ${steps.length} steps`}
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pr-1">
        {steps.length === 0 && isLive && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="blink">●</span>
            <span>Initialising…</span>
          </div>
        )}

        {steps.map((step, idx) => (
          <div
            key={step.id}
            className="slide-up flex gap-3"
            style={{ animationDelay: `${idx * 0.05}s`, opacity: 0 }}
          >
            {/* Icon + connector */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  step.done
                    ? "bg-green-500/15 border border-green-500/30"
                    : "bg-violet-500/15 border border-violet-500/30 blink"
                }`}
              >
                {step.done ? "✓" : STEP_ICONS[step.type]}
              </div>
              {idx < steps.length - 1 && (
                <div className="w-px h-full bg-white/[0.06] flex-1" />
              )}
            </div>

            {/* Content */}
            <div className="pb-3">
              <p className={`text-sm font-medium ${step.done ? "text-slate-300" : "text-white"}`}>
                {step.label}
              </p>
              {step.detail && (
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.detail}</p>
              )}
            </div>
          </div>
        ))}

        {isLive && steps.length > 0 && (
          <div className="flex items-center gap-2 text-slate-500 text-xs pl-10">
            <span className="blink">●</span>
            <span>Continuing research…</span>
          </div>
        )}
      </div>
    </div>
  );
}
