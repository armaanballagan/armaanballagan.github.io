/* =============================================================================
   AUDIO — every sound effect and every music track on the site lives here.

   HOW TO SWAP IN A REAL SOUND
   1. Drop the file into  public/audio/sfx/   (sound effects)
                     or   public/audio/music/ (songs)
   2. Set that entry's `src` to  asset("audio/sfx/your-file.mp3")
   3. Done. While `src` is null, the generic placeholder sound (`synth`) plays
      instead, so nothing breaks before you have the real file.

   Supported formats: .mp3, .ogg, .wav, .m4a (mp3 is the safest everywhere).
============================================================================= */

/** Builds a URL to a file in /public that works on any hosting path. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

/* -----------------------------------------------------------------------------
   SOUND EFFECTS
----------------------------------------------------------------------------- */

export type SoundEffect = {
  /** Human-readable name, for your reference. */
  label: string;
  /** Where on the site this sound plays. */
  usedIn: string;
  /** Your real sound file, e.g. asset("audio/sfx/bark.mp3"). null = use the placeholder. */
  src: string | null;
  /** 0 to 1. */
  volume: number;
  /** Generic placeholder sound generated in the browser. Used while src is null. */
  synth: (context: AudioContext, destination: AudioNode) => void;
};

export const soundEffects = {
  dogBark: {
    label: "Dog bark",
    usedIn: "Hero section: clicking the dog in the corner of the battle window",
    src: null, // ← e.g. asset("audio/sfx/dog-bark.mp3")
    volume: 0.5,
    synth: synthNoiseBurst,
  },

  // ── Add new sound effects below. Copy this template: ─────────────────────
  // someName: {
  //   label: "What it is",
  //   usedIn: "Where it plays",
  //   src: null,
  //   volume: 0.5,
  //   synth: synthBlip,
  // },
} satisfies Record<string, SoundEffect>;

export type SoundName = keyof typeof soundEffects;

let sfxContext: AudioContext | null = null;

function getSfxContext() {
  if (!sfxContext) sfxContext = new AudioContext();
  if (sfxContext.state === "suspended") void sfxContext.resume();
  return sfxContext;
}

function playSynth(effect: SoundEffect) {
  const context = getSfxContext();
  const gain = context.createGain();
  gain.gain.value = effect.volume;
  gain.connect(context.destination);
  effect.synth(context, gain);
}

/** Play a sound effect by name, e.g. playSound("dogBark"). */
export function playSound(name: SoundName) {
  const effect: SoundEffect = soundEffects[name];
  if (!effect.src) {
    playSynth(effect);
    return;
  }
  const audio = new Audio(effect.src);
  audio.volume = effect.volume;
  // If the file is missing or blocked, fall back to the placeholder.
  audio.play().catch(() => playSynth(effect));
}

/* -----------------------------------------------------------------------------
   MUSIC PLAYER PLAYLIST
   The gramophone plays these in order. When there's more than one track,
   a NEXT button appears and songs advance automatically when one ends.
----------------------------------------------------------------------------- */

export type Track = {
  /** Shown in the player, in quotes. */
  title: string;
  /** Small line under the title (artist, source, etc.). */
  credit: string;
  /** Your song file, e.g. asset("audio/music/my-song.mp3"). null = use synth. */
  src: string | null;
  /** 0 to 1. */
  volume: number;
  /** Optional browser-generated loop, used when src is null. */
  synth?: {
    loopSeconds: number;
    schedule: (context: AudioContext, destination: AudioNode) => void;
  };
};

export const playlist: Track[] = [
  {
    title: "A QUIET DETERMINATION",
    credit: "ORIGINAL BROWSER-GENERATED CHIPTUNE",
    src: null,
    volume: 0.42,
    synth: { loopSeconds: 2.16, schedule: synthChiptuneLoop },
  },

  // ── Add more songs below. Copy this template: ────────────────────────────
  // {
  //   title: "SONG TITLE",
  //   credit: "ARTIST NAME",
  //   src: asset("audio/music/song-file.mp3"),
  //   volume: 0.5,
  // },
];

/** Plays one track at a time from the playlist. Used by the gramophone in App.tsx. */
export class MusicPlayer {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private element: HTMLAudioElement | null = null;

  /** Called when a file-based track finishes (used to auto-advance). */
  onTrackEnd: (() => void) | null = null;
  /** Called if a track's file can't be played (e.g. wrong path). */
  onError: ((track: Track) => void) | null = null;

  play(track: Track) {
    this.stop();

    if (track.src) {
      const element = new Audio(track.src);
      element.volume = track.volume;
      element.loop = playlist.length === 1;
      element.addEventListener("ended", () => this.onTrackEnd?.());
      element.play().catch(() => this.onError?.(track));
      this.element = element;
      return;
    }

    if (track.synth) {
      const context = new AudioContext();
      const master = context.createGain();
      master.gain.value = track.volume;
      master.connect(context.destination);
      track.synth.schedule(context, master);
      this.timer = window.setInterval(
        () => track.synth?.schedule(context, master),
        track.synth.loopSeconds * 1000,
      );
      this.context = context;
      this.master = master;
    }
  }

  stop() {
    if (this.element) {
      this.element.pause();
      this.element = null;
    }
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (this.context && this.master) {
      const context = this.context;
      this.master.gain.setTargetAtTime(0.0001, context.currentTime, 0.04);
      window.setTimeout(() => void context.close(), 150);
    }
    this.context = null;
    this.master = null;
  }
}

/* -----------------------------------------------------------------------------
   GENERIC PLACEHOLDER SOUNDS (browser-generated, no files needed)
----------------------------------------------------------------------------- */

/** Short filtered noise burst. Placeholder for barks, hits, thuds. */
function synthNoiseBurst(context: AudioContext, destination: AudioNode) {
  const duration = 0.34;
  const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    const time = index / context.sampleRate;
    data[index] = (Math.random() * 2 - 1) * Math.exp(-time * 11);
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(420, context.currentTime);
  filter.frequency.exponentialRampToValueAtTime(180, context.currentTime + duration);
  filter.Q.value = 2.4;
  gain.gain.setValueAtTime(1, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(destination);
  source.start();
  source.stop(context.currentTime + duration);
}

/** Short square-wave blip. Placeholder for menu moves, clicks, selects. */
export function synthBlip(context: AudioContext, destination: AudioNode) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(880, now);
  oscillator.frequency.exponentialRampToValueAtTime(1320, now + 0.05);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
  oscillator.connect(gain).connect(destination);
  oscillator.start(now);
  oscillator.stop(now + 0.1);
}

/** The original 12-note chiptune loop. */
function synthChiptuneLoop(context: AudioContext, destination: AudioNode) {
  const notes = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 349.23, 440, 587.33, 440, 349.23];
  const start = context.currentTime + 0.03;
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const noteStart = start + index * 0.18;
    oscillator.type = index % 4 === 3 ? "square" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    envelope.gain.setValueAtTime(0.0001, noteStart);
    envelope.gain.exponentialRampToValueAtTime(0.11, noteStart + 0.015);
    envelope.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.15);
    oscillator.connect(envelope).connect(destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.17);
  });
}
