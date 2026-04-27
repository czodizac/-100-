export const GAME_EVENTS = {
  start: "skystrike:start",
  restart: "skystrike:restart",
  pause: "skystrike:pause",
  burst: "skystrike:burst",
  volume: "skystrike:volume",
  hud: "skystrike:hud",
  menu: "skystrike:menu",
  toast: "skystrike:toast",
  comms: "skystrike:comms",
  runEnd: "skystrike:run-end"
} as const;

export type GameMode = "menu" | "playing" | "paused" | "gameover";

export interface HudState {
  mode: GameMode;
  score: number;
  wave: number;
  hp: number;
  charge: number;
  weaponLevel: number;
}

export interface MenuState {
  mode: GameMode;
  title: string;
  message: string;
}

export interface CommsState {
  speaker: string;
  message: string;
  tone?: "ally" | "warning" | "system";
}

export interface VolumeState {
  music: number;
  sfx: number;
}

export interface RunResult {
  score: number;
  wave: number;
}

export function emitHud(detail: HudState) {
  window.dispatchEvent(new CustomEvent(GAME_EVENTS.hud, { detail }));
}

export function emitMenu(detail: MenuState) {
  window.dispatchEvent(new CustomEvent(GAME_EVENTS.menu, { detail }));
}

export function emitToast(message: string) {
  window.dispatchEvent(new CustomEvent(GAME_EVENTS.toast, { detail: { message } }));
}

export function emitComms(detail: CommsState) {
  window.dispatchEvent(new CustomEvent(GAME_EVENTS.comms, { detail }));
}

export function emitRunEnd(detail: RunResult) {
  window.dispatchEvent(new CustomEvent(GAME_EVENTS.runEnd, { detail }));
}
