import Phaser from "phaser";
import { ASSETS, createGeneratedAssets } from "../assets";
import { AudioSystem } from "../audio";
import { emitComms, emitHud, emitMenu, emitRunEnd, emitToast, GAME_EVENTS, type GameMode, type VolumeState } from "../events";
import { InputMapper } from "../input";
import {
  createMission,
  recordKill,
  updateMission,
  type EnemyKind,
  type MissionState,
  type SpawnOrder
} from "../systems/mission";

type EnemySprite = Phaser.Physics.Arcade.Sprite & {
  kind: EnemyKind;
  hp: number;
  maxHp: number;
  score: number;
  fireAt: number;
  drift: number;
  phase: number;
  baseScale: number;
};

type Projectile = Phaser.Physics.Arcade.Image & {
  damage: number;
  projectileKind?: "pulse" | "ion" | "shard" | "missile" | "lance" | "enemy";
  bornAt: number;
  spin: number;
  wobble: number;
  accelY: number;
};

type PowerUp = Phaser.Physics.Arcade.Image & {
  kind: "power" | "repair" | "shield" | "speed";
};

interface BackdropProfile {
  id: string;
  texture: string;
  starTint: number;
  mistTint: number;
  debrisTint: number;
  glowTint: number;
  planetTint: number;
  planetAlpha: number;
  camera: number;
}

const PLAYER_MAX_HP = 100;
const PLAYER_SPEED = 430;
const PLAYER_BOOST_SPEED = 565;
const PLAYER_VISUAL_SCALE = 0.68;
const WORLD_MARGIN = 34;

const BACKDROP_PROFILES: Record<string, BackdropProfile> = {
  harbor: {
    id: "harbor",
    texture: ASSETS.nebula,
    starTint: 0xffffff,
    mistTint: 0x9fefff,
    debrisTint: 0xffffff,
    glowTint: 0x4fe7ff,
    planetTint: 0xffffff,
    planetAlpha: 0.72,
    camera: 0x050615
  },
  storm: {
    id: "storm",
    texture: ASSETS.nebulaStorm,
    starTint: 0xb6ff6d,
    mistTint: 0x4fe7ff,
    debrisTint: 0xb6ff6d,
    glowTint: 0xb6ff6d,
    planetTint: 0xa7f7ff,
    planetAlpha: 0.62,
    camera: 0x04121d
  },
  rift: {
    id: "rift",
    texture: ASSETS.nebulaRift,
    starTint: 0xffd166,
    mistTint: 0xff6f61,
    debrisTint: 0xffd166,
    glowTint: 0xff6f61,
    planetTint: 0xffa078,
    planetAlpha: 0.58,
    camera: 0x100612
  },
  core: {
    id: "core",
    texture: ASSETS.nebulaCore,
    starTint: 0xff6f61,
    mistTint: 0xffd166,
    debrisTint: 0xffffff,
    glowTint: 0xffd166,
    planetTint: 0xff6f61,
    planetAlpha: 0.5,
    camera: 0x08030a
  },
  eclipse: {
    id: "eclipse",
    texture: ASSETS.nebulaEclipse,
    starTint: 0xa57bff,
    mistTint: 0x7fc7ff,
    debrisTint: 0xffd166,
    glowTint: 0xa57bff,
    planetTint: 0xc8b3ff,
    planetAlpha: 0.56,
    camera: 0x050711
  },
  aurora: {
    id: "aurora",
    texture: ASSETS.nebulaAurora,
    starTint: 0xb6ff6d,
    mistTint: 0x8ff7ff,
    debrisTint: 0xb6ff6d,
    glowTint: 0x4fe7ff,
    planetTint: 0xb6ff6d,
    planetAlpha: 0.6,
    camera: 0x031014
  }
};

const BACKDROP_SEQUENCE = [
  BACKDROP_PROFILES.harbor,
  BACKDROP_PROFILES.storm,
  BACKDROP_PROFILES.rift,
  BACKDROP_PROFILES.core,
  BACKDROP_PROFILES.eclipse,
  BACKDROP_PROFILES.aurora
];

const STORY_BEATS = [
  {
    wave: 1,
    speaker: "星港塔台",
    message: "第七码头失联，黑匣信号指向星云深处。星翼一号，打开航道。",
    tone: "system"
  },
  {
    wave: 2,
    speaker: "领航员岚",
    message: "敌机不是普通巡逻队，它们在护送某个大型热源。保持高度，别被诱导下潜。",
    tone: "ally"
  },
  {
    wave: 3,
    speaker: "星翼一号",
    message: "星云背后有一座折跃门。我要靠近一点，看清它在吞什么。",
    tone: "ally"
  },
  {
    wave: 4,
    speaker: "警戒系统",
    message: "检测到重型舰影。能量读数异常，建议预留星环脉冲。",
    tone: "warning"
  },
  {
    wave: 5,
    speaker: "领航员岚",
    message: "刚才的残骸里有民用识别码。它们在拆我们的航站，不只是入侵。",
    tone: "ally"
  },
  {
    wave: 6,
    speaker: "星翼一号",
    message: "我看到被拖走的逃生舱。敌舰不是在掠夺资源，它们在收集人的记忆备份。",
    tone: "warning"
  },
  {
    wave: 7,
    speaker: "星港塔台",
    message: "全城护盾只剩三分钟。星翼一号，你现在是最后一道空域闸门。",
    tone: "warning"
  },
  {
    wave: 8,
    speaker: "星翼一号",
    message: "我听到折跃门另一侧的求救信号。敌舰在用幸存者的信标做诱饵。",
    tone: "ally"
  },
  {
    wave: 9,
    speaker: "领航员岚",
    message: "信号源确认，是失踪的先遣舰“晨星号”。它还活着，但核心被接管了。",
    tone: "ally"
  },
  {
    wave: 10,
    speaker: "领航员岚",
    message: "黑匣完成解码：这支舰队曾属于边境防线。有人重写了它们的导航核心。",
    tone: "system"
  },
  {
    wave: 11,
    speaker: "星翼一号",
    message: "如果晨星号在门后，我会把它带回来。先把这些被夺走的护航机打醒。",
    tone: "ally"
  },
  {
    wave: 12,
    speaker: "警戒系统",
    message: "主门开始坍缩，最终旗舰正在穿越。所有星能读数进入红区。",
    tone: "warning"
  }
] as const;

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerTrail?: Phaser.GameObjects.Particles.ParticleEmitter;
  private shieldRing?: Phaser.GameObjects.Image;
  private inputMapper!: InputMapper;
  private mission!: MissionState;
  private audio = new AudioSystem();
  private mode: GameMode = "menu";

  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private powerUps!: Phaser.Physics.Arcade.Group;

  private hp = PLAYER_MAX_HP;
  private score = 0;
  private charge = 0;
  private weaponLevel = 1;
  private invulnerableUntil = 0;
  private speedBoostUntil = 0;
  private nextShotAt = 0;
  private shotIndex = 0;
  private combo = 1;
  private comboUntil = 0;
  private lastHudAt = -1;

  private nebula!: Phaser.GameObjects.TileSprite;
  private starsA!: Phaser.GameObjects.TileSprite;
  private starsB!: Phaser.GameObjects.TileSprite;
  private mist!: Phaser.GameObjects.TileSprite;
  private debris!: Phaser.GameObjects.TileSprite;
  private planet!: Phaser.GameObjects.Image;
  private horizonGlow!: Phaser.GameObjects.Image;
  private depthGrid!: Phaser.GameObjects.Graphics;
  private vignette!: Phaser.GameObjects.Graphics;
  private playerShadow!: Phaser.GameObjects.Image;
  private engineFlare!: Phaser.GameObjects.Image;
  private announcedWave = 0;
  private bossCommsWave = 0;
  private backdropId = "";

  constructor() {
    super("GameScene");
  }

  create() {
    createGeneratedAssets(this);
    this.inputMapper = new InputMapper(this);
    this.createWorld();
    this.createGroups();
    this.createPlayer();
    this.bindDomEvents();
    this.setupCollisions();
    this.resetRun(false);
    emitMenu({
      mode: "menu",
      title: "是男人就撑过100波",
      message: "霓虹云海全面失控。撑过一波又一波敌机，挑战第 100 波。"
    });
    emitComms({
      speaker: "星港塔台",
      message: "第七码头失联，星翼一号待命。点击开始后通信链路接入。",
      tone: "system"
    });
    emitToast("准备挑战");
  }

  update(time: number, delta: number) {
    this.updateBackdrop(delta);
    this.updatePlayerPresentation(time);

    if (this.mode !== "playing") {
      this.player.setVelocity(0, 0);
      this.updateHud(time, true);
      return;
    }

    this.handleInput(time);
    this.updateWeapon(time);
    this.updateEnemies(time, delta);
    this.updateProjectiles();
    this.updatePowerUps(delta);
    this.updateShieldVisual(time);
    this.spawnFromMission(time);
    this.updateHud(time);

    if (this.hp <= 0) {
      this.finishRun();
    }
  }

  private createWorld() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.nebula = this.add.tileSprite(0, 0, width, height, ASSETS.nebula).setOrigin(0).setDepth(-30);
    this.starsA = this.add.tileSprite(0, 0, width, height, ASSETS.starTileA).setOrigin(0).setDepth(-24);
    this.starsB = this.add.tileSprite(0, 0, width, height, ASSETS.starTileB).setOrigin(0).setDepth(-23);
    this.planet = this.add
      .image(width * 0.78, height * 0.18, ASSETS.planet)
      .setDepth(-27)
      .setAlpha(0.72)
      .setScale(this.planetScale(width, height));
    this.horizonGlow = this.add
      .image(width / 2, height * 0.29, ASSETS.depthFlare)
      .setDepth(-22)
      .setAlpha(0.16)
      .setScale(Math.max(5, width / 72), 1.25)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.depthGrid = this.add.graphics().setDepth(-21).setBlendMode(Phaser.BlendModes.ADD);
    this.debris = this.add
      .tileSprite(0, 0, width, height, ASSETS.spaceDebris)
      .setOrigin(0)
      .setDepth(-20)
      .setAlpha(0.48)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.mist = this.add
      .tileSprite(0, 0, width, height, ASSETS.mistTile)
      .setOrigin(0)
      .setDepth(-18)
      .setAlpha(0.7)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.vignette = this.add.graphics().setDepth(24);
    this.drawVignette();
    this.applyBackdropTheme(true);

    this.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.nebula.setSize(gameSize.width, gameSize.height);
      this.starsA.setSize(gameSize.width, gameSize.height);
      this.starsB.setSize(gameSize.width, gameSize.height);
      this.debris.setSize(gameSize.width, gameSize.height);
      this.mist.setSize(gameSize.width, gameSize.height);
      this.planet
        .setPosition(gameSize.width * 0.78, gameSize.height * 0.18)
        .setScale(this.planetScale(gameSize.width, gameSize.height));
      this.horizonGlow
        .setPosition(gameSize.width / 2, gameSize.height * 0.29)
        .setScale(Math.max(5, gameSize.width / 72), 1.25);
      this.drawPerspectiveGrid();
      this.drawVignette();
      if (this.mode !== "playing") {
        this.player.setPosition(gameSize.width / 2, gameSize.height * 0.74);
      }
    });
  }

  private createGroups() {
    this.playerBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 280,
      runChildUpdate: false
    });
    this.enemyBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 130,
      runChildUpdate: false
    });
    this.enemies = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 48,
      runChildUpdate: false
    });
    this.powerUps = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 24,
      runChildUpdate: false
    });
  }

  private createPlayer() {
    this.playerShadow = this.add
      .image(this.scale.width / 2, this.scale.height * 0.74 + 35, ASSETS.shipShadow)
      .setDepth(7)
      .setAlpha(0.34)
      .setScale(0.62);
    this.engineFlare = this.add
      .image(this.scale.width / 2, this.scale.height * 0.74 + 47, ASSETS.depthFlare)
      .setDepth(8)
      .setAlpha(0.55)
      .setScale(0.24)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.player = this.physics.add.sprite(this.scale.width / 2, this.scale.height * 0.74, ASSETS.player);
    this.player.setDepth(10);
    this.player.setDrag(1600);
    this.player.setMaxVelocity(PLAYER_BOOST_SPEED);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(PLAYER_VISUAL_SCALE);
    this.player.body?.setSize(26, 34, true);

    this.playerTrail = this.add.particles(0, 0, ASSETS.spark, {
      follow: this.player,
      followOffset: { x: 0, y: 20 },
      lifespan: 420,
      speedY: { min: 50, max: 160 },
      speedX: { min: -16, max: 16 },
      scale: { start: 0.82, end: 0 },
      alpha: { start: 0.58, end: 0 },
      tint: [0x4fe7ff, 0xb6ff6d, 0xffd166],
      blendMode: Phaser.BlendModes.ADD,
      quantity: 2
    });
    this.playerTrail.setDepth(8);

    this.shieldRing = this.add.image(this.player.x, this.player.y, ASSETS.ring);
    this.shieldRing.setDepth(9).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
  }

  private bindDomEvents() {
    window.addEventListener(GAME_EVENTS.start, () => {
      this.audio.unlock();
      this.startRun();
    });
    window.addEventListener(GAME_EVENTS.restart, () => {
      this.audio.unlock();
      this.resetRun(true);
      this.startRun();
    });
    window.addEventListener(GAME_EVENTS.pause, () => {
      if (this.mode === "playing") {
        this.setMode("paused");
        emitMenu({
          mode: "paused",
          title: "已暂停",
          message: "航道保持稳定，随时可以继续挑战。"
        });
      } else if (this.mode === "paused") {
        this.startRun();
      }
      this.updateHud(this.time.now, true);
    });
    window.addEventListener(GAME_EVENTS.burst, () => this.tryBurst());
    window.addEventListener(GAME_EVENTS.volume, (event) => {
      const detail = (event as CustomEvent<VolumeState>).detail;
      if (!detail) return;
      this.audio.setVolumes(detail.music, detail.sfx);
    });
  }

  private setupCollisions() {
    this.physics.add.overlap(this.playerBullets, this.enemies, (objectA, objectB) => {
      const bullet = this.asProjectile(objectA, objectB);
      const enemy = this.asEnemy(objectA, objectB);
      if (!bullet || !enemy) return;
      this.hitEnemy(bullet, enemy);
    });
    this.physics.add.overlap(this.enemyBullets, this.player, (objectA, objectB) => {
      const bullet = this.asProjectile(objectA, objectB);
      if (!bullet) return;
      this.hitPlayer(bullet.damage || 9);
      bullet.disableBody(true, true);
    });
    this.physics.add.overlap(this.enemies, this.player, (objectA, objectB) => {
      const enemy = this.asEnemy(objectA, objectB);
      if (!enemy) return;
      this.hitPlayer(enemy.kind === "boss" ? 26 : 17);
      this.damageEnemy(enemy, 999);
    });
    this.physics.add.overlap(this.powerUps, this.player, (objectA, objectB) => {
      const item = this.asPowerUp(objectA, objectB);
      if (!item) return;
      this.collectPowerUp(item);
    });
  }

  private asProjectile(objectA: unknown, objectB: unknown): Projectile | null {
    if (objectA instanceof Phaser.Physics.Arcade.Image && typeof (objectA as Projectile).damage === "number") {
      return objectA as Projectile;
    }
    if (objectB instanceof Phaser.Physics.Arcade.Image && typeof (objectB as Projectile).damage === "number") {
      return objectB as Projectile;
    }
    return null;
  }

  private asEnemy(objectA: unknown, objectB: unknown): EnemySprite | null {
    return this.pickKindedObject(objectA, objectB, ["scout", "dart", "bomber", "ace", "boss"]) as EnemySprite | null;
  }

  private asPowerUp(objectA: unknown, objectB: unknown): PowerUp | null {
    return this.pickKindedObject(objectA, objectB, ["power", "repair", "shield", "speed"]) as PowerUp | null;
  }

  private pickKindedObject(objectA: unknown, objectB: unknown, kinds: string[]) {
    const a = objectA as { kind?: string };
    const b = objectB as { kind?: string };
    if (a.kind && kinds.includes(a.kind)) return objectA;
    if (b.kind && kinds.includes(b.kind)) return objectB;
    return null;
  }

  private startRun() {
    if (this.mode === "gameover" || this.hp <= 0) {
      this.resetRun(true);
    }
    this.setMode("playing");
    this.applyBackdropTheme(true);
    this.audio.startMusic(this.mission.wave, this.mission.bossActive);
    this.announceWave();
    emitMenu({ mode: "playing", title: "", message: "" });
    emitToast("挑战开始");
    this.updateHud(this.time.now, true);
  }

  private resetRun(clearField: boolean) {
    this.mission = createMission();
    this.hp = PLAYER_MAX_HP;
    this.score = 0;
    this.charge = 0;
    this.weaponLevel = 1;
    this.combo = 1;
    this.comboUntil = 0;
    this.nextShotAt = 0;
    this.shotIndex = 0;
    this.invulnerableUntil = this.time.now + 1200;
    this.speedBoostUntil = 0;
    this.announcedWave = 0;
    this.bossCommsWave = 0;
    this.backdropId = "";
    this.setMode("menu");
    this.applyBackdropTheme(true);
    this.player.enableBody(true, this.scale.width / 2, this.scale.height * 0.74, true, true);
    this.player.setAlpha(1).setAngle(0).setScale(PLAYER_VISUAL_SCALE).setVelocity(0, 0);

    if (clearField) {
      this.playerBullets.clear(true, true);
      this.enemyBullets.clear(true, true);
      this.enemies.clear(true, true);
      this.powerUps.clear(true, true);
    }
    this.updateHud(this.time.now, true);
  }

  private finishRun() {
    this.setMode("gameover");
    this.hp = 0;
    this.player.setVelocity(0, 0);
    this.player.disableBody(true, false);
    this.player.setAlpha(0.32);
    this.explode(this.player.x, this.player.y, 42, [0x4fe7ff, 0xff6f61, 0xffd166]);
    this.cameras.main.shake(360, 0.012);
    this.audio.explosion();
    emitMenu({
      mode: "gameover",
      title: "战机返航",
      message: `坚持到第 ${this.mission.wave} 波，分数 ${this.score.toLocaleString("zh-CN")}。调整火力路线，再冲一波。`
    });
    emitRunEnd({ score: this.score, wave: this.mission.wave });
    this.updateHud(this.time.now, true);
  }

  private setMode(mode: GameMode) {
    this.mode = mode;
    if (mode === "playing") {
      this.physics.world.resume();
    } else if (mode === "paused") {
      this.physics.world.pause();
      this.audio.pauseMusic();
    } else {
      this.physics.world.pause();
      this.audio.stopMusic();
    }
  }

  private handleInput(time: number) {
    const action = this.inputMapper.read();
    if (action.burst) this.tryBurst();
    const currentSpeed = time < this.speedBoostUntil ? PLAYER_BOOST_SPEED : PLAYER_SPEED;

    const vector = new Phaser.Math.Vector2(action.x, action.y);
    if (vector.lengthSq() > 0) {
      vector.normalize().scale(currentSpeed);
      this.player.setVelocity(vector.x, vector.y);
    } else if (action.pointerActive) {
      const dx = action.pointerX - this.player.x;
      const dy = action.pointerY - this.player.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 10) {
        this.player.setVelocity((dx / distance) * currentSpeed, (dy / distance) * currentSpeed);
      } else {
        this.player.setVelocity(0, 0);
      }
    } else {
      this.player.setVelocity(0, 0);
    }

    this.player.x = Phaser.Math.Clamp(this.player.x, WORLD_MARGIN, this.scale.width - WORLD_MARGIN);
    this.player.y = Phaser.Math.Clamp(this.player.y, this.scale.height * 0.2, this.scale.height - 70);
    this.player.setAngle(Phaser.Math.Clamp(this.player.body?.velocity.x ?? 0, -currentSpeed, currentSpeed) * 0.045);

    if (time < this.invulnerableUntil) {
      this.player.setAlpha(0.58 + Math.sin(time * 0.028) * 0.24);
    } else {
      this.player.setAlpha(1);
    }
  }

  private updateWeapon(time: number) {
    const cappedRank = Math.min(this.weaponLevel, 18);
    const cadence = Math.max(46, 144 - cappedRank * 9);
    if (time < this.nextShotAt) return;

    this.nextShotAt = time + cadence;
    this.shotIndex += 1;

    this.firePlayerProjectile({
      x: this.player.x,
      y: this.player.y - 45,
      texture: ASSETS.bullet,
      kind: "pulse",
      damage: 14 + cappedRank * 2,
      velocityX: 0,
      velocityY: -820,
      bodyW: 12,
      bodyH: 26
    });

    if (this.shotIndex % 4 === 0) {
      [-24, 24].forEach((offset, index) => {
        this.firePlayerProjectile({
          x: this.player.x + offset,
          y: this.player.y - 30,
          texture: ASSETS.bulletShard,
          kind: "shard",
          damage: 7,
          velocityX: index === 0 ? -92 : 92,
          velocityY: -650,
          bodyW: 14,
          bodyH: 18,
          rotation: index === 0 ? -0.28 : 0.28,
          spin: index === 0 ? -0.14 : 0.14
        });
      });
    }

    if (this.weaponLevel >= 2) {
      [-18, 18].forEach((offset, index) => {
        this.firePlayerProjectile({
          x: this.player.x + offset,
          y: this.player.y - 38,
          texture: ASSETS.bulletIon,
          kind: "ion",
          damage: 10 + cappedRank * 2,
          velocityX: index === 0 ? -54 : 54,
          velocityY: -760,
          bodyW: 14,
          bodyH: 28,
          rotation: index === 0 ? -0.1 : 0.1
        });
      });
    }

    if (this.weaponLevel >= 3 && this.shotIndex % 2 === 0) {
      [-34, 34].forEach((offset, index) => {
        this.firePlayerProjectile({
          x: this.player.x + offset,
          y: this.player.y - 24,
          texture: ASSETS.bulletShard,
          kind: "shard",
          damage: 9 + cappedRank,
          velocityX: index === 0 ? -135 : 135,
          velocityY: -700,
          bodyW: 18,
          bodyH: 22,
          rotation: index === 0 ? -0.34 : 0.34,
          spin: index === 0 ? -0.18 : 0.18
        });
      });
    }

    if (this.weaponLevel >= 4) {
      if (this.shotIndex % 3 === 0) {
        [-26, 26].forEach((offset, index) => {
          this.firePlayerProjectile({
            x: this.player.x + offset,
            y: this.player.y - 16,
            texture: ASSETS.bulletMissile,
            kind: "missile",
            damage: 24,
            velocityX: index === 0 ? -86 : 86,
            velocityY: -620,
            bodyW: 16,
            bodyH: 30,
            rotation: index === 0 ? -0.18 : 0.18,
            wobble: Math.random() * Math.PI * 2,
            accelY: -16
          });
        });
      } else if (this.shotIndex % 3 === 1) {
        this.firePlayerProjectile({
          x: this.player.x,
          y: this.player.y - 58,
          texture: ASSETS.bulletLance,
          kind: "lance",
          damage: 22,
          velocityX: 0,
          velocityY: -900,
          bodyW: 10,
          bodyH: 58
        });
      }
    }

    if (this.weaponLevel >= 5) {
      const fanPairs = Phaser.Math.Clamp(Math.floor((this.weaponLevel - 3) / 2), 1, 4);
      for (let i = 1; i <= fanPairs; i += 1) {
        const spread = i * 0.12;
        [-1, 1].forEach((side) => {
          this.firePlayerProjectile({
            x: this.player.x + side * (20 + i * 9),
            y: this.player.y - 28 - i * 3,
            texture: ASSETS.bulletIon,
            kind: "ion",
            damage: 7 + Math.floor(cappedRank * 1.25),
            velocityX: side * (72 + i * 34),
            velocityY: -720 - i * 26,
            bodyW: 12,
            bodyH: 26,
            rotation: side * spread
          });
        });
      }
    }

    if (this.weaponLevel >= 7 && this.shotIndex % 3 === 0) {
      const shardRows = Phaser.Math.Clamp(Math.floor((this.weaponLevel - 5) / 2), 1, 5);
      for (let i = 0; i < shardRows; i += 1) {
        const offset = 18 + i * 15;
        const drift = 96 + i * 42;
        [-1, 1].forEach((side) => {
          this.firePlayerProjectile({
            x: this.player.x + side * offset,
            y: this.player.y - 20 + i * 4,
            texture: ASSETS.bulletShard,
            kind: "shard",
            damage: 8 + Math.floor(cappedRank * 0.9),
            velocityX: side * drift,
            velocityY: -640 - i * 38,
            bodyW: 16,
            bodyH: 20,
            rotation: side * (0.22 + i * 0.07),
            spin: side * (0.12 + i * 0.015)
          });
        });
      }
    }

    if (this.weaponLevel >= 10 && this.shotIndex % 5 === 0) {
      const lances = Phaser.Math.Clamp(Math.floor((this.weaponLevel - 8) / 3), 1, 3);
      for (let i = 0; i < lances; i += 1) {
        const offset = (i - (lances - 1) / 2) * 30;
        this.firePlayerProjectile({
          x: this.player.x + offset,
          y: this.player.y - 66,
          texture: ASSETS.bulletLance,
          kind: "lance",
          damage: 18 + Math.floor(cappedRank * 1.4),
          velocityX: offset * 1.2,
          velocityY: -930,
          bodyW: 10,
          bodyH: 58,
          rotation: offset * 0.004
        });
      }
    }

    this.audio.shoot(this.weaponLevel);
  }

  private firePlayerProjectile(config: {
    x: number;
    y: number;
    texture: string;
    kind: Projectile["projectileKind"];
    damage: number;
    velocityX: number;
    velocityY: number;
    bodyW: number;
    bodyH: number;
    rotation?: number;
    spin?: number;
    wobble?: number;
    accelY?: number;
  }) {
    const bullet = this.activateProjectile(this.playerBullets, config.x, config.y, config.texture);
    if (!bullet) return;
    bullet.projectileKind = config.kind;
    bullet.damage = config.damage;
    bullet.spin = config.spin ?? 0;
    bullet.wobble = config.wobble ?? Math.random() * Math.PI * 2;
    bullet.accelY = config.accelY ?? 0;
    bullet.setDepth(config.kind === "lance" ? 7 : 6);
    bullet.setRotation(config.rotation ?? 0);
    bullet.setBlendMode(Phaser.BlendModes.ADD);
    bullet.body?.setSize(config.bodyW, config.bodyH, true);
    bullet.setVelocity(config.velocityX, config.velocityY);
  }

  private updateEnemies(time: number, delta: number) {
    const dt = delta / 1000;
    const pressure = this.enemyPressure();
    const list = this.enemies.getChildren() as EnemySprite[];
    list.forEach((enemy) => {
      if (!enemy.active) return;
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      enemy.phase += dt;

      if (enemy.kind === "boss") {
        enemy.x += Math.sin(enemy.phase * 0.8) * 62 * dt;
        body.setVelocityY(Phaser.Math.Linear(body.velocity.y, enemy.y < 150 ? 80 : 18, 0.03));
        if (time > enemy.fireAt) {
          enemy.fireAt = time + Math.max(360, 560 * pressure.fireDelay);
          this.fireEnemySpread(enemy, this.mission.wave >= 20 ? 7 : 5, 190);
        }
      } else {
        body.setVelocityX(Math.sin(enemy.phase * enemy.drift) * enemy.drift * 22);
        if (enemy.kind === "ace") body.setVelocityX(Math.sin(enemy.phase * 4.2) * 180);
        if (enemy.kind === "dart" && this.mission.wave >= 10 && time > enemy.fireAt) {
          enemy.fireAt = time + Math.max(780, 1320 * pressure.fireDelay);
          this.fireEnemySpread(enemy, 1, 235);
        }
        if ((enemy.kind === "bomber" || enemy.kind === "ace") && time > enemy.fireAt) {
          enemy.fireAt = time + Math.max(560, (enemy.kind === "ace" ? 850 : 1080) * pressure.fireDelay);
          this.fireEnemySpread(enemy, enemy.kind === "ace" ? 2 : 3, enemy.kind === "ace" ? 255 : 205);
        }
      }

      if (enemy.y > this.scale.height + 100) {
        enemy.disableBody(true, true);
      }

      const perspective = this.perspectiveScale(enemy.y);
      enemy.setScale(enemy.baseScale * perspective);
      enemy.setDepth(enemy.kind === "boss" ? 9 : 5 + Math.floor(perspective * 3));
      enemy.setAlpha(Phaser.Math.Clamp(0.72 + perspective * 0.24, 0.72, 1));
    });
  }

  private updateProjectiles() {
    const allBullets = [
      ...(this.playerBullets.getChildren() as Projectile[]),
      ...(this.enemyBullets.getChildren() as Projectile[])
    ];

    allBullets.forEach((bullet) => {
      if (!bullet.active) return;
      const age = this.time.now - (bullet.bornAt || this.time.now);
      if (bullet.projectileKind === "missile") {
        bullet.setVelocityY(Math.max(-940, (bullet.body as Phaser.Physics.Arcade.Body).velocity.y + bullet.accelY));
        bullet.x += Math.sin(age * 0.014 + bullet.wobble) * 1.35;
        bullet.rotation = Math.sin(age * 0.012 + bullet.wobble) * 0.22;
      } else if (bullet.projectileKind === "shard") {
        bullet.rotation += bullet.spin;
        bullet.setAlpha(0.72 + Math.sin(age * 0.018) * 0.18);
      } else if (bullet.projectileKind === "ion") {
        bullet.setScale(1 + Math.sin(age * 0.022) * 0.08);
      } else if (bullet.projectileKind === "lance") {
        bullet.setScale(1 + Math.sin(age * 0.03) * 0.04, 1 + Math.sin(age * 0.024) * 0.08);
      }
      if (
        bullet.y < -80 ||
        bullet.y > this.scale.height + 100 ||
        bullet.x < -80 ||
        bullet.x > this.scale.width + 80
      ) {
        bullet.disableBody(true, true);
      }
    });
  }

  private updatePowerUps(delta: number) {
    const dt = delta / 1000;
    (this.powerUps.getChildren() as PowerUp[]).forEach((item) => {
      if (!item.active) return;
      item.rotation += dt * 2.4;
      item.setScale(1 + Math.sin(this.time.now * 0.006 + item.x) * 0.08);
      if (item.y > this.scale.height + 80) item.disableBody(true, true);
    });
  }

  private updateShieldVisual(time: number) {
    if (!this.shieldRing) return;
    this.shieldRing.setPosition(this.player.x, this.player.y);
    this.shieldRing.rotation += 0.018;
    const shielded = time < this.invulnerableUntil || this.hp > PLAYER_MAX_HP;
    this.shieldRing.setAlpha(shielded ? 0.46 + Math.sin(time * 0.008) * 0.16 : 0);
    this.shieldRing.setScale(shielded ? 0.82 + Math.sin(time * 0.006) * 0.04 : 0.68);
  }

  private spawnFromMission(time: number) {
    const maxEnemies = Phaser.Math.Clamp(7 + Math.floor(this.mission.wave * 0.55), 7, 16);
    const orders = updateMission(this.mission, time, this.enemies.countActive(true), maxEnemies);
    orders.forEach((order) => this.spawnOrder(order));
    if (orders.some((order) => order.kind === "boss")) {
      this.audio.setWave(this.mission.wave, true);
      this.applyBackdropTheme(true);
      if (this.bossCommsWave !== this.mission.wave) {
        this.bossCommsWave = this.mission.wave;
        emitComms({
          speaker: "警戒系统",
          message: "重型舰锁定星翼航线。它的护盾正在给折跃门供能，必须击破核心。",
          tone: "warning"
        });
      }
      emitToast("Boss 接近");
    }
  }

  private spawnOrder(order: SpawnOrder) {
    for (let i = 0; i < order.count; i += 1) {
      const x =
        order.kind === "boss"
          ? this.scale.width / 2
          : Phaser.Math.Clamp(
              order.lane * this.scale.width + (i - (order.count - 1) / 2) * 80,
              48,
              this.scale.width - 48
            );
      const y = order.kind === "boss" ? -100 : -52 - i * 48;
      this.spawnEnemy(order.kind, x, y);
    }
  }

  private spawnEnemy(kind: EnemyKind, x: number, y: number) {
    const texture = this.textureForEnemy(kind);
    const enemy = this.enemies.get(x, y, texture) as EnemySprite | null;
    if (!enemy) return;

    const stats = this.statsForEnemy(kind);
    const pressure = this.enemyPressure();
    enemy.kind = kind;
    enemy.hp = (stats.hp + this.mission.wave * stats.hpScale) * pressure.hp;
    enemy.maxHp = enemy.hp;
    enemy.score = stats.score;
    enemy.fireAt = this.time.now + Math.max(260, stats.firstShot * pressure.fireDelay) + Math.random() * 320;
    enemy.drift = Phaser.Math.FloatBetween(1.5, 3.6);
    enemy.phase = Math.random() * Math.PI * 2;
    enemy.baseScale = kind === "boss" ? 1 : 0.88 + Math.random() * 0.1;
    enemy.setTexture(texture);
    enemy.setActive(true).setVisible(true);
    enemy.enableBody(true, x, y, true, true);
    enemy.setDepth(kind === "boss" ? 7 : 5);
    enemy.setBlendMode(Phaser.BlendModes.NORMAL);
    enemy.setAngle(kind === "boss" ? 180 : 180);
    enemy.setScale(enemy.baseScale);
    enemy.body?.setSize(stats.bodyW, stats.bodyH, true);
    enemy.setVelocity(0, (stats.speed + this.mission.wave * stats.speedScale) * pressure.speed);
  }

  private textureForEnemy(kind: EnemyKind) {
    return (
      {
        scout: ASSETS.scout,
        dart: ASSETS.dart,
        bomber: ASSETS.bomber,
        ace: ASSETS.ace,
        boss: ASSETS.boss
      } satisfies Record<EnemyKind, string>
    )[kind];
  }

  private statsForEnemy(kind: EnemyKind) {
    const table = {
      scout: { hp: 28, hpScale: 1.7, score: 120, speed: 126, speedScale: 6, bodyW: 34, bodyH: 38, firstShot: 9999 },
      dart: { hp: 20, hpScale: 1.35, score: 150, speed: 205, speedScale: 9, bodyW: 28, bodyH: 38, firstShot: 1180 },
      bomber: { hp: 78, hpScale: 3.8, score: 260, speed: 86, speedScale: 5, bodyW: 56, bodyH: 44, firstShot: 680 },
      ace: { hp: 52, hpScale: 2.8, score: 310, speed: 126, speedScale: 6, bodyW: 36, bodyH: 42, firstShot: 500 },
      boss: { hp: 720, hpScale: 54, score: 1900, speed: 46, speedScale: 0, bodyW: 164, bodyH: 76, firstShot: 620 }
    } satisfies Record<
      EnemyKind,
      {
        hp: number;
        hpScale: number;
        score: number;
        speed: number;
        speedScale: number;
        bodyW: number;
        bodyH: number;
        firstShot: number;
      }
    >;

    return table[kind];
  }

  private enemyPressure() {
    const chapter = Math.floor((Math.max(1, this.mission.wave) - 1) / 10);
    return {
      hp: 1 + Math.min(0.75, chapter * 0.12),
      speed: 1 + Math.min(0.38, chapter * 0.065),
      fireDelay: Math.max(0.62, 1 - chapter * 0.065),
      bulletSpeed: 1 + Math.min(0.42, chapter * 0.07),
      bulletDamage: 1 + Math.min(0.45, chapter * 0.08)
    };
  }

  private fireEnemySpread(enemy: EnemySprite, count: number, speed: number) {
    const pressure = this.enemyPressure();
    const center = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
    const spread = count === 2 ? 0.28 : count === 3 ? 0.46 : 0.8;
    for (let i = 0; i < count; i += 1) {
      const t = count === 1 ? 0 : i / (count - 1) - 0.5;
      const angle = center + t * spread;
      const bullet = this.activateProjectile(this.enemyBullets, enemy.x, enemy.y + 36, ASSETS.enemyBullet);
      if (!bullet) return;
      bullet.setDepth(6);
      bullet.projectileKind = "enemy";
      bullet.damage = (enemy.kind === "boss" ? 12 : 9) * pressure.bulletDamage;
      bullet.setBlendMode(Phaser.BlendModes.ADD);
      bullet.body?.setSize(14, 14, true);
      bullet.setVelocity(Math.cos(angle) * speed * pressure.bulletSpeed, Math.sin(angle) * speed * pressure.bulletSpeed);
    }
  }

  private activateProjectile(
    group: Phaser.Physics.Arcade.Group,
    x: number,
    y: number,
    texture: string
  ): Projectile | null {
    const bullet = group.get(x, y, texture) as Projectile | null;
    if (!bullet) return null;

    bullet.setTexture(texture);
    bullet.enableBody(true, x, y, true, true);
    bullet.setActive(true).setVisible(true);
    bullet.projectileKind = undefined;
    bullet.bornAt = this.time.now;
    bullet.spin = 0;
    bullet.wobble = 0;
    bullet.accelY = 0;
    bullet.setAlpha(1).setScale(1).setRotation(0).clearTint();
    bullet.setVelocity(0, 0);
    return bullet;
  }

  private hitEnemy(bullet: Projectile, enemy: EnemySprite) {
    bullet.disableBody(true, true);
    this.damageEnemy(enemy, bullet.damage);
    if (bullet.projectileKind === "lance" || bullet.projectileKind === "missile") {
      this.addHitSpark(enemy.x, enemy.y, bullet.projectileKind === "missile" ? 12 : 9);
    }
  }

  private damageEnemy(enemy: EnemySprite, damage: number) {
    enemy.hp -= damage;
    enemy.setTintFill(0xffffff);
    this.time.delayedCall(38, () => enemy.clearTint());
    this.addHitSpark(enemy.x, enemy.y, enemy.kind === "boss" ? 12 : 6);

    if (enemy.hp > 0) return;

    const killedKind = enemy.kind;
    const scoreGain = Math.floor(enemy.score * this.combo);
    this.score += scoreGain;
    this.combo = Math.min(5, this.combo + 0.16);
    this.comboUntil = this.time.now + 1200;
    this.charge = Math.min(100, this.charge + (killedKind === "boss" ? 32 : 8));
    this.explode(enemy.x, enemy.y, killedKind === "boss" ? 72 : 24, this.colorsForEnemy(killedKind));
    this.dropPowerUp(enemy.x, enemy.y, killedKind);
    enemy.disableBody(true, true);
    this.audio.explosion();

    if (recordKill(this.mission, killedKind)) {
      this.charge = Math.min(100, this.charge + 18);
      this.weaponLevel += 1;
      emitToast(`第 ${this.mission.wave} 波 / 火力 Lv.${this.weaponLevel}`);
      this.audio.setWave(this.mission.wave, this.mission.bossActive);
      this.applyBackdropTheme(true);
      if (killedKind === "boss") {
        emitComms({
          speaker: "领航员岚",
          message: "核心爆裂，折跃门短暂失稳。晨星号的信号更清楚了，继续追。",
          tone: "ally"
        });
        this.time.delayedCall(2600, () => this.announceWave());
      } else {
        this.announceWave();
      }
    } else if (killedKind === "boss") {
      emitToast("精英目标击破");
      this.audio.setWave(this.mission.wave, false);
      this.applyBackdropTheme(true);
      emitComms({
        speaker: "领航员岚",
        message: "核心爆裂，折跃门短暂失稳。趁它重启前继续推进。",
        tone: "ally"
      });
    }
  }

  private colorsForEnemy(kind: EnemyKind) {
    if (kind === "boss") return [0xff6f61, 0xa57bff, 0xffd166, 0xffffff];
    if (kind === "ace") return [0xb6ff6d, 0x4fe7ff, 0xffffff];
    if (kind === "bomber") return [0xff6f61, 0xffd166, 0xffffff];
    return [0x4fe7ff, 0xa57bff, 0xffffff];
  }

  private hitPlayer(damage: number) {
    if (this.time.now < this.invulnerableUntil || this.mode !== "playing") return;

    const actualDamage = this.hp > PLAYER_MAX_HP ? Math.max(3, damage * 0.45) : damage;
    this.hp -= actualDamage;
    this.invulnerableUntil = this.time.now + 680;
    if (this.weaponLevel > 1) {
      this.weaponLevel = 1;
      emitToast("火力回落 Lv.1");
    }
    this.combo = 1;
    this.cameras.main.shake(160, 0.006);
    this.addHitSpark(this.player.x, this.player.y, 18);
    this.audio.hit();
  }

  private collectPowerUp(item: PowerUp) {
    if (item.kind === "repair") {
      this.hp = Math.min(PLAYER_MAX_HP, this.hp + 20);
      emitToast("装甲修复");
    } else if (item.kind === "shield") {
      this.hp = Math.min(130, this.hp + 28);
      this.invulnerableUntil = this.time.now + 1900;
      emitToast("护盾展开");
    } else if (item.kind === "speed") {
      this.speedBoostUntil = Math.max(this.speedBoostUntil, this.time.now) + 6200;
      emitToast("推进加速");
    } else {
      this.weaponLevel += 1;
      this.charge = Math.min(100, this.charge + 20);
      emitToast(`火力 Lv.${this.weaponLevel}`);
    }
    emitComms({
      speaker: "机载 AI",
      message:
        item.kind === "repair"
          ? "装甲层完成自愈，机体姿态恢复。"
          : item.kind === "shield"
            ? "临时偏导护盾上线，可以更大胆地切入弹幕。"
            : item.kind === "speed"
              ? "推进器进入短时过载，机动窗口扩大。"
              : "星能核心升频，主炮输出提高。",
      tone: "system"
    });
    this.audio.power();
    this.explode(item.x, item.y, 18, [0x4fe7ff, 0xb6ff6d, 0xffd166]);
    item.disableBody(true, true);
  }

  private dropPowerUp(x: number, y: number, kind: EnemyKind) {
    const chance = kind === "boss" ? 1 : kind === "bomber" ? 0.35 : 0.16;
    if (Math.random() > chance) return;

    const roll = Math.random();
    const itemKind: PowerUp["kind"] =
      roll > 0.78 ? "shield" : roll > 0.55 ? "speed" : roll > 0.32 ? "repair" : "power";
    const texture =
      itemKind === "repair"
        ? ASSETS.repair
        : itemKind === "shield"
          ? ASSETS.shield
          : itemKind === "speed"
            ? ASSETS.speed
            : ASSETS.power;
    const item = this.powerUps.get(x, y, texture) as PowerUp | null;
    if (!item) return;

    item.kind = itemKind;
    item.setActive(true).setVisible(true);
    item.enableBody(true, x, y, true, true);
    item.setDepth(7);
    item.setBlendMode(Phaser.BlendModes.ADD);
    item.body?.setCircle(18, 10, 10);
    item.setVelocity(Phaser.Math.Between(-30, 30), 95);
  }

  private tryBurst() {
    if (this.mode !== "playing" || this.charge < 100) return;

    this.charge = 0;
    this.invulnerableUntil = this.time.now + 900;
    this.cameras.main.shake(260, 0.008);
    this.audio.pulse();
    const ring = this.add.image(this.player.x, this.player.y, ASSETS.ring);
    ring.setDepth(20).setAlpha(0.9).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: ring,
      scale: 8.5,
      alpha: 0,
      duration: 520,
      ease: "Cubic.easeOut",
      onComplete: () => ring.destroy()
    });

    (this.enemyBullets.getChildren() as Phaser.Physics.Arcade.Image[]).forEach((bullet) => {
      if (bullet.active) bullet.disableBody(true, true);
    });
    (this.enemies.getChildren() as EnemySprite[]).forEach((enemy) => {
      if (!enemy.active) return;
      this.damageEnemy(enemy, enemy.kind === "boss" ? 170 : 999);
    });
    emitToast("星环脉冲");
  }

  private addHitSpark(x: number, y: number, amount: number) {
    const emitter = this.add.particles(x, y, ASSETS.spark, {
      speed: { min: 60, max: 220 },
      lifespan: { min: 170, max: 340 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.85, end: 0 },
      tint: [0xffffff, 0x4fe7ff, 0xffd166],
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    });
    emitter.setDepth(14);
    emitter.explode(amount);
    this.time.delayedCall(420, () => emitter.destroy());
  }

  private explode(x: number, y: number, amount: number, colors: number[]) {
    const emitter = this.add.particles(x, y, ASSETS.spark, {
      speed: { min: 90, max: 420 },
      lifespan: { min: 260, max: 780 },
      scale: { start: 1.8, end: 0 },
      alpha: { start: 0.92, end: 0 },
      gravityY: 60,
      tint: colors,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    });
    emitter.setDepth(14);
    emitter.explode(amount);
    this.time.delayedCall(820, () => emitter.destroy());
  }

  private updateBackdrop(delta: number) {
    this.applyBackdropTheme();
    this.nebula.tilePositionY -= delta * 0.012;
    this.starsA.tilePositionY -= delta * 0.045;
    this.starsB.tilePositionY -= delta * 0.09;
    this.starsB.tilePositionX += delta * 0.012;
    this.debris.tilePositionY -= delta * 0.16;
    this.debris.tilePositionX += delta * 0.035;
    this.mist.tilePositionY -= delta * 0.026;
    this.mist.tilePositionX += Math.sin(this.time.now * 0.0004) * 0.16;
    this.planet.rotation += delta * 0.000006;
    this.drawPerspectiveGrid();
  }

  private applyBackdropTheme(force = false) {
    const profile = this.backdropProfileForWave();
    if (!force && profile.id === this.backdropId) return;

    this.backdropId = profile.id;
    this.nebula?.setTexture(profile.texture);
    this.starsB?.setTint(profile.starTint);
    this.mist?.setTint(profile.mistTint);
    this.debris?.setTint(profile.debrisTint);
    this.horizonGlow?.setTint(profile.glowTint).setAlpha(profile.id === "core" ? 0.24 : 0.16);
    this.planet?.setTint(profile.planetTint).setAlpha(profile.planetAlpha);
    this.cameras.main.setBackgroundColor(profile.camera);
  }

  private backdropProfileForWave() {
    const wave = this.mission?.wave ?? 1;
    const stage = Math.floor((Math.max(1, wave) - 1) / 10);
    return BACKDROP_SEQUENCE[stage % BACKDROP_SEQUENCE.length];
  }

  private updatePlayerPresentation(time: number) {
    if (!this.playerShadow || !this.engineFlare || !this.player) return;

    const perspective = this.perspectiveScale(this.player.y);
    const velocityX = this.player.body?.velocity.x ?? 0;
    const currentSpeed = this.time.now < this.speedBoostUntil ? PLAYER_BOOST_SPEED : PLAYER_SPEED;
    const bank = Phaser.Math.Clamp(velocityX / currentSpeed, -1, 1);
    const boostPulse = this.time.now < this.speedBoostUntil ? 0.06 + Math.sin(time * 0.032) * 0.025 : 0;
    this.player.setScale(
      PLAYER_VISUAL_SCALE + boostPulse + Math.abs(bank) * 0.035,
      PLAYER_VISUAL_SCALE - Math.abs(bank) * 0.026
    );
    this.playerShadow
      .setPosition(this.player.x + velocityX * 0.012, this.player.y + 28)
      .setScale(0.52 + perspective * 0.12, 0.28 + perspective * 0.06)
      .setAlpha(0.18 + perspective * 0.16);
    this.engineFlare
      .setPosition(this.player.x, this.player.y + 32)
      .setScale(0.19 + boostPulse + Math.sin(time * 0.03) * 0.035, 0.3 + boostPulse + Math.sin(time * 0.021) * 0.05)
      .setAlpha(0.44 + boostPulse * 2.3 + Math.sin(time * 0.024) * 0.16);
  }

  private drawPerspectiveGrid() {
    if (!this.depthGrid) return;

    const width = this.scale.width;
    const height = this.scale.height;
    const horizonY = height * 0.28;
    const centerX = width / 2 + Math.sin(this.time.now * 0.00035) * 28;
    const bottomY = height + 80;
    const scroll = (this.time.now * 0.00022) % 1;

    this.depthGrid.clear();
    for (let lane = -7; lane <= 7; lane += 1) {
      const bottomX = centerX + lane * width * 0.13;
      const alpha = 0.05 + (1 - Math.min(1, Math.abs(lane) / 7)) * 0.11;
      this.depthGrid.lineStyle(1, 0x4fe7ff, alpha);
      this.depthGrid.lineBetween(centerX + lane * 6, horizonY, bottomX, bottomY);
    }

    for (let row = 0; row < 13; row += 1) {
      const t = ((row + scroll) % 13) / 12;
      const eased = t * t;
      const y = horizonY + (height - horizonY) * eased;
      const halfWidth = width * (0.1 + eased * 0.72);
      this.depthGrid.lineStyle(1, 0xb6ff6d, 0.035 + eased * 0.16);
      this.depthGrid.lineBetween(centerX - halfWidth, y, centerX + halfWidth, y);
    }
  }

  private drawVignette() {
    if (!this.vignette) return;

    const width = this.scale.width;
    const height = this.scale.height;
    this.vignette.clear();
    this.vignette.fillStyle(0x000000, 0.18).fillRect(0, 0, width, 52);
    this.vignette.fillStyle(0x000000, 0.16).fillRect(0, height - 72, width, 72);
    this.vignette.fillStyle(0x000000, 0.14).fillRect(0, 0, 34, height);
    this.vignette.fillStyle(0x000000, 0.14).fillRect(width - 34, 0, 34, height);
  }

  private perspectiveScale(y: number) {
    return Phaser.Math.Clamp(0.78 + (y / Math.max(1, this.scale.height)) * 0.34, 0.72, 1.16);
  }

  private planetScale(width: number, height: number) {
    return Phaser.Math.Clamp(Math.min(width, height) / 780, 0.38, 0.86);
  }

  private announceWave() {
    if (this.announcedWave === this.mission.wave) return;
    this.announcedWave = this.mission.wave;
    const beat =
      STORY_BEATS.find((item) => item.wave === this.mission.wave) ??
      ({
        speaker: this.mission.wave % 4 === 0 ? "警戒系统" : "领航员岚",
        message:
          this.mission.wave % 4 === 0
            ? "折跃门再次升压，重型单位即将进入空域。"
            : `第 ${this.mission.wave} 波编队进入云层，保持节奏，别让它们压到星港上空。`,
        tone: this.mission.wave % 4 === 0 ? "warning" : "ally"
      } as const);

    emitComms({
      speaker: beat.speaker,
      message: beat.message,
      tone: beat.tone
    });
  }

  private updateHud(time: number, force = false) {
    if (!force && time - this.lastHudAt < 90) return;
    this.lastHudAt = time;
    if (this.comboUntil < time) {
      this.combo = Phaser.Math.Linear(this.combo, 1, 0.08);
    }
    emitHud({
      mode: this.mode,
      score: this.score,
      wave: this.mission.wave,
      hp: Math.min(100, this.hp),
      charge: this.charge,
      weaponLevel: this.weaponLevel
    });
  }
}
