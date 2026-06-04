import type { MatchResult } from "./football";

export interface StandingData {
  rank: number;
  teamId: number | string;
  teamName: string;
  teamLogo: string;
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  zone?: string;
  goalDiff?: number;
}

export interface AnnualStandingData extends StandingData {
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  breakdown: {
    stage: string;
    points: number;
    played: number;
    win: number;
    draw: number;
    lose: number;
  }[];
}

export interface H2HMatch {
  date: string; // ISO
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  result: MatchResult;
  competition?: string; // e.g. "Liga Profesional 2024"
}

export interface LSGroupStanding {
  rank: number;
  points: number | string;
  matches?: number | string;
  played?: number | string;
  won: number | string;
  drawn: number | string;
  lost: number | string;
  goal_diff?: number | string;
  goals_scored?: number | string;
  goals_conceded?: number | string;
  form?: string[];
  team: { id: number | string; name: string; logo?: string };
}

export interface LSGroup {
  id: number | string;
  name: string;
  standings?: LSGroupStanding[];
  table?: LSGroupStanding[];
}

export interface LSAPIStage {
  stage: { id: number | string; name: string };
  groups?: LSGroup[];
  // Fallback for flat-stage responses
  table?: LSGroupStanding[];
  rows?: LSGroupStanding[];
}
