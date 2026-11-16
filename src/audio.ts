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
    usedIn: "Hero section: clicking the dog (clicks 1–7, and the click that ends Dogsong)",
    src: asset("audio/sfx/dog-bark.mp3"),
    volume: 0.6,
    synth: synthNoiseBurst,
  },

  floweyLaugh: {
    label: "Flowey laugh",
    usedIn: "About game: Flowey's laugh after the friendliness pellets hit",
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

  canHit: {
    label: "Beer can bonk",
    usedIn: "About game: Asgore's beer can bonks Flowey on the head (first impact of the can-fall recording)",
    src: asset("audio/sfx/can-hit.mp3"),
    volume: 0.55,
    synth: synthClink,
  },
  canFall: {
    label: "Beer can hitting the ground",
    usedIn: "About game: the can lands and rattles in front of Flowey (plays once, on its first bounce)",
    src: asset("audio/sfx/can-fall.mp3"),
    volume: 0.55,
    synth: synthClink,
  },

  soulHurt: {
    label: "SOUL hit",
    usedIn: "About game: a friendliness pellet hits the heart",
    src: null,
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
    volume: 0.3,
    rate: 1.3,
  },

  // ── Character voices (cut from the voice SFX video). Not used on the page yet.
  //    To use one: <Typewriter voice="papyrus" ... />  or change `typewriter`'s src above.
  sans: {
    label: "sans voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/sans.mp3"),
    volume: 0.3,
    rate: 1.3,
  },
  alphys: {
    label: "Alphys voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/alphys.mp3"),
    volume: 0.3,
    rate: 1.3,
  },
  asgore: {
    label: "Asgore voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/asgore.mp3"),
    volume: 0.3,
    rate: 1.3,
  },
  asriel: {
    label: "Asriel voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/asriel.mp3"),
    volume: 0.3,
    rate: 1.3,
  },
  flowey: {
    label: "Flowey voice",
    usedIn: "About game and Save Files peek: everything Flowey says",
    src: asset("audio/sfx/voices/flowey.mp3"),
    volume: 0.3,
    rate: 1.3,
  },
  mettaton: {
    label: "Mettaton voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/mettaton.mp3"),
    volume: 0.3,
    rate: 1.3,
  },
  papyrus: {
    label: "Papyrus voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/papyrus.mp3"),
    volume: 0.3,
    rate: 1.3,
  },
  toriel: {
    label: "Toriel voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/toriel.mp3"),
    volume: 0.3,
    rate: 1.3,
  },
  undyne: {
    label: "Undyne voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/undyne.mp3"),
    volume: 0.3,
    rate: 1.3,
  },
  temmie: {
    label: "Temmie voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/temmie.mp3"),
    volume: 0.3,
    rate: 1.3,
  },
  generic1: {
    label: "Generic 1 voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/generic-1.mp3"),
    volume: 0.3,
    rate: 1.3,
  },
  generic2: {
    label: "Generic 2 voice",
    usedIn: "About game: the narrator text (signs, and the line after the Asgore ending)",
    src: asset("audio/sfx/voices/generic-2.mp3"),
    volume: 0.3, // file boosted +20 dB (the original cut was nearly inaudible under the music)
    rate: 1.3,
  },
  gaster: {
    label: "Gaster voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/gaster.mp3"),
    volume: 0.3,
    rate: 1.3,
  },
  frisk: {
    label: "Frisk (fan-made) voice",
    usedIn: "Not used yet",
    src: asset("audio/sfx/voices/frisk-fanmade.mp3"),
    volume: 0.3,
    rate: 1.3,
  },
} satisfies Record<string, DialogueVoice>;

export type VoiceName = keyof typeof dialogueVoices;

const voiceElements: Partial<Record<VoiceName, HTMLAudioElement>> = {};

/* ── Text-voice mute (the sans button in the bottom-left corner) ─────────────
   Remembered between visits in this browser. Only affects typing voices,
   not sound effects or music. */
const MUTE_KEY = "text-voice-muted";
let textVoiceMuted = (() => {
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
})();
const muteListeners = new Set<(muted: boolean) => void>();

export const isTextVoiceMuted = () => textVoiceMuted;

export function setTextVoiceMuted(muted: boolean) {
  textVoiceMuted = muted;
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // Storage unavailable (private mode etc.): the setting just won't persist.
  }
  if (muted) Object.values(voiceElements).forEach((element) => element?.pause());
  muteListeners.forEach((listener) => listener(muted));
}

export function onTextVoiceMuteChange(listener: (muted: boolean) => void) {
  muteListeners.add(listener);
  return () => {
    muteListeners.delete(listener);
  };
}
const voiceUsers: Partial<Record<VoiceName, number>> = {};

/* Browsers refuse to play sound until the visitor first clicks, taps or presses a key.
   A voice that was refused is retried on that first interaction, if its text is still typing. */
const retryOnUnlock = new Set<VoiceName>();
let unlockListening = false;
function retryVoiceOnFirstInteraction(name: VoiceName) {
  retryOnUnlock.add(name);
  if (unlockListening) return;
  unlockListening = true;
  const events = ["pointerdown", "keydown", "touchend"] as const;
  const unlock = () => {
    events.forEach((type) => window.removeEventListener(type, unlock, true));
    unlockListening = false;
    const names = [...retryOnUnlock];
    retryOnUnlock.clear();
    for (const voiceName of names) {
      const element = voiceElements[voiceName];
      if (!element || textVoiceMuted || !(voiceUsers[voiceName] ?? 0) || !element.paused) continue;
      element.play().catch(() => undefined);
    }
  };
  events.forEach((type) => window.addEventListener(type, unlock, true));
}

/**
 * Start a dialogue voice. Returns a function that stops it.
 * Several text boxes can share one voice; it stops when the last one finishes.
 * Note: browsers block sound until the visitor has clicked, tapped or pressed a key,
 * so text that types out on first load is silent until then (the voice kicks in on
 * that first interaction if the text is still typing).
 */
export function startVoice(name: VoiceName): () => void {
  if (textVoiceMuted) return () => undefined;
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
      element.play().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "NotAllowedError") retryVoiceOnFirstInteraction(name);
      });
    }
  } else {
    blipTimer = window.setInterval(() => {
      if (textVoiceMuted) return;
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
   The gramophone plays these in order. Shuffled into a new order on every page load; songs advance automatically
   when one ends, and PREV / NEXT step through the shuffled order.
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

/** Every song the gramophone can play. Order here doesn't matter: it's shuffled on each page load. */
const songs: Track[] = [
  { title: "YOUR BEST FRIEND", credit: "TOBY FOX / UNDERTALE", src: asset("audio/music/your-best-friend.mp3"), volume: 0.42 },
  { title: "HOME", credit: "TOBY FOX / UNDERTALE", src: asset("audio/music/home.mp3"), volume: 0.54 },
  { title: "FALLEN DOWN (REPRISE)", credit: "TOBY FOX / UNDERTALE", src: asset("audio/music/fallen-down-reprise.mp3"), volume: 0.49 },
  { title: "SANS.", credit: "TOBY FOX / UNDERTALE", src: asset("audio/music/sans.mp3"), volume: 0.53 },
  { title: "RUINS", credit: "TOBY FOX / UNDERTALE", src: asset("audio/music/ruins.mp3"), volume: 0.42 },
  { title: "MY CASTLE TOWN", credit: "TOBY FOX / DELTARUNE CH. 2", src: asset("audio/music/my-castle-town.mp3"), volume: 0.54 },
  { title: "SHOP", credit: "TOBY FOX / UNDERTALE", src: asset("audio/music/shop.mp3"), volume: 0.53 },
  { title: "SPOOKTUNE", credit: "TOBY FOX / UNDERTALE", src: asset("audio/music/spooktune.mp3"), volume: 0.52 },
  { title: "UWA!! SO TEMPERATE", credit: "TOBY FOX / UNDERTALE", src: asset("audio/music/uwa-so-temperate.mp3"), volume: 0.5 },
  { title: "IT'S RAINING SOMEWHERE ELSE", credit: "TOBY FOX / UNDERTALE", src: asset("audio/music/its-raining-somewhere-else.mp3"), volume: 0.47 },
  { title: "REUNITED", credit: "TOBY FOX / UNDERTALE", src: asset("audio/music/reunited.mp3"), volume: 0.53 },
  { title: "ALPHYS", credit: "TOBY FOX / UNDERTALE", src: asset("audio/music/alphys.mp3"), volume: 0.48 },
  { title: "ONCE UPON A TIME", credit: "TOBY FOX / UNDERTALE", src: asset("audio/music/once-upon-a-time.mp3"), volume: 0.52 },
  { title: "GHOST FIGHT", credit: "TOBY FOX / UNDERTALE", src: asset("audio/music/ghost-fight.mp3"), volume: 0.43 },

  // ── Add more songs. Copy this template: ──────────────────────────────────
  // { title: "SONG TITLE", credit: "ARTIST", src: asset("audio/music/file.mp3"), volume: 0.5 },
];

/**
 * Fisher–Yates shuffle: a random ORDER of the whole list, so every song plays
 * once before any repeats (unlike picking a random song each time).
 */
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

/** The playlist for this visit: all songs, in a fresh random order each page load. */
export const playlist: Track[] = shuffle(songs);

/** Dogsong: NOT in the playlist. Plays only as the dog easter egg (8th click). */
export const dogsong: Track = {
  title: "DOGSONG",
  credit: "TOBY FOX / UNDERTALE",
  src: asset("audio/music/dogsong.mp3"),
  volume: 0.48,
};

/**
 * AI COVERS: songs sung by Armaan's own voice model from the AI Voice Conversion
 * project (so-vits-svc). They play from the special player on that project's
 * card, never from the main playlist. Starting one pauses the main music; when
 * a cover finishes, the main music picks up where it left off.
 * Files: public/audio/covers/ (loudness-matched to the music, 128 kbps).
 */
export const aiCovers: Track[] = [
  { title: "NOTION", credit: "THE RARE OCCASIONS", src: asset("audio/covers/notion.mp3"), volume: 0.5 },
  { title: "FROM THE START", credit: "LAUFEY", src: asset("audio/covers/from-the-start.mp3"), volume: 0.5 },
  { title: "505", credit: "ARCTIC MONKEYS", src: asset("audio/covers/505.mp3"), volume: 0.5 },
  { title: "KARMA POLICE", credit: "RADIOHEAD", src: asset("audio/covers/karma-police.mp3"), volume: 0.5 },
];

/**
 * ASGORE ENDING of the Flowey fight (AboutGame.tsx): his song and the engine
 * revs (rev 1, then rev 2 twice). Lyric cue times live in AboutGame (ASGORE_CUES).
 */
export const asgoreAudio = {
  song: asset("audio/asgore/asgore-runs-over-dess.mp3"),
  revs: asset("audio/asgore/engine-revs.mp3"),
};

/* Anything that wants every piece of site music to stop (the Asgore ending)
   calls silenceAllMusic(); App.tsx listens and stops the playlist, Dogsong and
   any AI cover. Nothing restarts on its own: the visitor has to press play. */
const silenceListeners = new Set<() => void>();
export function onSilenceAllMusic(listener: () => void) {
  silenceListeners.add(listener);
  return () => void silenceListeners.delete(listener);
}
export function silenceAllMusic() {
  silenceListeners.forEach((listener) => listener());
}

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

  /** Pause a file-based track, keeping its position (used while an AI cover plays). */
  pause() {
    this.element?.pause();
  }

  /** Continue a paused track; if there isn't one, start `track` from the top. */
  resume(track: Track) {
    if (this.element) this.element.play().catch(() => this.onError?.(track));
    else this.play(track);
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

/** Two quick metallic pings. Placeholder for a can hitting something. */
function synthClink(context: AudioContext, destination: AudioNode) {
  const now = context.currentTime;
  for (const [delay, freq] of [
    [0, 2350],
    [0.05, 3120],
  ] as const) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(freq, now + delay);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.setValueAtTime(0.35, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);
    oscillator.connect(gain).connect(destination);
    oscillator.start(now + delay);
    oscillator.stop(now + delay + 0.2);
  }
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


