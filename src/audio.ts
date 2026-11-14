/* =============================================================================
   AUDIO — every sound effect, dialogue voice and music track on the site lives here.

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

  floweyLaugh: {
    label: "Flowey laugh",
    usedIn: "Not used yet. Play with playSound(\"floweyLaugh\")",
    src: asset("audio/sfx/voices/flowey-laugh.mp3"),
    volume: 0.6,
    synth: synthBlip,
  },
  omegaFloweyLaugh: {
    label: "Omega Flowey laugh",
    usedIn: "Not used yet. Play with playSound(\"omegaFloweyLaugh\")",
    src: asset("audio/sfx/voices/omega-flowey-laugh.mp3"),
    volume: 0.6,
    synth: synthBlip,
  },
  evilFloweyLaugh: {
    label: "Evil Flowey laugh",
    usedIn: "Not used yet. Play with playSound(\"evilFloweyLaugh\")",
    src: asset("audio/sfx/voices/evil-flowey.mp3"),
    volume: 0.6,
    synth: synthBlip,
  },
  spiderLaugh: {
    label: "Spider laugh",
    usedIn: "Not used yet. Play with playSound(\"spiderLaugh\")",
    src: asset("audio/sfx/voices/spider-laugh.mp3"),
    volume: 0.6,
    synth: synthBlip,
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
   DIALOGUE VOICES
   Looping "talking" sounds that play while text types out in a dialogue box,
   and stop the moment the text finishes (or the visitor clicks to skip).
----------------------------------------------------------------------------- */

export type DialogueVoice = {
  label: string;
  usedIn: string;
  /** A looping talking sound. null = generic blips. */
  src: string | null;
  volume: number;
  /** Playback speed. 1 = normal, 1.3 = 30% faster (pitch stays the same). */
  rate: number;
};

export const dialogueVoices = {
  typewriter: {
    label: "Typewriter voice (sans_audio)",
    usedIn:
      "Hero dialogue box on first load, and each project description when it types out",
    src: asset("audio/sfx/sans-voice.mp3"),
    volume: 0.6,
    rate: 1.3,
  },

  // ── Character voices (cut from the voice SFX video). Not used on the page yet.
  //    To use one: <Typewriter voice="papyrus" ... />  or change `typewriter`'s src above.
  sans: {
    label: "sans voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/sans.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
  alphys: {
    label: "Alphys voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/alphys.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
  asgore: {
    label: "Asgore voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/asgore.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
  asriel: {
    label: "Asriel voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/asriel.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
  flowey: {
    label: "Flowey voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/flowey.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
  mettaton: {
    label: "Mettaton voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/mettaton.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
  papyrus: {
    label: "Papyrus voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/papyrus.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
  toriel: {
    label: "Toriel voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/toriel.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
  undyne: {
    label: "Undyne voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/undyne.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
  temmie: {
    label: "Temmie voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/temmie.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
  generic1: {
    label: "Generic 1 voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/generic-1.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
  generic2: {
    label: "Generic 2 voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/generic-2.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
  gaster: {
    label: "Gaster voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/gaster.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
  frisk: {
    label: "Frisk (fan-made) voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/frisk-fanmade.mp3"),
    volume: 0.6,
    rate: 1.3,
  },
} satisfies Record<string, DialogueVoice>;

export type VoiceName = keyof typeof dialogueVoices;

const voiceElements: Partial<Record<VoiceName, HTMLAudioElement>> = {};
const voiceUsers: Partial<Record<VoiceName, number>> = {};

/**
 * Start a dialogue voice. Returns a function that stops it.
 * Several text boxes can share one voice; it stops when the last one finishes.
 * Note: browsers block sound until the visitor has clicked or tapped the page,
 * so text that types out on first load may be silent until then.
 */
export function startVoice(name: VoiceName): () => void {
  const voice: DialogueVoice = dialogueVoices[name];
  voiceUsers[name] = (voiceUsers[name] ?? 0) + 1;
  let blipTimer: number | null = null;

  if (voice.src) {
    let element = voiceElements[name];
    if (!element) {
      element = new Audio(voice.src);
      element.loop = true;
      element.preload = "auto";
      voiceElements[name] = element;
    }
    element.volume = voice.volume;
    element.playbackRate = voice.rate;
    if (element.paused) {
      element.currentTime = 0;
      element.play().catch(() => undefined);
    }
  } else {
    blipTimer = window.setInterval(() => {
      const context = getSfxContext();
      const gain = context.createGain();
      gain.gain.value = voice.volume * 0.4;
      gain.connect(context.destination);
      synthBlip(context, gain);
    }, 70 / voice.rate);
  }

  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    if (blipTimer !== null) window.clearInterval(blipTimer);
    voiceUsers[name] = Math.max(0, (voiceUsers[name] ?? 1) - 1);
    if (voiceUsers[name] === 0) voiceElements[name]?.pause();
  };
}

/* -----------------------------------------------------------------------------
   MUSIC PLAYER PLAYLIST
   The gramophone plays these in order. When there's more than one track,
   PREV / NEXT buttons appear and songs advance automatically when one ends.
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
  {
    // PLACEHOLDER: replace with a real song (set src, delete synth).
    title: "PLACEHOLDER TRACK 2",
    credit: "TEST SONG / REPLACE ME IN SRC/AUDIO.TS",
    src: null,
    volume: 0.35,
    synth: { loopSeconds: 3.2, schedule: synthPlaceholderLoop },
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

/** Placeholder song 2: a minor arpeggio with a bass note, clearly different from track 1. */
function synthPlaceholderLoop(context: AudioContext, destination: AudioNode) {
  const start = context.currentTime + 0.03;
  const step = 0.2;
  const melody = [220, 261.63, 329.63, 440, 329.63, 261.63, 196, 246.94, 293.66, 392, 293.66, 246.94, 174.61, 220, 261.63, 349.23];
  melody.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const noteStart = start + index * step;
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    envelope.gain.setValueAtTime(0.0001, noteStart);
    envelope.gain.exponentialRampToValueAtTime(0.06, noteStart + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.0001, noteStart + step * 0.9);
    oscillator.connect(envelope).connect(destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + step);
  });
  [110, 98, 87.31].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const noteStart = start + index * step * 5.33;
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    envelope.gain.setValueAtTime(0.0001, noteStart);
    envelope.gain.exponentialRampToValueAtTime(0.18, noteStart + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.0001, noteStart + step * 5);
    oscillator.connect(envelope).connect(destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + step * 5.2);
  });
}
