export type EnemyKind = "scout" | "dart" | "bomber" | "ace" | "boss";

export interface SpawnOrder {
  kind: EnemyKind;
  count: number;
  lane: number;
}

export interface MissionState {
  wave: number;
  kills: number;
  nextSpawnAt: number;
  bossActive: boolean;
  bossDefeated: boolean;
  waveStartedAt: number;
}

export function createMission(): MissionState {
  return {
    wave: 1,
    kills: 0,
    nextSpawnAt: 0,
    bossActive: false,
    bossDefeated: false,
    waveStartedAt: 0
  };
}

export function killsNeededForWave(wave: number) {
  return 7 + Math.min(11, wave * 2);
}

export function updateMission(
  mission: MissionState,
  now: number,
  activeEnemies: number,
  maxEnemies: number
): SpawnOrder[] {
  if (mission.bossActive || activeEnemies >= maxEnemies || now < mission.nextSpawnAt) {
    return [];
  }

  const wave = mission.wave;
  const bossWave = wave % 4 === 0;
  const threshold = killsNeededForWave(wave);
  if (bossWave && !mission.bossDefeated && mission.kills >= Math.ceil(threshold * 0.64)) {
    mission.bossActive = true;
    mission.nextSpawnAt = now + 2600;
    return [{ kind: "boss", count: 1, lane: 0.5 }];
  }

  const chapter = Math.floor((wave - 1) / 10);
  const count =
    wave > 18 && Math.random() > 0.58
      ? 3
      : wave > 6 && Math.random() > Math.max(0.5, 0.64 - chapter * 0.04)
        ? 2
        : 1;
  mission.nextSpawnAt = now + Math.max(320, 1080 - wave * 48 - chapter * 70 - Math.random() * 220);
  return [{ kind: pickEnemy(wave), count, lane: Math.random() }];
}

export function recordKill(mission: MissionState, kind: EnemyKind) {
  if (kind === "boss") {
    mission.bossActive = false;
    mission.bossDefeated = true;
  } else {
    mission.kills += 1;
  }

  const threshold = killsNeededForWave(mission.wave);
  const waveClear = mission.kills >= threshold && (mission.wave % 4 !== 0 || mission.bossDefeated);
  if (!waveClear) return false;

  mission.wave += 1;
  mission.kills = 0;
  mission.bossDefeated = false;
  mission.nextSpawnAt += 1400;
  mission.waveStartedAt = mission.nextSpawnAt;
  return true;
}

function pickEnemy(wave: number): EnemyKind {
  const roll = Math.random();
  const chapter = Math.floor((wave - 1) / 10);
  if (wave >= 6 && roll > Math.max(0.68, 0.82 - chapter * 0.045)) return "ace";
  if (wave >= 3 && roll > Math.max(0.52, 0.64 - chapter * 0.035)) return "bomber";
  if (wave >= 2 && roll > Math.max(0.3, 0.38 - chapter * 0.02)) return "dart";
  return "scout";
}
