/**
 * TYPES - API-FOOTBALL
 * Interfaces TypeScript para las respuestas de API-Football
 */

// ============================================
// PARTIDOS (FIXTURES)
// ============================================

export interface Fixture {
  fixture: {
    id: number;
    date: string;
    timestamp: number;
    status: {
      short: string; // 'FT', 'NS', 'LIVE', etc.
      long: string;
    };
    venue: {
      name: string;
      city: string;
    };
  };
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
}

export interface Team {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
}

// ============================================
// TABLA DE POSICIONES
// ============================================

export interface Standing {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string; // "WWDLL"
  status: string;
  description: string | null;
  all: StandingStats;
  home: StandingStats;
  away: StandingStats;
  update: string;
}

export interface StandingStats {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: {
    for: number;
    against: number;
  };
}

// ============================================
// JUGADORES
// ============================================

export interface Player {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  birth: {
    date: string;
    place: string;
    country: string;
  };
  nationality: string;
  height: string;
  weight: string;
  injured: boolean;
  photo: string;
}

export interface Squad {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  players: Player[];
}

// ============================================
// LESIONADOS
// ============================================

export interface Injury {
  player: {
    id: number;
    name: string;
    photo: string;
    type: string; // "Missing", "Doubtful", etc.
    reason: string;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  fixture: {
    id: number;
    date: string;
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
}

// ============================================
// RESPUESTAS DE LA API
// ============================================

export interface APIResponse<T> {
  get: string;
  parameters: Record<string, any>;
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T;
}

// ============================================
// TIPOS HELPER
// ============================================

export type MatchResult = "win" | "loss" | "draw" | "scheduled";

export interface ProcessedFixture {
  id: number;
  date: Date;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number | string;
  awayTeamId: number | string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore: number | null;
  awayScore: number | null;
  isBocaHome: boolean;
  result: MatchResult;
  status: string;
  venue: string;
}

export interface ProcessedStanding {
  rank: number;
  team: string;
  teamLogo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;
  points: number;
  form: string;
  isBoca: boolean;
}
