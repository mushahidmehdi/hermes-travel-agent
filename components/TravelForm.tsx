"use client";

import { useState } from "react";

export interface TravelParams {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  interests: string[];
  budget: "budget" | "moderate" | "luxury";
  notes?: string;
}

const INTEREST_OPTIONS = [
  "Culture & history",
  "Food & dining",
  "Nature & hiking",
  "Adventure sports",
  "Art & museums",
  "Nightlife",
  "Shopping",
  "Beaches",
  "Architecture",
  "Wellness & spa",
];

interface Props {
  onSubmit: (params: TravelParams) => void;
}

export default function TravelForm({ onSubmit }: Props) {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [interests, setInterests] = useState<string[]>(["Culture & history", "Food & dining"]);
  const [budget, setBudget] = useState<TravelParams["budget"]>("moderate");
  const [notes, setNotes] = useState("");

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination || !startDate || !endDate) return;
    onSubmit({ destination, startDate, endDate, travelers, interests, budget, notes });
  }

  const budgetOptions: { value: TravelParams["budget"]; label: string; desc: string }[] = [
    { value: "budget", label: "Budget", desc: "Hostels, street food" },
    { value: "moderate", label: "Moderate", desc: "3-star hotels, restaurants" },
    { value: "luxury", label: "Luxury", desc: "5-star, fine dining" },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Destination */}
      <div className="glass rounded-2xl p-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Where are you going?
        </label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Tokyo, Japan"
          required
          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-lg focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all"
        />
      </div>

      {/* Dates + Travelers */}
      <div className="glass rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Travelers: <span className="text-violet-400">{travelers}</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Solo</span>
            <span>10 people</span>
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="glass rounded-2xl p-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Interests <span className="text-slate-500">(pick any)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                interests.includes(interest)
                  ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                  : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:border-white/[0.15]"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="glass rounded-2xl p-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">Budget style</label>
        <div className="grid grid-cols-3 gap-3">
          {budgetOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setBudget(opt.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                budget === opt.value
                  ? "bg-violet-600/20 border-violet-500/50"
                  : "bg-white/[0.03] border-white/[0.07] hover:border-white/[0.12]"
              }`}
            >
              <div className={`text-sm font-medium ${budget === opt.value ? "text-violet-300" : "text-slate-300"}`}>
                {opt.label}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="glass rounded-2xl p-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Anything else? <span className="text-slate-500">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. travelling with kids, avoiding tourist traps, must try ramen…"
          rows={2}
          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={!destination || !startDate || !endDate}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-lg transition-all shadow-lg shadow-violet-500/20"
      >
        Plan my trip with Hermes Agent ✦
      </button>
    </form>
  );
}
