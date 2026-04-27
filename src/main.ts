import Phaser from "phaser";
import { GameScene } from "./game/scenes/GameScene";
import { GAME_EVENTS, type CommsState, type HudState, type MenuState, type RunResult, type VolumeState } from "./game/events";
import "./styles.css";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-canvas",
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#050615",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 }
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight
  },
  scene: [GameScene],
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
    powerPreference: "high-performance"
  }
};

new Phaser.Game(config);

const hud = document.querySelector<HTMLElement>(".hud");
const menuPanel = document.querySelector<HTMLElement>("#menu-panel");
const score = document.querySelector<HTMLElement>("#hud-score");
const wave = document.querySelector<HTMLElement>("#hud-wave");
const weapon = document.querySelector<HTMLElement>("#hud-weapon");
const hp = document.querySelector<HTMLElement>("#hud-hp");
const charge = document.querySelector<HTMLElement>("#hud-charge");
const hpBar = document.querySelector<HTMLElement>("#hud-hp-bar");
const chargeBar = document.querySelector<HTMLElement>("#hud-charge-bar");
const toast = document.querySelector<HTMLElement>("#toast");
const storyPanel = document.querySelector<HTMLElement>("#story-panel");
const storySpeaker = document.querySelector<HTMLElement>("#story-speaker");
const storyText = document.querySelector<HTMLElement>("#story-text");
const startButton = document.querySelector<HTMLButtonElement>("#start-button");
const restartButton = document.querySelector<HTMLButtonElement>("#restart-button");
const pauseButton = document.querySelector<HTMLButtonElement>("#pause-button");
const burstButton = document.querySelector<HTMLButtonElement>("#burst-button");
const musicVolume = document.querySelector<HTMLInputElement>("#music-volume");
const sfxVolume = document.querySelector<HTMLInputElement>("#sfx-volume");
const leaderboardList = document.querySelector<HTMLOListElement>("#leaderboard-list");

let toastTimer = 0;
let storyTimer = 0;
const leaderboardKey = "skystrike:leaderboard";
const volumeKey = "skystrike:volume";

interface LeaderboardEntry {
  score: number;
  wave: number;
  date: string;
}

function fire<T>(name: string, detail?: T) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function loadLeaderboard() {
  try {
    const stored = window.localStorage.getItem(leaderboardKey);
    const parsed = stored ? (JSON.parse(stored) as LeaderboardEntry[]) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]) {
  window.localStorage.setItem(leaderboardKey, JSON.stringify(entries.slice(0, 8)));
}

function renderLeaderboard() {
  if (!leaderboardList) return;
  const entries = loadLeaderboard();
  leaderboardList.replaceChildren();
  if (entries.length === 0) {
    const item = document.createElement("li");
    item.className = "leaderboard__empty";
    item.textContent = "暂无战绩";
    leaderboardList.append(item);
    return;
  }
  entries.slice(0, 5).forEach((entry) => {
    const item = document.createElement("li");
    const scoreText = entry.score.toLocaleString("zh-CN");
    item.innerHTML = `<span>第 ${entry.wave} 波</span><strong>${scoreText}</strong>`;
    leaderboardList.append(item);
  });
}

function recordRun(result: RunResult) {
  const next = [
    ...loadLeaderboard(),
    {
      score: result.score,
      wave: result.wave,
      date: new Date().toISOString()
    }
  ]
    .sort((a, b) => b.score - a.score || b.wave - a.wave)
    .slice(0, 8);
  saveLeaderboard(next);
  renderLeaderboard();
}

function readVolumeControls(): VolumeState {
  return {
    music: Number(musicVolume?.value ?? 78) / 100,
    sfx: Number(sfxVolume?.value ?? 84) / 100
  };
}

function saveVolumeControls() {
  const detail = readVolumeControls();
  window.localStorage.setItem(volumeKey, JSON.stringify(detail));
  fire(GAME_EVENTS.volume, detail);
}

function restoreVolumeControls() {
  try {
    const stored = window.localStorage.getItem(volumeKey);
    if (!stored) return;
    const parsed = JSON.parse(stored) as Partial<VolumeState>;
    if (musicVolume && typeof parsed.music === "number") musicVolume.value = String(Math.round(parsed.music * 100));
    if (sfxVolume && typeof parsed.sfx === "number") sfxVolume.value = String(Math.round(parsed.sfx * 100));
  } catch {
    // Keep defaults if the browser has stale settings.
  }
}

startButton?.addEventListener("click", () => {
  saveVolumeControls();
  fire(GAME_EVENTS.start);
});
restartButton?.addEventListener("click", () => {
  saveVolumeControls();
  fire(GAME_EVENTS.restart);
});
pauseButton?.addEventListener("click", () => fire(GAME_EVENTS.pause));
burstButton?.addEventListener("click", () => fire(GAME_EVENTS.burst));
musicVolume?.addEventListener("input", saveVolumeControls);
sfxVolume?.addEventListener("input", saveVolumeControls);

restoreVolumeControls();
renderLeaderboard();
window.setTimeout(saveVolumeControls, 0);

window.addEventListener(GAME_EVENTS.hud, (event) => {
  const detail = (event as CustomEvent<HudState>).detail;
  if (!detail) return;

  if (hud) hud.dataset.state = detail.mode;
  if (score) score.textContent = detail.score.toLocaleString("zh-CN");
  if (wave) wave.textContent = String(detail.wave);
  if (weapon) weapon.textContent = `Lv.${detail.weaponLevel}`;
  if (hp) hp.textContent = String(Math.max(0, Math.round(detail.hp)));
  if (charge) charge.textContent = `${Math.round(detail.charge)}%`;
  if (hpBar) hpBar.style.width = `${Math.max(0, Math.min(100, detail.hp))}%`;
  if (chargeBar) chargeBar.style.width = `${Math.max(0, Math.min(100, detail.charge))}%`;
  if (burstButton) burstButton.toggleAttribute("data-ready", detail.charge >= 100);
});

window.addEventListener(GAME_EVENTS.menu, (event) => {
  const detail = (event as CustomEvent<MenuState>).detail;
  if (!detail || !menuPanel) return;
  menuPanel.dataset.mode = detail.mode;
  menuPanel.toggleAttribute("hidden", detail.mode === "playing");

  const title = menuPanel.querySelector("h1");
  const tagline = menuPanel.querySelector(".tagline");
  if (title) title.textContent = detail.title;
  if (tagline) tagline.textContent = detail.message;
  if (startButton) {
    startButton.textContent =
      detail.mode === "paused" ? "继续挑战" : detail.mode === "gameover" ? "再撑一次" : "开始挑战";
  }
  if (pauseButton) {
    pauseButton.toggleAttribute("data-paused", detail.mode === "paused");
    pauseButton.setAttribute("aria-label", detail.mode === "paused" ? "继续" : "暂停");
  }
});

window.addEventListener(GAME_EVENTS.runEnd, (event) => {
  const detail = (event as CustomEvent<RunResult>).detail;
  if (!detail) return;
  recordRun(detail);
});

window.addEventListener(GAME_EVENTS.toast, (event) => {
  const detail = (event as CustomEvent<{ message: string }>).detail;
  if (!detail || !toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = detail.message;
  toast.classList.add("toast--visible");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("toast--visible");
  }, 1600);
});

window.addEventListener(GAME_EVENTS.comms, (event) => {
  const detail = (event as CustomEvent<CommsState>).detail;
  if (!detail || !storyPanel || !storySpeaker || !storyText) return;
  window.clearTimeout(storyTimer);
  storyPanel.dataset.tone = detail.tone ?? "ally";
  storySpeaker.textContent = detail.speaker;
  storyText.textContent = detail.message;
  storyPanel.classList.add("story-panel--visible");
  storyTimer = window.setTimeout(() => {
    storyPanel.classList.remove("story-panel--visible");
  }, 5200);
});
