export interface DbFixtureRow {
  id: string | number;
  competition_id: number;
  date: string;
  home_team: string;
  away_team: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  status: 'finished' | 'scheduled' | 'live' | string;
  venue?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbStandingRow {
  competition_id: number;
  rank: number;
  team_id: string;
  team_name: string;
  team_logo?: string | null;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  zone: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbH2HMatch {
  id?: string;
  date: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  status?: string;
  competition?: string;
}

export interface DbH2HRow {
  rival_id: string;
  stats?: {
    boca_wins: number;
    rival_wins: number;
    draws: number;
  };
  last_matches: DbH2HMatch[];
  created_at?: string;
  updated_at?: string;
}

export interface DbSquadRow {
  id?: number | string;
  team_id: string;
  name: string;
  sname?: string;
  num?: string;
  position?: string;
  formation_position?: string;
  age?: number | string | null;
  height?: string | null;
  weight?: string | null;
  country_id?: string;
  birthdate?: string | null;
  is_staff: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      ls_fixtures: {
        Row: DbFixtureRow;
        Insert: DbFixtureRow;
        Update: Partial<DbFixtureRow>;
      };
      ls_matches: {
        Row: DbFixtureRow;
        Insert: DbFixtureRow;
        Update: Partial<DbFixtureRow>;
      };
      ls_standings: {
        Row: DbStandingRow;
        Insert: DbStandingRow;
        Update: Partial<DbStandingRow>;
      };
      ls_h2h: {
        Row: DbH2HRow;
        Insert: DbH2HRow;
        Update: Partial<DbH2HRow>;
      };
      ls_squad: {
        Row: DbSquadRow;
        Insert: DbSquadRow;
        Update: Partial<DbSquadRow>;
      };
    };
  };
}
