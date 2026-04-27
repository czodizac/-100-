import Phaser from "phaser";

export const ASSETS = {
  player: "ship:player",
  scout: "enemy:scout",
  dart: "enemy:dart",
  bomber: "enemy:bomber",
  ace: "enemy:ace",
  boss: "enemy:boss",
  bullet: "projectile:player",
  bulletIon: "projectile:ion",
  bulletShard: "projectile:shard",
  bulletMissile: "projectile:missile",
  bulletLance: "projectile:lance",
  enemyBullet: "projectile:enemy",
  spark: "fx:spark",
  ring: "fx:ring",
  shipShadow: "fx:ship-shadow",
  depthFlare: "fx:depth-flare",
  power: "item:power",
  repair: "item:repair",
  shield: "item:shield",
  starTileA: "background:stars:a",
  starTileB: "background:stars:b",
  mistTile: "background:mist",
  nebula: "background:nebula",
  nebulaStorm: "background:nebula:storm",
  nebulaRift: "background:nebula:rift",
  nebulaCore: "background:nebula:core",
  nebulaEclipse: "background:nebula:eclipse",
  nebulaAurora: "background:nebula:aurora",
  speed: "item:speed",
  planet: "background:planet",
  spaceDebris: "background:debris"
} as const;

export function createGeneratedAssets(scene: Phaser.Scene) {
  createBackgrounds(scene);
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  g.clear();
  g.fillStyle(0x4fe7ff, 0.22);
  g.fillTriangle(48, 0, 6, 98, 48, 82);
  g.fillTriangle(48, 0, 90, 98, 48, 82);
  g.fillStyle(0xa57bff, 0.2);
  g.fillTriangle(48, 20, 0, 88, 19, 98);
  g.fillTriangle(48, 20, 96, 88, 77, 98);
  g.fillStyle(0x041a3a, 0.74);
  g.fillTriangle(48, 28, 14, 100, 48, 78);
  g.fillTriangle(48, 28, 82, 100, 48, 78);
  g.fillStyle(0x0b2b62, 1);
  g.fillRoundedRect(37, 20, 22, 66, 10);
  g.fillStyle(0xeafcff, 1);
  g.fillTriangle(48, 6, 24, 88, 48, 72);
  g.fillStyle(0x1ed7ff, 1);
  g.fillTriangle(48, 6, 72, 88, 48, 72);
  g.fillStyle(0x0b1338, 0.72);
  g.fillTriangle(48, 56, 31, 92, 48, 78);
  g.fillTriangle(48, 56, 65, 92, 48, 78);
  g.fillStyle(0xffffff, 0.7);
  g.fillTriangle(48, 10, 39, 58, 48, 45);
  g.fillStyle(0xffd166, 1);
  g.fillEllipse(48, 44, 18, 34);
  g.lineStyle(2, 0x4fe7ff, 0.5);
  g.strokeEllipse(48, 44, 22, 40);
  g.fillStyle(0xffffff, 0.46);
  g.fillEllipse(43, 36, 6, 12);
  g.fillStyle(0xb6ff6d, 1);
  g.fillRect(42, 76, 12, 18);
  g.fillStyle(0xffd166, 0.82);
  g.fillRect(36, 86, 7, 14);
  g.fillRect(53, 86, 7, 14);
  g.fillStyle(0x4fe7ff, 0.46);
  g.fillCircle(24, 84, 5);
  g.fillCircle(72, 84, 5);
  g.lineStyle(2, 0xffffff, 0.62);
  g.strokeTriangle(48, 5, 10, 96, 48, 76);
  g.strokeTriangle(48, 5, 86, 96, 48, 76);
  g.generateTexture(ASSETS.player, 96, 108);
  createPlayer3DTexture(scene);

  g.clear();
  g.fillStyle(0xff6f61, 0.18);
  g.fillCircle(36, 36, 34);
  g.fillStyle(0x1b1038, 0.82);
  g.fillRoundedRect(20, 18, 32, 42, 10);
  g.fillStyle(0xff6f61, 1);
  g.fillTriangle(36, 4, 8, 54, 36, 68);
  g.fillStyle(0xa57bff, 1);
  g.fillTriangle(36, 4, 64, 54, 36, 68);
  g.fillStyle(0xffd166, 0.8);
  g.fillRect(18, 52, 8, 10);
  g.fillRect(46, 52, 8, 10);
  g.fillStyle(0xffffff, 0.8);
  g.fillCircle(36, 34, 8);
  g.lineStyle(2, 0xffffff, 0.34);
  g.strokeTriangle(36, 5, 10, 53, 36, 66);
  g.strokeTriangle(36, 5, 62, 53, 36, 66);
  g.generateTexture(ASSETS.scout, 72, 72);

  g.clear();
  g.fillStyle(0xa57bff, 0.2);
  g.fillCircle(30, 34, 28);
  g.fillStyle(0x120c2e, 0.76);
  g.fillEllipse(30, 37, 24, 42);
  g.fillStyle(0xa57bff, 1);
  g.fillTriangle(30, 4, 6, 62, 30, 48);
  g.fillTriangle(30, 4, 54, 62, 30, 48);
  g.fillStyle(0xb6ff6d, 0.85);
  g.fillTriangle(30, 14, 20, 58, 30, 49);
  g.fillTriangle(30, 14, 40, 58, 30, 49);
  g.fillStyle(0x4fe7ff, 0.84);
  g.fillCircle(30, 24, 7);
  g.lineStyle(2, 0xffffff, 0.28);
  g.strokeEllipse(30, 35, 26, 46);
  g.generateTexture(ASSETS.dart, 60, 68);

  g.clear();
  g.fillStyle(0xff3d74, 0.2);
  g.fillRoundedRect(4, 8, 88, 72, 20);
  g.fillStyle(0x2d1028, 0.9);
  g.fillRoundedRect(18, 22, 56, 44, 16);
  g.fillStyle(0xff6f61, 1);
  g.fillTriangle(46, 4, 4, 76, 46, 58);
  g.fillStyle(0xffd166, 1);
  g.fillTriangle(46, 4, 88, 76, 46, 58);
  g.fillStyle(0xa57bff, 0.72);
  g.fillRect(14, 58, 16, 14);
  g.fillRect(62, 58, 16, 14);
  g.fillStyle(0x170714, 0.64);
  g.fillEllipse(46, 38, 28, 20);
  g.lineStyle(3, 0xffffff, 0.28);
  g.strokeRoundedRect(18, 22, 56, 44, 16);
  g.generateTexture(ASSETS.bomber, 96, 88);

  g.clear();
  g.fillStyle(0xb6ff6d, 0.18);
  g.fillCircle(34, 34, 32);
  g.fillStyle(0x07251c, 0.78);
  g.fillRoundedRect(20, 13, 28, 46, 12);
  g.fillStyle(0xb6ff6d, 1);
  g.fillTriangle(34, 2, 4, 42, 34, 66);
  g.fillStyle(0x4fe7ff, 1);
  g.fillTriangle(34, 2, 64, 42, 34, 66);
  g.fillStyle(0xffd166, 0.8);
  g.fillCircle(16, 44, 5);
  g.fillCircle(52, 44, 5);
  g.fillStyle(0xffffff, 0.82);
  g.fillEllipse(34, 28, 10, 18);
  g.lineStyle(2, 0xffffff, 0.32);
  g.strokeTriangle(34, 4, 5, 42, 34, 65);
  g.strokeTriangle(34, 4, 63, 42, 34, 65);
  g.generateTexture(ASSETS.ace, 68, 72);

  g.clear();
  g.fillStyle(0xff6f61, 0.22);
  g.fillEllipse(110, 74, 214, 128);
  g.fillStyle(0x16071c, 0.9);
  g.fillRoundedRect(34, 44, 152, 58, 22);
  g.fillStyle(0x54152d, 1);
  g.fillRoundedRect(18, 30, 184, 88, 26);
  g.fillStyle(0xff6f61, 1);
  g.fillTriangle(110, 4, 20, 126, 110, 96);
  g.fillStyle(0xa57bff, 1);
  g.fillTriangle(110, 4, 200, 126, 110, 96);
  g.fillStyle(0x4fe7ff, 0.24);
  g.fillRoundedRect(44, 44, 132, 16, 8);
  g.fillStyle(0xffd166, 0.72);
  g.fillCircle(44, 100, 9);
  g.fillCircle(176, 100, 9);
  g.fillStyle(0xffd166, 0.9);
  g.fillEllipse(110, 58, 58, 30);
  g.fillStyle(0xffffff, 0.52);
  g.fillEllipse(96, 48, 16, 8);
  g.lineStyle(3, 0xffffff, 0.44);
  g.strokeRoundedRect(18, 30, 184, 88, 26);
  g.lineStyle(2, 0xffd166, 0.36);
  g.strokeEllipse(110, 74, 170, 72);
  g.generateTexture(ASSETS.boss, 220, 148);

  g.clear();
  g.fillStyle(0x4fe7ff, 0.3);
  g.fillRoundedRect(2, 0, 14, 34, 8);
  g.fillStyle(0xeaffff, 1);
  g.fillRoundedRect(6, 0, 6, 30, 5);
  g.generateTexture(ASSETS.bullet, 18, 36);

  g.clear();
  g.fillStyle(0x4fe7ff, 0.18);
  g.fillCircle(16, 20, 16);
  g.fillStyle(0xb6ff6d, 0.9);
  g.fillRoundedRect(8, 2, 16, 36, 8);
  g.fillStyle(0xffffff, 1);
  g.fillRoundedRect(12, 4, 8, 28, 5);
  g.generateTexture(ASSETS.bulletIon, 32, 42);

  g.clear();
  g.fillStyle(0xa57bff, 0.28);
  g.fillTriangle(18, 0, 2, 38, 18, 28);
  g.fillStyle(0x4fe7ff, 0.92);
  g.fillTriangle(18, 0, 34, 38, 18, 28);
  g.fillStyle(0xffffff, 0.7);
  g.fillTriangle(18, 6, 12, 30, 18, 23);
  g.generateTexture(ASSETS.bulletShard, 36, 42);

  g.clear();
  g.fillStyle(0xffd166, 0.22);
  g.fillEllipse(18, 22, 32, 42);
  g.fillStyle(0xff6f61, 0.96);
  g.fillTriangle(18, 0, 4, 34, 18, 28);
  g.fillStyle(0xffd166, 0.96);
  g.fillTriangle(18, 0, 32, 34, 18, 28);
  g.fillStyle(0xffffff, 0.78);
  g.fillRect(15, 11, 6, 22);
  g.generateTexture(ASSETS.bulletMissile, 36, 48);

  g.clear();
  g.fillStyle(0x4fe7ff, 0.16);
  g.fillRoundedRect(0, 0, 26, 74, 12);
  g.fillStyle(0xffffff, 0.92);
  g.fillRoundedRect(10, 0, 6, 66, 5);
  g.fillStyle(0xb6ff6d, 0.72);
  g.fillRoundedRect(6, 6, 14, 48, 7);
  g.generateTexture(ASSETS.bulletLance, 26, 76);

  g.clear();
  g.fillStyle(0xff6f61, 0.28);
  g.fillCircle(12, 12, 12);
  g.fillStyle(0xffd166, 1);
  g.fillCircle(12, 12, 5);
  g.generateTexture(ASSETS.enemyBullet, 24, 24);

  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(4, 4, 4);
  g.generateTexture(ASSETS.spark, 8, 8);

  g.clear();
  g.lineStyle(4, 0x4fe7ff, 0.8);
  g.strokeCircle(44, 44, 36);
  g.lineStyle(2, 0xb6ff6d, 0.5);
  g.strokeCircle(44, 44, 26);
  g.generateTexture(ASSETS.ring, 88, 88);

  g.clear();
  g.fillStyle(0x000000, 0.24);
  g.fillEllipse(64, 36, 118, 46);
  g.generateTexture(ASSETS.shipShadow, 128, 72);

  g.clear();
  g.fillStyle(0x4fe7ff, 0.24);
  g.fillCircle(36, 36, 34);
  g.fillStyle(0xffffff, 0.48);
  g.fillCircle(36, 36, 10);
  g.generateTexture(ASSETS.depthFlare, 72, 72);

  createPowerTexture(g, ASSETS.power, 0x4fe7ff, 0xa57bff);
  createPowerTexture(g, ASSETS.repair, 0xb6ff6d, 0x4fe7ff);
  createPowerTexture(g, ASSETS.shield, 0xffd166, 0xff6f61);
  createPowerTexture(g, ASSETS.speed, 0xb6ff6d, 0xffd166);

  g.destroy();
}

function createPlayer3DTexture(scene: Phaser.Scene) {
  if (scene.textures.exists(ASSETS.player)) {
    scene.textures.remove(ASSETS.player);
  }

  const texture = scene.textures.createCanvas(ASSETS.player, 112, 128);
  if (!texture) return;
  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(56, 64);

  const outerGlow = ctx.createRadialGradient(0, -4, 8, 0, 2, 62);
  outerGlow.addColorStop(0, "rgba(79, 231, 255, 0.22)");
  outerGlow.addColorStop(0.5, "rgba(165, 123, 255, 0.14)");
  outerGlow.addColorStop(1, "rgba(79, 231, 255, 0)");
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.ellipse(0, 5, 54, 62, 0, 0, Math.PI * 2);
  ctx.fill();

  const leftWing = ctx.createLinearGradient(-48, -36, -4, 52);
  leftWing.addColorStop(0, "#e8fbff");
  leftWing.addColorStop(0.38, "#33dfff");
  leftWing.addColorStop(1, "#071a3c");
  ctx.fillStyle = leftWing;
  ctx.beginPath();
  ctx.moveTo(0, -58);
  ctx.lineTo(-51, 45);
  ctx.lineTo(-16, 66);
  ctx.lineTo(0, 14);
  ctx.closePath();
  ctx.fill();

  const rightWing = ctx.createLinearGradient(48, -36, 4, 52);
  rightWing.addColorStop(0, "#e8fbff");
  rightWing.addColorStop(0.34, "#8b6cff");
  rightWing.addColorStop(1, "#1c0a36");
  ctx.fillStyle = rightWing;
  ctx.beginPath();
  ctx.moveTo(0, -58);
  ctx.lineTo(51, 45);
  ctx.lineTo(16, 66);
  ctx.lineTo(0, 14);
  ctx.closePath();
  ctx.fill();

  const hull = ctx.createLinearGradient(0, -60, 0, 62);
  hull.addColorStop(0, "#ffffff");
  hull.addColorStop(0.18, "#bdf8ff");
  hull.addColorStop(0.54, "#168fe7");
  hull.addColorStop(1, "#071936");
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(0, -62);
  ctx.bezierCurveTo(18, -38, 22, 22, 11, 64);
  ctx.lineTo(-11, 64);
  ctx.bezierCurveTo(-22, 22, -18, -38, 0, -62);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.62)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -61);
  ctx.bezierCurveTo(18, -38, 22, 24, 10, 62);
  ctx.lineTo(-10, 62);
  ctx.bezierCurveTo(-22, 24, -18, -38, 0, -61);
  ctx.closePath();
  ctx.stroke();

  const canopy = ctx.createRadialGradient(-5, -23, 2, 1, -15, 23);
  canopy.addColorStop(0, "#fff6b8");
  canopy.addColorStop(0.44, "#ffd166");
  canopy.addColorStop(1, "#8c3a3f");
  ctx.fillStyle = canopy;
  ctx.beginPath();
  ctx.ellipse(0, -18, 12, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.beginPath();
  ctx.ellipse(-4, -26, 4, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(182, 255, 109, 0.95)";
  ctx.fillRect(-7, 48, 14, 17);
  ctx.fillStyle = "rgba(255, 209, 102, 0.9)";
  ctx.fillRect(-23, 55, 9, 17);
  ctx.fillRect(14, 55, 9, 17);
  ctx.fillStyle = "rgba(79, 231, 255, 0.42)";
  ctx.beginPath();
  ctx.ellipse(-30, 43, 8, 14, -0.18, 0, Math.PI * 2);
  ctx.ellipse(30, 43, 8, 14, 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  texture.refresh();
}

function createNebulaTexture(scene: Phaser.Scene, key: string, colors: string[], blobs: string[]) {
  const texture = scene.textures.createCanvas(key, 900, 1400);
  if (!texture) return;
  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / Math.max(1, colors.length - 1), color);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  paintBlob(ctx, 160, 260, 240, blobs[0]);
  paintBlob(ctx, 720, 520, 280, blobs[1]);
  paintBlob(ctx, 380, 960, 320, blobs[2]);
  paintBlob(ctx, 120, 1180, 220, blobs[3]);
  texture.refresh();
}

function createPowerTexture(
  g: Phaser.GameObjects.Graphics,
  key: string,
  outer: number,
  inner: number
) {
  g.clear();
  g.fillStyle(outer, 0.28);
  g.fillCircle(28, 28, 26);
  g.lineStyle(3, outer, 0.72);
  g.strokeCircle(28, 28, 19);
  g.fillStyle(inner, 1);
  g.fillCircle(28, 28, 9);
  g.generateTexture(key, 56, 56);
}

function createBackgrounds(scene: Phaser.Scene) {
  createNebulaTexture(scene, ASSETS.nebula, ["#071126", "#141044", "#241039", "#050615"], [
    "rgba(79, 231, 255, 0.16)",
    "rgba(255, 111, 97, 0.14)",
    "rgba(165, 123, 255, 0.14)",
    "rgba(255, 209, 102, 0.1)"
  ]);
  createNebulaTexture(scene, ASSETS.nebulaStorm, ["#061c2e", "#0b3850", "#142652", "#050615"], [
    "rgba(79, 231, 255, 0.24)",
    "rgba(182, 255, 109, 0.13)",
    "rgba(255, 255, 255, 0.08)",
    "rgba(165, 123, 255, 0.12)"
  ]);
  createNebulaTexture(scene, ASSETS.nebulaRift, ["#17091d", "#3a1030", "#421640", "#070514"], [
    "rgba(255, 111, 97, 0.24)",
    "rgba(255, 209, 102, 0.13)",
    "rgba(165, 123, 255, 0.18)",
    "rgba(79, 231, 255, 0.08)"
  ]);
  createNebulaTexture(scene, ASSETS.nebulaCore, ["#05020c", "#20051f", "#40101d", "#06030b"], [
    "rgba(255, 111, 97, 0.3)",
    "rgba(255, 209, 102, 0.18)",
    "rgba(255, 255, 255, 0.1)",
    "rgba(165, 123, 255, 0.2)"
  ]);
  createNebulaTexture(scene, ASSETS.nebulaEclipse, ["#02030b", "#11162e", "#2b1f44", "#04050c"], [
    "rgba(165, 123, 255, 0.24)",
    "rgba(79, 231, 255, 0.12)",
    "rgba(255, 209, 102, 0.12)",
    "rgba(255, 255, 255, 0.075)"
  ]);
  createNebulaTexture(scene, ASSETS.nebulaAurora, ["#031112", "#06312f", "#12385b", "#030814"], [
    "rgba(182, 255, 109, 0.22)",
    "rgba(79, 231, 255, 0.2)",
    "rgba(255, 111, 97, 0.1)",
    "rgba(255, 255, 255, 0.08)"
  ]);

  createStarTile(scene, ASSETS.starTileA, 420, "rgba(220, 251, 255, 0.9)");
  createStarTile(scene, ASSETS.starTileB, 165, "rgba(255, 209, 102, 0.88)");
  createMistTile(scene);
  createPlanetTexture(scene);
  createDebrisTile(scene);
}

function createStarTile(scene: Phaser.Scene, key: string, count: number, color: string) {
  const texture = scene.textures.createCanvas(key, 640, 640);
  if (!texture) return;
  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < count; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() > 0.94 ? 1.8 : 0.8 + Math.random() * 0.8;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35 + Math.random() * 0.65;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  texture.refresh();
}

function createMistTile(scene: Phaser.Scene) {
  const texture = scene.textures.createCanvas(ASSETS.mistTile, 700, 700);
  if (!texture) return;
  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 18; i += 1) {
    paintBlob(
      ctx,
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      80 + Math.random() * 150,
      i % 3 === 0 ? "rgba(79, 231, 255, 0.08)" : "rgba(255, 255, 255, 0.045)"
    );
  }
  texture.refresh();
}

function createPlanetTexture(scene: Phaser.Scene) {
  const texture = scene.textures.createCanvas(ASSETS.planet, 420, 420);
  if (!texture) return;
  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const atmosphere = ctx.createRadialGradient(210, 210, 64, 210, 210, 206);
  atmosphere.addColorStop(0, "rgba(79, 231, 255, 0.0)");
  atmosphere.addColorStop(0.72, "rgba(79, 231, 255, 0.18)");
  atmosphere.addColorStop(1, "rgba(79, 231, 255, 0)");
  ctx.fillStyle = atmosphere;
  ctx.beginPath();
  ctx.arc(210, 210, 206, 0, Math.PI * 2);
  ctx.fill();

  const body = ctx.createRadialGradient(150, 130, 20, 210, 210, 152);
  body.addColorStop(0, "#dffaff");
  body.addColorStop(0.24, "#4fe7ff");
  body.addColorStop(0.62, "#2b2c78");
  body.addColorStop(1, "#08091d");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(210, 210, 148, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(210, 210, 148, 0, Math.PI * 2);
  ctx.clip();
  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(255, 209, 102, 0.18)" : "rgba(165, 123, 255, 0.18)";
    ctx.beginPath();
    ctx.ellipse(208, 122 + i * 24, 180, 12 + (i % 3) * 5, -0.18, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(210, 222, 190, 46, -0.22, 0.12, Math.PI - 0.08);
  ctx.stroke();
  texture.refresh();
}

function createDebrisTile(scene: Phaser.Scene) {
  const texture = scene.textures.createCanvas(ASSETS.spaceDebris, 760, 760);
  if (!texture) return;
  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 42; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const length = 12 + Math.random() * 34;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.55 + Math.random() * 0.4);
    ctx.fillStyle = i % 4 === 0 ? "rgba(255, 209, 102, 0.32)" : "rgba(180, 232, 255, 0.28)";
    ctx.fillRect(-length / 2, -1, length, 2);
    ctx.restore();
  }
  texture.refresh();
}

function paintBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}
