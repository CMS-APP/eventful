export interface Itinerary {
  id: string;
  name: string;
  startTime: string;
  durationMinutes?: number;
  location?: string;
  notes?: string;
}
