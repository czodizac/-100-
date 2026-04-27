type AudioCtor = typeof AudioContext;

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: AudioCtor;
}

interface MusicProfile {
  key: string;
  bpm: number;
  root: number;
  scale: number[];
  bass: number[];
  lead: number[];
  pad: number[];
  drumEvery: number;
  hatEvery: number;
  intensity: number;
}

interface ExternalTrack {
  src: string;
  rate: number;
  gain: number;
}

const EXTERNAL_TRACKS: Record<string, ExternalTrack> = {
  stage1: { src: "https://opengameart.org/sites/default/files/battle_music_01-loop.ogg", rate: 1, gain: 0.56 },
  stage2: { src: "https://opengameart.org/sites/default/files/synthwavehouse_0.ogg", rate: 1.02, gain: 0.62 },
  stage3: { src: "https://opengameart.org/sites/default/files/fight_looped.wav", rate: 1.04, gain: 0.58 },
  stage4: { src: "https://opengameart.org/sites/default/files/Pulsar.wav", rate: 1.08, gain: 0.64 },
  stage5: { src: "https://opengameart.org/sites/default/files/synthwavehouse_0.ogg", rate: 1.16, gain: 0.66 },
  boss: { src: "https://opengameart.org/sites/default/files/Boss%208_0.ogg", rate: 1.04, gain: 0.76 }
};

const MUSIC_PROFILES: MusicProfile[] = [
  {
    key: "stage1",
    bpm: 116,
    root: 174.61,
    scale: [0, 3, 5, 7, 10, 12],
    bass: [0, 0, 3, 5],
    lead: [12, 15, 17, 15, 10, 12, 7, 10],
    pad: [0, 7, 12],
    drumEvery: 4,
    hatEvery: 2,
    intensity: 0.52
  },
  {
    key: "stage2",
    bpm: 132,
    root: 196,
    scale: [0, 2, 5, 7, 10, 12],
    bass: [0, 5, 0, 7],
    lead: [12, 14, 17, 19, 17, 14, 12, 10],
    pad: [0, 5, 12],
    drumEvery: 4,
    hatEvery: 1,
    intensity: 0.68
  },
  {
    key: "stage3",
    bpm: 148,
    root: 220,
    scale: [0, 3, 5, 6, 10, 12],
    bass: [0, 0, 6, 5],
    lead: [12, 15, 18, 22, 18, 15, 10, 12],
    pad: [0, 6, 12],
    drumEvery: 2,
    hatEvery: 1,
    intensity: 0.82
  },
  {
    key: "stage4",
    bpm: 158,
    root: 246.94,
    scale: [0, 2, 3, 7, 10, 12],
    bass: [0, 7, 3, 10],
    lead: [12, 15, 19, 22, 19, 15, 14, 10],
    pad: [0, 7, 12],
    drumEvery: 2,
    hatEvery: 1,
    intensity: 0.92
  },
  {
    key: "stage5",
    bpm: 172,
    root: 185,
    scale: [0, 1, 4, 6, 8, 12],
    bass: [0, 0, 8, 6],
    lead: [12, 16, 18, 20, 24, 20, 18, 13],
    pad: [0, 6, 12],
    drumEvery: 2,
    hatEvery: 1,
    intensity: 1
  },
  {
    key: "boss",
    bpm: 166,
    root: 164.81,
    scale: [0, 1, 5, 6, 10, 12],
    bass: [0, 0, 1, 6],
    lead: [12, 13, 18, 19, 22, 19, 18, 13],
    pad: [0, 6, 13],
    drumEvery: 2,
    hatEvery: 1,
    intensity: 1
  }
];

export class AudioSystem {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private musicWave = 1;
  private musicBoss = false;
  private musicProfileKey = "";
  private musicPlaying = false;
  private musicVolume = 0.78;
  private sfxVolume = 0.84;
  private tracks = new Map<string, HTMLAudioElement>();
  private currentTrack: HTMLAudioElement | null = null;

  unlock() {
    if (this.context) {
      void this.context.resume();
      this.ensureTracks();
      this.applyVolumes();
      return;
    }

    const Ctor = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!Ctor) return;
    this.context = new Ctor();
    this.master = this.context.createGain();
    this.master.gain.value = 0.92;
    this.master.connect(this.context.destination);
    this.musicGain = this.context.createGain();
    this.musicGain.gain.value = 0;
    this.musicGain.connect(this.master);
    this.sfxGain = this.context.createGain();
    this.sfxGain.connect(this.master);
    this.ensureTracks();
    this.applyVolumes();
    void this.context.resume();
  }

  startMusic(wave: number, boss = false) {
    this.unlock();
    if (!this.context || !this.musicGain) return;

    this.musicPlaying = true;
    this.setWave(wave, boss);
    this.playExternalTrack(this.currentProfile());
    this.launchSting();
    this.fadeMusicTo(this.targetMusicGain(), 0.22);
    if (!this.musicTimer) this.startMusicClock();
  }

  setWave(wave: number, boss = false) {
    this.musicWave = wave;
    this.musicBoss = boss;
    const profile = this.profileForWave(wave, boss);
    if (profile.key === this.musicProfileKey) {
      if (this.musicPlaying) this.playExternalTrack(profile);
      return;
    }

    this.musicProfileKey = profile.key;
    this.musicStep = 0;
    if (this.musicPlaying) {
      this.playExternalTrack(profile);
      this.restartMusicClock();
      this.swell(profile);
    }
  }

  pauseMusic() {
    if (!this.context || !this.musicGain) return;
    this.fadeMusicTo(0, 0.18);
    this.clearMusicClock();
    this.currentTrack?.pause();
  }

  stopMusic() {
    this.musicPlaying = false;
    this.fadeMusicTo(0, 0.24);
    this.clearMusicClock();
    this.tracks.forEach((track) => {
      track.pause();
      track.currentTime = 0;
    });
    this.currentTrack = null;
  }

  shoot(power = 1) {
    const safePower = Math.min(16, power);
    this.tone(540 + safePower * 34, 0.035, "triangle", 0.5, 0.1);
    if (safePower >= 3) {
      this.tone(860 + safePower * 24, 0.04, "square", 0.18, 0.025, 0.012);
    }
    if (safePower >= 4) {
      this.noise(0.028, 0.12);
    }
  }

  hit() {
    this.tone(160, 0.08, "sawtooth", 0.8, 0.04);
  }

  power() {
    this.tone(720, 0.12, "sine", 0.55, 0.18);
    this.tone(1080, 0.11, "triangle", 0.32, 0.16, 0.03);
  }

  pulse() {
    this.tone(150, 0.2, "sine", 0.9, 0.04);
    this.tone(960, 0.28, "triangle", 0.35, 0.22, 0.04);
  }

  explosion() {
    this.noise(0.16, 0.6);
    this.tone(90, 0.18, "sawtooth", 0.6, 0.02);
  }

  setVolumes(music: number, sfx: number) {
    this.musicVolume = this.clampVolume(music);
    this.sfxVolume = this.clampVolume(sfx);
    this.applyVolumes();
  }

  private startMusicClock() {
    const profile = this.currentProfile();
    const stepMs = Math.round((60_000 / profile.bpm) / 2);
    this.playMusicStep();
    this.musicTimer = window.setInterval(() => this.playMusicStep(), stepMs);
  }

  private restartMusicClock() {
    this.clearMusicClock();
    this.startMusicClock();
  }

  private clearMusicClock() {
    if (!this.musicTimer) return;
    window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  private playMusicStep() {
    if (!this.context || !this.musicGain || !this.musicPlaying) return;

    const profile = this.currentProfile();
    const step = this.musicStep;
    const now = this.context.currentTime;
    const bassDegree = profile.bass[Math.floor(step / 4) % profile.bass.length];
    const leadDegree = profile.lead[step % profile.lead.length];

    if (step % 4 === 0) {
      this.musicTone(this.degreeToFrequency(profile, bassDegree - 12), 0.28, "sawtooth", 0.42, 0.03, now);
    }
    if (step % 8 === 0) {
      profile.pad.forEach((degree, index) => {
        this.musicTone(this.degreeToFrequency(profile, degree), 0.9, "sine", 0.072, 0.006, now + index * 0.012);
      });
    }
    if (step % 2 === 0 || profile.intensity > 0.75) {
      this.musicTone(this.degreeToFrequency(profile, leadDegree), 0.13, "triangle", 0.14, 0.01, now);
    }
    if (profile.intensity > 0.65 && step % 2 === 1) {
      const degree = profile.lead[(step + 3) % profile.lead.length] + 12;
      this.musicTone(this.degreeToFrequency(profile, degree), 0.075, "square", 0.055, 0.005, now);
    }
    if (step % profile.drumEvery === 0) {
      this.musicTone(62, 0.1, "sine", 0.72 * profile.intensity, 0.025, now);
    }
    if (step % 4 === 2) {
      this.musicNoise(0.055, 0.18 * profile.intensity, now);
      this.musicTone(185, 0.04, "triangle", 0.12 * profile.intensity, 0.012, now);
    }
    if (step % profile.hatEvery === 0) {
      this.musicNoise(0.03, 0.12 * profile.intensity, now);
    }

    this.musicStep = (this.musicStep + 1) % 32;
  }

  private currentProfile() {
    return this.profileForWave(this.musicWave, this.musicBoss);
  }

  private profileForWave(wave: number, boss: boolean) {
    void boss;
    const stage = Math.floor(Math.max(1, wave) - 1) / 10;
    return MUSIC_PROFILES[Math.floor(stage) % MUSIC_PROFILES.length];
  }

  private degreeToFrequency(profile: MusicProfile, degree: number) {
    return profile.root * 2 ** (degree / 12);
  }

  private targetMusicGain() {
    return (0.14 + Math.min(0.1, Math.max(0, this.musicWave - 1) * 0.012)) * this.musicVolume;
  }

  private fadeMusicTo(value: number, duration: number) {
    if (!this.context || !this.musicGain) return;
    const now = this.context.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(value, now + duration);
  }

  private swell(profile: MusicProfile) {
    if (!this.context) return;
    this.musicTone(profile.root * 2, 0.24, "triangle", 0.22, 0.006, this.context.currentTime);
    this.musicTone(profile.root * 3, 0.32, "sine", 0.16, 0.006, this.context.currentTime + 0.05);
  }

  private launchSting() {
    if (!this.context) return;
    const profile = this.currentProfile();
    const now = this.context.currentTime;
    this.musicTone(profile.root * 2, 0.14, "triangle", 0.28, 0.01, now);
    this.musicTone(profile.root * 4, 0.2, "sine", 0.18, 0.006, now + 0.08);
    this.musicNoise(0.05, 0.14, now + 0.02);
  }

  private ensureTracks() {
    Object.entries(EXTERNAL_TRACKS).forEach(([key, config]) => {
      if (this.tracks.has(key)) return;
      const track = new Audio(config.src);
      track.loop = true;
      track.preload = "auto";
      track.playbackRate = config.rate;
      track.volume = 0;
      this.tracks.set(key, track);
    });
  }

  private playExternalTrack(profile: MusicProfile) {
    this.ensureTracks();
    const track = this.tracks.get(profile.key);
    if (!track) return;

    if (this.currentTrack && this.currentTrack !== track) {
      this.currentTrack.pause();
      this.currentTrack.currentTime = 0;
    }

    const config = EXTERNAL_TRACKS[profile.key];
    track.loop = true;
    track.playbackRate = config.rate;
    track.volume = config.gain * this.musicVolume;
    this.currentTrack = track;

    const playPromise = track.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Browsers may still wait for the next pointer gesture; keep synth music as backup.
      });
    }
  }

  private applyVolumes() {
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
    if (this.musicGain && this.musicPlaying) this.fadeMusicTo(this.targetMusicGain(), 0.08);
    this.tracks.forEach((track, key) => {
      const config = EXTERNAL_TRACKS[key];
      track.volume = config.gain * this.musicVolume;
    });
  }

  private clampVolume(value: number) {
    if (!Number.isFinite(value)) return 0;
    return Math.min(1, Math.max(0, value));
  }

  private tone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    endVolume: number,
    delay = 0
  ) {
    if (!this.context || !this.sfxGain) return;

    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * 0.54), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, endVolume), now + duration);
    oscillator.connect(gain);
    gain.connect(this.sfxGain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  private musicTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    endVolume: number,
    startAt: number
  ) {
    if (!this.context || !this.musicGain) return;

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    if (type !== "sine") {
      oscillator.detune.setValueAtTime(Math.sin(this.musicStep) * 5, startAt);
    }
    gain.gain.setValueAtTime(Math.max(0.001, volume), startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, endVolume), startAt + duration);
    oscillator.connect(gain);
    gain.connect(this.musicGain);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  private noise(duration: number, volume: number) {
    if (!this.context || !this.sfxGain) return;

    const bufferSize = Math.floor(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(this.sfxGain);
    source.start();
  }

  private musicNoise(duration: number, volume: number, startAt: number) {
    if (!this.context || !this.musicGain) return;

    const bufferSize = Math.floor(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, startAt);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
    source.connect(gain);
    gain.connect(this.musicGain);
    source.start(startAt);
  }
}
