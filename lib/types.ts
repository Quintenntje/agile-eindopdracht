export type EventStatus = "upcoming" | "active" | "completed" | "cancelled";
export type ParticipantStatus =
  | "registered"
  | "attended"
  | "cancelled"
  | "no_show";

export interface Event {
  id: string;
  title: string;
  description?: string;
  location_name: string;
  lat: number;
  long: number;
  event_date: string; // timestamptz is string in JS
  created_by: string; // UUID
  max_participants?: number;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: ParticipantStatus;
  joined_at: string;
}

export interface EventWithParticipants extends Event {
  participants_count: number;
  is_joined?: boolean; // Virtual field for UI
}
