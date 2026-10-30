export interface Placement {
  id?: string;
  chart_id?: string;
  planet: string;
  sign: string;
  house: number;
  degree?: number | null;
  nakshatra?: string | null;
  nakshatra_pada?: number | null;
  is_retrograde: boolean;
  is_combust: boolean;
  notes?: string | null;
}

export interface Chart {
  id: string;
  title: string;
  chart_type: 'north_indian' | 'south_indian' | 'east_indian' | 'unknown';
  ascendant_sign?: string | null;
  ascendant_degree?: number | null;
  detected_language: string;
  raw_evidence?: string | null;
  uncertain_fields: string[];
  review_flags: string[];
  is_confirmed: boolean;
  confirmed_at?: string | null;
  calculation_engine: string;
  original_filename?: string | null;
  created_at: string;
  updated_at: string;
  placements: Placement[];
}

export interface SourceReference {
  title: string;
  category: string;
  excerpt: string;
  relevance_score?: number | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  sources: SourceReference[];
  created_at: string;
}

export interface Conversation {
  id: string;
  chart_id?: string | null;
  title: string;
  preferred_language: 'en' | 'hi';
  created_at: string;
  updated_at: string;
  messages: Message[];
  chart?: Chart | null;
}

export interface User {
  id: string;
  email?: string | null;
  is_guest: boolean;
  created_at: string;
}

export interface HealthStatus {
  status: string;
  app_name: string;
  environment: string;
  database_connected: boolean;
  gemini_ai: {
    configured: boolean;
    model: string;
    mode: string;
  };
  rag_vector_db: {
    rag_enabled: boolean;
    is_configured: boolean;
    indexed_chunks: number;
    storage_path: string;
  };
  ephemeris_engine: {
    configured: boolean;
    provenance_mode: string;
  };
}
