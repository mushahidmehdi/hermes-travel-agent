"use client";

import type { Itinerary } from "@/lib/types";

interface Props {
  itinerary: Itinerary;
}

export default function ItineraryDisplay({ itinerary }: Props) {
  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 px-6 pt-6 pb-4 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{itinerary.destination}</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {itinerary.duration}-day itinerary · {itinerary.travelers ?? ""}{" "}
              {itinerary.budget ?? ""}
            </p>
          </div>
          {itinerary.totalBudget && (
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-500">Est. total</p>
              <p className="text-sm font-semibold text-violet-300">{itinerary.totalBudget}</p>
            </div>
          )}
        </div>
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">{itinerary.summary}</p>
        {itinerary.bestTimeNote && (
          <p className="text-xs text-amber-400/80 mt-2">💡 {itinerary.bestTimeNote}</p>
        )}
      </div>

      {/* Days */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-4">
        {itinerary.days.map((day) => (
          <div key={day.day} className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                {day.day}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{day.title}</p>
                <p className="text-xs text-slate-500">{day.date}</p>
              </div>
              {day.estimatedCost && (
                <span className="ml-auto text-xs text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full">
                  {day.estimatedCost}
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <TimeBlock icon="🌅" label="Morning" text={day.morning} />
              <TimeBlock icon="☀️" label="Afternoon" text={day.afternoon} />
              <TimeBlock icon="🌙" label="Evening" text={day.evening} />
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {day.accommodation && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  🏨 <span className="text-slate-300">{day.accommodation}</span>
                </span>
              )}
              {day.tip && (
                <span className="text-xs text-amber-400/80 flex items-center gap-1">
                  ✦ {day.tip}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Highlights */}
        {itinerary.highlights?.length > 0 && (
          <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02]">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Must-dos
            </p>
            <ul className="space-y-1.5">
              {itinerary.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-violet-400 mt-0.5">✦</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Packing tips */}
        {itinerary.packingTips?.length > 0 && (
          <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02]">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              What to pack
            </p>
            <div className="flex flex-wrap gap-2">
              {itinerary.packingTips.map((tip) => (
                <span
                  key={tip}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-slate-300"
                >
                  {tip}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimeBlock({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-base shrink-0 mt-0.5">{icon}</span>
      <div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label} </span>
        <span className="text-slate-300">{text}</span>
      </div>
    </div>
  );
}
