import type { MatchResult } from '../types/football';
import type { 
  StandingData, 
  AnnualStandingData, 
  LSGroupStanding, 
  LSAPIStage 
} from '../types/footballApi';

// Helpers / Constants
export const BOCA_ID = '934';
export const BOCA_RE = /boca/i;

const TEAM_ID_MAP: Record<string, string> = {
  '934': 'igg',
  '451': 'igg',
};

// Helper to map LiveScore Team ID to Promiedos Team ID
export const mapTeamIdToPromiedos = (liveScoreId: string): string =>
  TEAM_ID_MAP[liveScoreId] || liveScoreId;

// Helper to construct team logo URLs from Promiedos
export const getTeamLogoUrl = (liveScoreTeamId: string | number): string => {
  const promiedosId = mapTeamIdToPromiedos(String(liveScoreTeamId));
  return `https://api.promiedos.com.ar/images/team/${promiedosId}/1`;
};

// Reconstruct stages/groups structure from database standings rows
export const reconstructStages = (dbRows: any[], compId: number) => {
  const standingsRows = dbRows.map(row => ({
    rank: row.rank,
    points: row.points,
    played: row.played,
    won: row.won,
    drawn: row.drawn,
    lost: row.lost,
    goal_diff: row.goal_diff,
    goals_scored: row.goals_for,
    goals_conceded: row.goals_against,
    team: {
      id: row.team_id,
      name: row.team_name,
      logo: getTeamLogoUrl(row.team_id)
    }
  }));

  const stagesMap = new Map<string, Map<string, typeof standingsRows>>();

  for (let i = 0; i < dbRows.length; i++) {
    const dbRow = dbRows[i];
    const lsRow = standingsRows[i];
    const zone = dbRow.zone || '';

    let stageName = compId === 329 ? 'Fase de Grupos' : 'Primera División';
    let groupName = '';

    if (zone) {
      if (zone.includes(' - Zona ')) {
        const parts = zone.split(' - Zona ');
        stageName = parts[0];
        groupName = parts[1];
      } else if (zone.startsWith('Grupo ')) {
        stageName = 'Fase de Grupos';
        groupName = zone.replace('Grupo ', '');
      } else {
        stageName = zone;
      }
    }

    if (!stagesMap.has(stageName)) {
      stagesMap.set(stageName, new Map());
    }
    const groupsMap = stagesMap.get(stageName)!;
    
    if (!groupsMap.has(groupName)) {
      groupsMap.set(groupName, []);
    }
    groupsMap.get(groupName)!.push(lsRow);
  }

  const stages = Array.from(stagesMap.entries()).map(([stageName, groupsMap]) => {
    const stageObj: any = {
      stage: { id: stageName, name: stageName }
    };

    const groupEntries = Array.from(groupsMap.entries());
    if (groupEntries.length === 1 && groupEntries[0][0] === '') {
      // Flat stage (no groups)
      stageObj.table = groupEntries[0][1];
    } else {
      // Grouped stage
      stageObj.groups = groupEntries.map(([gName, rows]) => ({
        id: gName,
        name: gName,
        standings: rows
      }));
    }
    return stageObj;
  });

  return { stages };
};

/**
 * Convierte un identificador de texto alfanumérico en un número único.
 * Útil para mapear IDs alfanuméricos de equipos a IDs numéricos de tipo indexado.
 */
export const hashStringToNumber = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Conversión a entero de 32 bits
  }
  return Math.abs(hash);
};

/**
 * Convierte un valor (número o cadena) a tipo numérico de manera segura.
 */
export const n = (v: number | string | undefined): number => (v !== undefined ? Number(v) : 0);

const STAGE_NAME_MAPPINGS = [
  { keys: ['zona a'], value: 'Zona A' },
  { keys: ['zona b'], value: 'Zona B' },
  { keys: ['promedios', 'relegation'], value: 'Promedios' },
  { keys: ['tabla anual', 'anual'], value: 'Tabla Anual' },
  { keys: ['1', 'first', 'apertura'], value: 'Apertura' },
  { keys: ['2', 'second', 'clausura'], value: 'Clausura' },
];

/**
 * Simplifica y estandariza los nombres de fases y zonas de torneos de fútbol argentino.
 */
export const mapStageName = (name: string): string => {
  const lower = name.toLowerCase();
  const match = STAGE_NAME_MAPPINGS.find(m => m.keys.some(key => lower.includes(key)));
  return match ? match.value : name;
};

/**
 * Mapea una fila de posiciones cruda de la API al objeto unificado StandingData del frontend.
 */
export const mapStandingRow = (row: LSGroupStanding, zone?: string): StandingData => ({
  rank: n(row.rank),
  teamId: row.team.id,
  teamName: row.team.name,
  teamLogo: row.team.logo ?? '',
  points: n(row.points),
  played: n(row.matches ?? row.played),
  win: n(row.won),
  draw: n(row.drawn),
  lose: n(row.lost),
  zone,
  goalDiff: n(row.goal_diff),
});

/**
 * Obtiene todas las filas de posiciones agrupadas por zona de forma aplanada.
 */
export const getStageRows = (apiStage: LSAPIStage): Array<{ row: LSGroupStanding; zone?: string }> => {
  const stageName = apiStage.stage?.name ?? '';
  const mappedStage = mapStageName(stageName);
  const groups = apiStage.groups ?? [];

  if (groups.length > 0) {
    return groups.flatMap((group) => {
      const rows = group.standings ?? group.table ?? [];
      const zoneName = `${mappedStage} - Zona ${group.name}`;
      return rows.map((row) => ({ row, zone: zoneName }));
    });
  }

  const rows = apiStage.table ?? apiStage.rows ?? [];
  return rows.map((row) => ({ row, zone: mappedStage || undefined }));
};

/**
 * Evalúa si una fase/etapa es apta para agregarse en la tabla anual acumulada de puntos.
 */
export const isAnnualStageCandidate = (stageName: string): boolean => {
  const lower = stageName.trim().toLowerCase();
  if (!lower) return true;
  return (
    lower.includes('apertura') ||
    lower.includes('clausura') ||
    lower.includes('phase 1') ||
    lower.includes('phase 2') ||
    lower.includes('first') ||
    lower.includes('second') ||
    lower === '1' ||
    lower === '2'
  );
};

/**
 * Procesa y ordena las posiciones de las diferentes etapas y grupos de la liga local.
 */
export const mapLeagueStandings = (data: {
  stages?: LSAPIStage[];
  table?: LSGroupStanding[];
}): StandingData[] => {
  const result: StandingData[] = [];
  const stages = [...(data.stages ?? [])];

  const stageOrder: Record<string, number> = {
    'Clausura': 1,
    'Apertura': 2,
    'Zona A': 3,
    'Zona B': 4,
    'Tabla Anual': 5,
    'Promedios': 6,
  };

  // Ordenar las etapas según el orden solicitado para mostrarlas en ese orden en el selector
  stages.sort((a, b) => {
    const nameA = mapStageName(a.stage?.name ?? '');
    const nameB = mapStageName(b.stage?.name ?? '');
    const orderA = stageOrder[nameA] ?? 99;
    const orderB = stageOrder[nameB] ?? 99;
    return orderA - orderB;
  });

  for (const apiStage of stages) {
    const stageName = apiStage.stage?.name ?? '';
    const mappedStage = mapStageName(stageName);
    const groups = apiStage.groups ?? [];

    if (groups.length > 0) {
      for (const group of groups) {
        const rows = group.standings ?? group.table ?? [];
        const zoneName = `${mappedStage} - Zona ${group.name}`;
        for (const row of rows) {
          result.push(mapStandingRow(row, zoneName));
        }
      }
    } else {
      const rows = apiStage.table ?? apiStage.rows ?? [];
      for (const row of rows) {
        result.push(mapStandingRow(row, mappedStage || undefined));
      }
    }
  }

  if (stages.length === 0 && data.table) {
    for (const row of data.table) {
      result.push(mapStandingRow(row));
    }
  }

  return result;
};

/**
 * Formatea y normaliza el nombre del grupo para la Copa Libertadores.
 */
export const formatLibertadoresGroupName = (groupName: string): string => {
  const trimmed = groupName.trim();
  if (!trimmed) return 'Grupo';
  return /^grupo\b/i.test(trimmed) ? trimmed : `Grupo ${trimmed}`;
};

/**
 * Mapea y procesa las posiciones correspondientes a la fase de grupos de la Copa Libertadores.
 */
export const mapLibertadoresStandings = (data: {
  stages?: LSAPIStage[];
  table?: LSGroupStanding[];
}): StandingData[] => {
  const result: StandingData[] = [];
  const stages = data.stages ?? [];

  for (const apiStage of stages) {
    const stageName = apiStage.stage?.name?.trim();
    const groups = apiStage.groups ?? [];

    if (groups.length > 0) {
      for (const group of groups) {
        const rows = group.standings ?? group.table ?? [];
        const zoneName = formatLibertadoresGroupName(group.name);
        for (const row of rows) {
          result.push(mapStandingRow(row, zoneName));
        }
      }
      continue;
    }

    const rows = apiStage.table ?? apiStage.rows ?? [];
    for (const row of rows) {
      result.push(mapStandingRow(row, stageName || undefined));
    }
  }

  if (stages.length === 0 && data.table) {
    for (const row of data.table) {
      result.push(mapStandingRow(row));
    }
  }

  return result;
};

/**
 * Genera la tabla acumulada anual a partir de las etapas jugadas (Apertura + Clausura).
 */
export const mapAnnualStandings = (data: {
  stages?: LSAPIStage[];
  table?: LSGroupStanding[];
}): AnnualStandingData[] => {
  const stages = data.stages ?? [];
  const selectedStages = stages.filter((apiStage) =>
    isAnnualStageCandidate(apiStage.stage?.name ?? '')
  );
  const stagesToAggregate = selectedStages.length > 0 ? selectedStages : stages;
  const annualMap = new Map<number, AnnualStandingData>();

  for (const [stageIndex, apiStage] of stagesToAggregate.entries()) {
    const stageLabel =
      mapStageName(apiStage.stage?.name ?? '') || `Etapa ${stageIndex + 1}`;
    const stageRows = getStageRows(apiStage);

    for (const { row } of stageRows) {
      const teamId = Number(row.team.id);
      const existing = annualMap.get(teamId);
      const points = n(row.points);
      const played = n(row.matches ?? row.played);
      const win = n(row.won);
      const draw = n(row.drawn);
      const lose = n(row.lost);
      const goalsFor = n(row.goals_scored);
      const goalsAgainst = n(row.goals_conceded);
      const goalDiff = n(row.goal_diff);

      if (existing) {
        existing.points += points;
        existing.played += played;
        existing.win += win;
        existing.draw += draw;
        existing.lose += lose;
        existing.goalsFor += goalsFor;
        existing.goalsAgainst += goalsAgainst;
        existing.goalDiff += goalDiff;
        existing.breakdown.push({
          stage: stageLabel,
          points,
          played,
          win,
          draw,
          lose,
        });
        continue;
      }

      annualMap.set(teamId, {
        rank: 0,
        teamId,
        teamName: row.team.name,
        teamLogo: row.team.logo ?? '',
        points,
        played,
        win,
        draw,
        lose,
        zone: undefined,
        goalsFor,
        goalsAgainst,
        goalDiff,
        breakdown: [
          {
            stage: stageLabel,
            points,
            played,
            win,
            draw,
            lose,
          },
        ],
      });
    }
  }

  if (annualMap.size === 0 && data.table) {
    return data.table
      .map((row) => ({
        ...mapStandingRow(row),
        zone: undefined,
        goalsFor: n(row.goals_scored),
        goalsAgainst: n(row.goals_conceded),
        goalDiff: n(row.goal_diff),
        breakdown: [
          {
            stage: 'Tabla general',
            points: n(row.points),
            played: n(row.matches ?? row.played),
            win: n(row.won),
            draw: n(row.drawn),
            lose: n(row.lost),
          },
        ],
      }))
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.goalDiff - a.goalDiff ||
          b.goalsFor - a.goalsFor ||
          a.teamName.localeCompare(b.teamName)
      )
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }

  return Array.from(annualMap.values())
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDiff - a.goalDiff ||
        b.goalsFor - a.goalsFor ||
        a.teamName.localeCompare(b.teamName)
    )
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      breakdown: row.breakdown.sort((a, b) => a.stage.localeCompare(b.stage)),
    }));
};

/**
 * Evalúa y retorna el resultado de un partido (victoria, empate, derrota) desde la perspectiva de Boca.
 */
export const matchResult = (
  homeScore: number | null,
  awayScore: number | null,
  isBocaHome: boolean
): MatchResult => {
  if (homeScore === null || awayScore === null) return 'scheduled';
  if (homeScore === awayScore) return 'draw';
  const bocaWon = isBocaHome ? homeScore > awayScore : awayScore > homeScore;
  return bocaWon ? 'win' : 'loss';
};
