export interface AgentStep {
  id: string;
  type: "thinking" | "searching" | "researching" | "planning" | "writing";
  label: string;
  detail?: string;
  done: boolean;
}

export interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  accommodation: string;
  tip?: string;
  estimatedCost?: string;
}

export interface Itinerary {
  destination: string;
  duration: number;
  summary: string;
  bestTimeNote?: string;
  totalBudget?: string;
  days: ItineraryDay[];
  packingTips: string[];
  highlights: string[];
}
