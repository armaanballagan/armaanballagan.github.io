import { useEffect, useRef, useState, type MouseEvent } from "react";
import { MusicPlayer, aiCovers, dogsong, playSound, playlist, type Track } from "./audio";
import { Typewriter } from "./Typewriter";
import { Gallery } from "./Gallery";
import { SansToggle } from "./SansToggle";
import { NameIntro } from "./NameIntro";
import { FloweyPeek } from "./FloweyPeek";
import { AboutGame } from "./AboutGame";

type IconProps = { className?: string };

function Arrow({ className = "size-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function Github({ className = "size-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.17-1.11-1.48-1.11-1.48-.91-.62.07-.61.07-.61 1 .07 1.53 1.04 1.53 1.04.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.55 9.55 0 0 1 12 6.82a9.5 9.5 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function Heart({ className = "size-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 3h6v3h4V3h6v3h2v7h-2v3h-3v3h-3v3h-4v-3H7v-3H4v-3H2V6h2V3Z" />
    </svg>
  );
}

function Gramophone({ className = "size-16" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M10 5h25v7H20v12h-6V12h-4V5Z" fill="currentColor" />
      <path d="M35 8 56 2v30L35 20V8Z" fill="#ffb000" />
      <path d="M17 25h33v7H17v-7Zm-5 7h43v27H12V32Z" fill="currentColor" />
      <circle cx="34" cy="44" r="10" fill="#111" stroke="#ffb000" strokeWidth="4" />
      <circle cx="34" cy="44" r="2" fill="#ff0" />
      <path d="M50 35h4v17h-4V35Z" fill="#ffb000" />
    </svg>
  );
}

type Category = "software" | "data" | "hardware";

type ProjectLink = { label: string; href: string };

type Project = {
  id: string;
  title: string;
  role: string;
  description: string;
  stack: string[];
  categories: Category[];
  image: string;
  imageAlt: string;
  links: ProjectLink[];
  /** AI Voice Conversion only: songs sung by my voice model, with their own player on the card. */
  covers?: Track[];
};

// Thumbnails live in public/projects/. If a file is missing, a pixel placeholder shows instead.
const img = (file: string) => `${import.meta.env.BASE_URL}projects/${file}`;

/**
 * External links: a plain click explicitly opens a new tab (some browsers and
 * in-app views were ignoring target="_blank"). Ctrl/⌘/Shift/middle clicks keep
 * the browser's own behaviour. If something blocks the new tab, the click falls
 * back to the plain link (never navigates this page away, which sites like
 * YouTube refuse to load inside an embedded preview).
 */
const openExternal = (event: MouseEvent<HTMLAnchorElement>) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const tab = window.open(event.currentTarget.href, "_blank");
  if (tab) {
    event.preventDefault(); // we opened it ourselves
    tab.opener = null;
  }
  // If the new tab was blocked, the normal target="_blank" link carries on as usual.
};

const EMAIL = "armaanballagan@gmail.com";

const projects: Project[] = [
  {
    id: "01",
    title: "STREET STRIKER",
    role: "STORMHACKS 2026",
    description:
      "A full-body motion controller for Street Fighter 6. A camera tracks your posture to lean, crouch and jump, while ESP32 gloves with IMU sensors turn real punches into light and heavy attacks, sent as standard gamepad inputs.",
    stack: ["PYTHON", "ESP32", "IMU", "COMPUTER VISION"],
    categories: ["hardware", "software"],
    image: img("street-striker.jpg"),
    imageAlt: "Street Striker in action: a player throws punches in the sensor boxing gloves while Street Fighter 6 runs on a laptop",
    links: [
      { label: "VIDEO", href: "https://youtu.be/Oc5va1rGpS0" },
      { label: "DEVPOST", href: "https://devpost.com/software/a-loptcx" },
      { label: "GITHUB", href: "https://github.com/JasonCai0522/Stormhacks2026" },
    ],
  },
  {
    id: "02",
    title: "AIRSIGN",
    role: "HACKCAMP 2026",
    description:
      "A webcam-based sign language interpreter and practice tool. It recognizes hand signs in real time, speaks them aloud, captions replies, and quizzes you on new signs, all running in the browser so video stays on your device.",
    stack: ["NEXT.JS", "TYPESCRIPT", "MEDIAPIPE", "ONNX RUNTIME"],
    categories: ["software", "data"],
    image: img("airsign.jpg"),
    imageAlt: "AirSign tracking a hand signing the letter A, next to an ASL alphabet chart and practice tools",
    links: [
      { label: "LIVE SITE", href: "https://www.talktothehand.cooking/" },
      { label: "VIDEO", href: "https://www.youtube.com/watch?v=KZTJMp2F96Y" },
      { label: "DEVPOST", href: "https://devpost.com/software/airsign-3of20w" },
      { label: "GITHUB", href: "https://github.com/Veer03/AirSign" },
    ],
  },
  {
    id: "03",
    title: "INSIGHTUBC",
    role: "COURSE PROJECT / 2026",
    description:
      "A full-stack data platform for managing, querying and visualizing UBC course, section, building and room datasets through REST endpoints and a Chart.js dashboard, built test-first with a layered Express backend.",
    stack: ["TYPESCRIPT", "EXPRESS", "MOCHA/CHAI", "CHART.JS"],
    categories: ["software", "data"],
    image: img("insightubc.png"),
    imageAlt: "InsightUBC dashboard showing a line chart of UBC's university-wide average grade over the years",
    links: [],
  },
  {
    id: "04",
    title: "JOURNIFYAI",
    role: "STORMHACKS 2025",
    description:
      "A journaling app where you write entries as usual, then talk them through with Gemini-powered AI coaches modeled on inspirational figures, for the perspective you need, not the one you want.",
    stack: ["REACT", "EXPRESS", "MONGODB", "GEMINI"],
    categories: ["software"],
    image: img("journifyai.png"),
    imageAlt: "JournifyAI: the tagline 'Find the Voice You Need. Not the One You Want.' next to its journal timeline and AI coaches screens",
    links: [
      { label: "LIVE SITE", href: "https://journifyai.onrender.com/" },
      { label: "DEVPOST", href: "https://devpost.com/software/journifyai" },
      { label: "GITHUB", href: "https://github.com/JasonCai0522/StormHacks2025" },
    ],
  },
  {
    id: "05",
    title: "NODEIFY",
    role: "NWHACKS 2026",
    description:
      "A connection manager that merges your emails and contacts into one visual network map, filters for conversations that need attention, and flags relationships that have gone cold.",
    stack: ["NEXT.JS", "SNOWFLAKE", "GEMINI", "GMAIL API"],
    categories: ["software", "data"],
    image: img("nodeify.png"),
    imageAlt: "Nodeify dashboard sorting Gmail into priority counts, a node graph and an email list",
    links: [
      { label: "VIDEO", href: "https://www.youtube.com/watch?v=lXix4OAQFw4" },
      { label: "DEVPOST", href: "https://devpost.com/software/nodeify" },
      { label: "GITHUB", href: "https://github.com/jagmansidhu/Nodify" },
    ],
  },
  {
    id: "06",
    title: "MUFFIN TIME",
    role: "INDIE GAME / PYTHON",
    description:
      "An indie platformer built with object-oriented programming, with hand-made levels and intentionally challenging gameplay.",
    stack: ["PYTHON", "OOP", "LEVEL DESIGN"],
    categories: ["software"],
    image: img("muffin-time.jpg"),
    imageAlt: "Muffin Time level 5: a muffin facing a giant angry cloud with glowing red eyes, a key and the exit door, with Keys Left and Time Left at the bottom",
    links: [{ label: "PLAY", href: "https://py3.codeskulptor.org/#user310_RKAVpWhNFN_4.py" }],
  },
  {
    id: "07",
    title: "PI SECURITY ROBOT",
    role: "TEAM PROJECT / 2023",
    description:
      "A Raspberry Pi security robot that uses a camera and OpenCV face detection to spot people, then rotates on its motors and fires a spray mechanism in response.",
    stack: ["PYTHON", "OPENCV", "RASPBERRY PI", "MOTORS"],
    categories: ["hardware"],
    image: img("pi-security-robot.jpg"),
    imageAlt: "The Pi security robot on a classroom table: a spray bottle on a wooden stand, with a Raspberry Pi, breadboard wiring and a motor on a cardboard arm",
    links: [{ label: "VIDEO", href: "https://youtube.com/shorts/fmFXkBdV8xY" }],
  },
  {
    id: "08",
    title: "AI VOICE CONVERSION",
    role: "CS 12 FINAL PROJECT / 2023",
    description:
      "A Tkinter app that downloads a song from YouTube, splits it into lead vocals, backing vocals and instrumental, converts the lead vocals into another voice with so-vits-svc, and mixes it all back together. The voice models are trained on myself and my friends, and it can even turn the result into a music video with an AI-generated image.",
    stack: ["PYTHON", "SO-VITS-SVC", "BS-ROFORMER", "TKINTER", "MIN-DALLE"],
    categories: ["data"],
    image: img("voice-conversion.png"),
    imageAlt: "The AI Voice Changer app: paste a YouTube link, download, split vocals, pick a speaker and f0 method, then convert and play the result",
    links: [{ label: "GITHUB", href: "https://github.com/armaanballagan/SVC-AI-Voice-Changer" }],
    covers: aiCovers,
  },
];

const categoryTabs: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "software", label: "SOFTWARE" },
  { id: "data", label: "DATA" },
  { id: "hardware", label: "HARDWARE" },
];

const experience = [
  ["2024—2029", "UNIVERSITY OF BRITISH COLUMBIA", "BSC, MAJOR IN COMPUTER SCIENCE"],
  ["AUG 2024", "PNE PLAYLAND", "RIDES ATTENDANT AT HELLEVATOR"],
  ["NOV—DEC 2022", "DELTA CONTROLS", "WEX PLACEMENT / PYTHON FOR HVAC SYSTEMS"],
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const [category, setCategory] = useState<"all" | Category>("all");
  const [missingImages, setMissingImages] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const musicRef = useRef<MusicPlayer | null>(null);
  const trackIndexRef = useRef(0);
  // Dog easter egg: each click grows the dog; the 8th click plays Dogsong.
  const DOGSONG_CLICK = 8;
  const [dogClicks, setDogClicks] = useState(0);
  const [dogsongOn, setDogsongOn] = useState(false);
  const dogsongRef = useRef<HTMLAudioElement | null>(null);
  const track = dogsongOn ? dogsong : playlist[trackIndex];
  const audioActive = musicPlaying || dogsongOn;

  // AI covers (AI Voice Conversion card). Playing one pauses the main music;
  // when a cover finishes on its own, the main music carries on where it was.
  const coverRef = useRef<HTMLAudioElement | null>(null);
  const loadedCover = useRef<number | null>(null);
  const musicPausedForCover = useRef(false);
  const [coverIndex, setCoverIndex] = useState(0);
  const [coverPlaying, setCoverPlaying] = useState(false);
  const [coverProgress, setCoverProgress] = useState({ time: 0, duration: 0 });

  // Mini player: appears once the full player has scrolled off the top of the screen.
  const fullPlayerRef = useRef<HTMLDivElement>(null);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  useEffect(() => {
    const element = fullPlayerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowMiniPlayer(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // ...but it steps aside while it would sit on top of a project's link buttons
  // (they're at the bottom-right of the thumbnail, right where the mini player is),
  // otherwise clicks on LIVE SITE / GITHUB etc. landed on the player instead.
  const miniPlayerRef = useRef<HTMLDivElement>(null);
  const [miniPlayerTucked, setMiniPlayerTucked] = useState(false);
  useEffect(() => {
    let frame = 0;
    const check = () => {
      const mini = miniPlayerRef.current;
      if (!mini) return;
      const style = getComputedStyle(mini);
      const right = window.innerWidth - parseFloat(style.right);
      const bottom = window.innerHeight - parseFloat(style.bottom);
      const left = right - mini.offsetWidth;
      const top = bottom - mini.offsetHeight;
      const margin = 12;
      const overlaps = [...document.querySelectorAll<HTMLElement>(".project-link, .cover-deck")].some((link) => {
        if (!link.offsetParent) return false;
        const r = link.getBoundingClientRect();
        return r.right > left - margin && r.left < right + margin && r.bottom > top - margin && r.top < bottom + margin;
      });
      setMiniPlayerTucked(overlaps);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [activeProject, category]); // switching projects moves the link buttons too
  const miniPlayerVisible = showMiniPlayer && !miniPlayerTucked;

  const visibleProjects = projects.filter(
    (item) => category === "all" || item.categories.includes(category),
  );
  const project = projects[activeProject];

  const pickCategory = (next: "all" | Category) => {
    setCategory(next);
    const stillVisible = next === "all" || projects[activeProject].categories.includes(next);
    if (!stillVisible) {
      const first = projects.findIndex((item) => item.categories.includes(next as Category));
      if (first >= 0) setActiveProject(first);
    }
  };

  useEffect(() => {
    return () => {
      musicRef.current?.stop();
      dogsongRef.current?.pause();
      coverRef.current?.pause();
    };
  }, []);

  /** Stop Dogsong (if playing) and put the dog back to normal. */
  const endDogsong = () => {
    const audio = dogsongRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setDogsongOn(false);
    setDogClicks(0);
  };

  const startDogsong = () => {
    if (coverPlaying) stopCover(false);
    musicPausedForCover.current = false;
    musicRef.current?.stop();
    setMusicPlaying(false);
    if (!dogsongRef.current && dogsong.src) {
      const audio = new Audio(dogsong.src);
      audio.addEventListener("ended", () => {
        setDogsongOn(false);
        setDogClicks(0);
      });
      dogsongRef.current = audio;
    }
    const audio = dogsongRef.current;
    if (audio) {
      audio.volume = dogsong.volume;
      audio.currentTime = 0;
      audio.play().catch(() => endDogsong());
    }
    setDogsongOn(true);
  };

  const clickDog = () => {
    if (dogsongOn) {
      // Clicking during Dogsong ends it and resets the dog.
      endDogsong();
      playSound("dogBark");
      return;
    }
    const clicks = dogClicks + 1;
    setDogClicks(clicks);
    if (clicks >= DOGSONG_CLICK) startDogsong();
    else playSound("dogBark");
  };

  const getPlayer = () => {
    if (!musicRef.current) {
      const player = new MusicPlayer();
      player.onTrackEnd = () => goToTrack(trackIndexRef.current + 1, true);
      player.onError = () => {
        player.stop();
        setMusicPlaying(false);
      };
      musicRef.current = player;
    }
    return musicRef.current;
  };

  const goToTrack = (index: number, keepPlaying: boolean) => {
    const next = (index + playlist.length) % playlist.length;
    trackIndexRef.current = next;
    setTrackIndex(next);
    if (!keepPlaying && musicPausedForCover.current) {
      musicRef.current?.stop();
      musicPausedForCover.current = false;
    }
    if (keepPlaying) {
      getPlayer().play(playlist[next]);
      setMusicPlaying(true);
    }
  };

  const toggleMusic = () => {
    if (dogsongOn) {
      // OFF while Dogsong plays: just stop it.
      endDogsong();
      return;
    }
    const player = getPlayer();
    if (musicPlaying) {
      player.stop();
      setMusicPlaying(false);
      return;
    }
    // Continue the song an AI cover interrupted; otherwise start the current song.
    const continuing = musicPausedForCover.current;
    if (coverPlaying) stopCover(false);
    if (continuing) player.resume(playlist[trackIndexRef.current]);
    else player.play(playlist[trackIndexRef.current]);
    musicPausedForCover.current = false;
    setMusicPlaying(true);
  };

  // Changing songs during Dogsong ends it and plays the chosen song.
  const nextTrack = () => {
    const wasDogsong = dogsongOn;
    if (wasDogsong) endDogsong();
    goToTrack(trackIndexRef.current + 1, musicPlaying || wasDogsong);
  };
  const previousTrack = () => {
    const wasDogsong = dogsongOn;
    if (wasDogsong) endDogsong();
    goToTrack(trackIndexRef.current - 1, musicPlaying || wasDogsong);
  };

  /* ── AI covers ── */
  // Leaving the AI Voice Conversion card stops its cover (its controls go with it)
  // and hands back to the main music.
  const projectHasCovers = Boolean(project.covers);
  useEffect(() => {
    if (projectHasCovers) loadCover(loadedCover.current ?? 0); // fetch the length to show
    else if (coverRef.current && !coverRef.current.paused) stopCover(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectHasCovers]);

  const resumeMusicAfterCover = () => {
    if (!musicPausedForCover.current) return;
    musicPausedForCover.current = false;
    getPlayer().resume(playlist[trackIndexRef.current]);
    setMusicPlaying(true);
  };

  const getCoverAudio = () => {
    if (!coverRef.current) {
      const audio = new Audio();
      audio.preload = "metadata";
      const sync = () => setCoverProgress({ time: audio.currentTime, duration: audio.duration || 0 });
      audio.addEventListener("timeupdate", sync);
      audio.addEventListener("loadedmetadata", sync);
      audio.addEventListener("ended", () => {
        audio.currentTime = 0;
        setCoverPlaying(false);
        resumeMusicAfterCover();
      });
      coverRef.current = audio;
    }
    return coverRef.current;
  };

  const loadCover = (index: number) => {
    const audio = getCoverAudio();
    if (loadedCover.current !== index) {
      audio.src = aiCovers[index].src ?? "";
      audio.volume = aiCovers[index].volume;
      loadedCover.current = index;
      setCoverProgress({ time: 0, duration: 0 });
    }
    setCoverIndex(index);
    return audio;
  };

  const playCover = (index: number) => {
    if (dogsongOn) endDogsong();
    if (musicPlaying) {
      musicRef.current?.pause();
      musicPausedForCover.current = true;
      setMusicPlaying(false);
    }
    const audio = loadCover(index);
    setCoverPlaying(true);
    audio.play().catch(() => setCoverPlaying(false));
  };

  const pauseCover = () => {
    coverRef.current?.pause();
    setCoverPlaying(false);
  };

  /** Stop the cover completely; optionally hand back to the main music. */
  const stopCover = (resumeMusic: boolean) => {
    const audio = coverRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setCoverPlaying(false);
    if (resumeMusic) resumeMusicAfterCover();
    else musicPausedForCover.current = false;
  };

  const stepCover = (delta: number) => {
    const next = (coverIndex + delta + aiCovers.length) % aiCovers.length;
    if (coverPlaying) playCover(next);
    else loadCover(next);
  };

  const seekCover = (event: MouseEvent<HTMLDivElement>) => {
    const audio = coverRef.current;
    if (!audio || !coverProgress.duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    audio.currentTime = ((event.clientX - rect.left) / rect.width) * coverProgress.duration;
  };

  const formatTime = (seconds: number) => {
    const whole = Math.max(0, Math.floor(seconds));
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
  };

  /** The special player on the AI Voice Conversion card (sits where other projects have their link buttons). */
  const renderCoverDeck = (className = "") => {
    if (!project.covers) return null;
    const cover = aiCovers[coverIndex];
    const percent = coverProgress.duration ? Math.min(100, (coverProgress.time / coverProgress.duration) * 100) : 0;
    return (
      <div
        className={`cover-deck ${coverPlaying ? "is-playing" : ""} ${className}`}
        role="group"
        aria-label="AI covers sung by my voice model"
      >
        <p className="cover-deck-label">
          <span aria-hidden="true">♪ </span>AI COVER {coverIndex + 1}/{aiCovers.length} · SUNG BY MY VOICE MODEL
        </p>
        <div className="flex items-center gap-2">
          <button type="button" className="player-control !px-2" onClick={() => stepCover(-1)} aria-label="Previous AI cover">
            ◀◀
          </button>
          <button
            type="button"
            className={`player-control cover-play ${coverPlaying ? "is-on" : ""}`}
            onClick={() => (coverPlaying ? pauseCover() : playCover(coverIndex))}
            aria-label={coverPlaying ? `Pause ${cover.title}` : `Play ${cover.title} (AI cover)`}
          >
            {coverPlaying ? "❚❚" : "▶"}
          </button>
          <button type="button" className="player-control !px-2" onClick={() => stepCover(1)} aria-label="Next AI cover">
            ▶▶
          </button>
          <div className="min-w-0 flex-1 leading-relaxed">
            <p className="truncate text-[9px] text-white">"{cover.title}"</p>
            <p className="truncate text-[7px] text-white/50">
              {cover.credit} · {formatTime(coverProgress.time)} /{" "}
              {coverProgress.duration ? formatTime(coverProgress.duration) : "--:--"}
            </p>
          </div>
        </div>
        <div className="cover-deck-bar" onClick={seekCover} aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>
    );
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b-4 border-white bg-black">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 md:px-8">
          <a href="#top" className="flex items-center gap-3 text-sm tracking-widest">
            <Heart className="size-5 text-[#f00]" />
            <span className="hidden lg:inline">ARMAAN_BALLAGAN.EXE</span>
            <span className="lg:hidden">AB.EXE</span>
          </a>
          <nav
            className="hidden items-center gap-8 text-[10px] tracking-widest md:flex"
            aria-label="Main navigation"
          >
            {["WORK", "ABOUT", "EXPERIENCE", "GALLERY"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="pixel-link">
                {item}
              </a>
            ))}
          </nav>
          <a
            href="#contact"
            className="hidden items-center gap-2 border-2 border-white px-4 py-2 text-[10px] tracking-widest transition hover:border-[#ff0] hover:text-[#ff0] md:flex"
          >
            <Heart className="size-3 text-[#f00]" /> CONTACT
          </a>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="border-2 border-white px-3 py-2 text-[10px] md:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? "CLOSE" : "MENU"}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t-4 border-white p-5 md:hidden">
            {["WORK", "ABOUT", "EXPERIENCE", "GALLERY", "CONTACT"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-xs"
              >
                <span className="mr-3 text-[#ff0]">* </span>
                {item}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="top">
        <section className="star-field relative flex min-h-screen items-center border-b-4 border-white px-5 pb-16 pt-28 md:px-8">
          <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative z-10">
              <p className="mb-7 text-xs leading-loose text-[#ff0]">
                * A SOFTWARE ENGINEER APPEARED.
              </p>
              <NameIntro />
              <div className="dialog-box mt-10 max-w-2xl">
                <p className="flex text-base leading-[1.9] sm:text-xl">
                  <span className="mr-3 shrink-0">*</span>
                  <Typewriter
                    parts={[
                      "CS student at UBC who builds software for fun and keeps finding ",
                      { text: "new things to learn", className: "text-[#ff0]" },
                      " along the way.",
                    ]}
                  />
                </p>
                <span className="dialog-caret" aria-hidden="true">
                  ▼
                </span>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#work" className="game-button">
                  <Heart className="size-4" /> VIEW WORK
                </a>
                <a href="#about" className="game-button">
                  ACT / ABOUT
                </a>
                <a href="#gallery" className="game-button">
                  GALLERY
                </a>
                <a href="#contact" className="game-button">
                  CONTACT
                </a>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-[520px] flex-col gap-14">
              <div className="relative">
                <div className="battle-window relative aspect-square overflow-hidden">
                  <div className="absolute inset-x-0 top-0 border-b-4 border-white bg-black/85 p-4 text-[10px] leading-loose sm:text-xs">
                    ARMAAN&nbsp;&nbsp; LV 03
                    <span className="ml-4 text-[#ff0]">HP</span>
                    <span className="ml-2 inline-block h-4 w-20 bg-[#ff0] align-middle" />
                  </div>
                  <div className="grid h-full place-items-center pt-12">
                    <Heart className="soul-heart soul-heart-title size-16 text-[#f00] sm:size-20" />
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 flex justify-between text-[9px] text-white/60 sm:text-[10px]">
                    <span>DESIGN</span>
                    <span>CODE</span>
                    <span>SHIP</span>
                  </div>
                </div>
                <div className="absolute -bottom-7 -right-1 flex items-end">
                  <span className="mr-2 mb-3 hidden text-[9px] text-white/50 sm:inline">
                    CLICK TO BARK →
                  </span>
                  <button
                    onClick={clickDog}
                    className={`dog-swap size-16 sm:size-20 ${dogsongOn ? "is-dogsong" : ""}`}
                    style={{ transform: `scale(${1 + Math.min(dogClicks, DOGSONG_CLICK) * 0.12})` }}
                    aria-label={dogsongOn ? "Stop Dogsong" : "Make the Annoying Dog bark"}
                  >
                    {dogsongOn ? (
                      <img
                        src={`${import.meta.env.BASE_URL}undertale/dog-meme.png`}
                        alt="The dog, transformed"
                        className="image-smooth size-full object-contain"
                      />
                    ) : (
                      <>
                        <img
                          src={`${import.meta.env.BASE_URL}undertale/dog.png`}
                          alt="Annoying Dog from Undertale"
                          className="dog-normal image-pixel size-full object-contain"
                        />
                        <img
                          src={`${import.meta.env.BASE_URL}undertale/dog-bark.png`}
                          alt=""
                          className="dog-bark image-pixel size-full object-contain"
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </button>
                </div>
              </div>
                <div ref={fullPlayerRef} className="music-player is-wide">
                  <button
                    onClick={toggleMusic}
                    className={`gramophone-button ${audioActive ? "is-playing" : ""}`}
                    aria-label={audioActive ? "Turn music off" : "Turn music on"}
                    aria-pressed={audioActive}
                  >
                    <Gramophone className="size-14 sm:size-16" />
                  </button>
                  <div>
                    <p className="text-[8px] leading-loose text-white/40">
                      {dogsongOn ? "NOW PLAYING / ???" : musicPlaying ? "NOW PLAYING" : "MUSIC PLAYER / OFF"}
                    </p>
                    <p className="mt-1 text-[9px] leading-loose text-[#ff0] sm:text-[10px]">
                      “{track.title}”
                    </p>
                    <p className="mt-1 text-[7px] leading-loose text-white/30">{track.credit}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {playlist.length > 1 && (
                        <>
                          <button
                            onClick={previousTrack}
                            className="player-control"
                            aria-label="Previous song"
                          >
                            ◀◀ PREV
                          </button>
                          <button onClick={nextTrack} className="player-control" aria-label="Next song">
                            NEXT ▶▶
                          </button>
                        </>
                      )}
                      {playlist.length > 1 && (
                        <span className="text-[7px] text-white/40">
                          TRACK {trackIndex + 1}/{playlist.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`sound-bars ${audioActive ? "is-playing" : ""}`}
                    aria-hidden="true"
                  >
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
            </div>
          </div>
        </section>

        <AboutGame />

        <section
          id="work"
          className="scroll-mt-20 border-b-4 border-white px-5 py-24 md:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-5 text-[10px] tracking-widest text-[#ff0]">
                  AREA 02 / SELECTED WORK
                </p>
                <h2 className="text-4xl sm:text-6xl">CHOOSE A PROJECT</h2>
              </div>
              <p className="text-xs text-white/50">
                USE YOUR <span className="text-[#f00]">♥</span> TO SELECT
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter projects">
                  {categoryTabs.map((tab) => {
                    const active = category === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => pickCategory(tab.id)}
                        aria-pressed={active}
                        className={`category-tab ${active ? "is-active" : ""}`}
                      >
                        {active && <Heart className="size-3 text-[#f00]" />}
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                <div className="border-4 border-white p-3">
                  {visibleProjects.map((item) => {
                    const index = projects.indexOf(item);
                    const active = activeProject === index;
                    return (
                      <button
                        key={item.title}
                        onClick={() => setActiveProject(index)}
                        className={`project-option ${active ? "is-active" : ""}`}
                        aria-pressed={active}
                      >
                        <span className="w-7 shrink-0">
                          {active ? <Heart className="size-4 text-[#f00]" /> : ""}
                        </span>
                        <span className="w-8 shrink-0 text-white/35">{item.id}</span>
                        <span className="flex min-w-0 flex-col gap-2 leading-relaxed">
                          <span>{item.title}</span>
                          <span className="text-[8px] text-white/35">{item.role}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <article className="border-4 border-white">
                <div className="relative aspect-[16/9] overflow-hidden border-b-4 border-white bg-[#111]">
                  {missingImages[project.image] ? (
                    <div className="star-field grid h-full w-full place-items-center p-6 text-center">
                      <div>
                        <Heart className="soul-heart mx-auto size-10 text-[#f00]" />
                        <p className="mt-6 text-[9px] leading-loose text-white/50">
                          * THE SCREENSHOT IS STILL OUT EXPLORING.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <img
                      key={project.image}
                      src={project.image}
                      alt={project.imageAlt}
                      onError={() =>
                        setMissingImages((previous) => ({ ...previous, [project.image]: true }))
                      }
                      className="image-smooth h-full w-full object-cover opacity-80"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3">
                    <div className="shrink-0 bg-black px-4 py-3 text-xs text-[#ff0]">
                      FILE {project.id} / {project.title}
                    </div>
                    {(project.links.length > 0 || project.covers) && (
                      <div className="mb-3 mr-3 hidden min-w-0 flex-col items-end gap-2 sm:flex">
                        {project.links.length > 0 && (
                      <div className="flex min-w-0 flex-wrap-reverse justify-end gap-2">
                        {project.links.map((link) => (
                          <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={openExternal}
                            className="project-link"
                          >
                            {link.label} <Arrow className="size-3" />
                          </a>
                        ))}
                      </div>
                        )}
                        {renderCoverDeck()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  {project.links.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2 sm:hidden">
                      {project.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          onClick={openExternal}
                          className="project-link"
                        >
                          {link.label} <Arrow className="size-3" />
                        </a>
                      ))}
                    </div>
                  )}
                  {renderCoverDeck("mb-6 w-full sm:hidden")}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <h3 className="text-3xl sm:text-4xl">{project.title}</h3>
                    <span className="text-[9px] leading-loose text-white/45">{project.role}</span>
                  </div>
                  <p className="mt-6 flex max-w-2xl text-sm leading-[1.9] text-white/75">
                    <span className="mr-3 shrink-0">*</span>
                    <Typewriter key={project.id} parts={[project.description]} speed={12} />
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    {project.stack.map((item) => (
                      <span key={item} className="border-2 border-white/40 px-3 py-2 text-[8px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          id="experience"
          className="scroll-mt-20 border-b-4 border-white px-5 py-24 md:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-[1280px]">
            <p className="mb-5 text-[10px] tracking-widest text-[#ff3e9d]">AREA 03 / EXPERIENCE</p>
            <h2 className="text-4xl sm:text-6xl">SAVE FILES</h2>
            <div className="relative mt-16 border-4 border-white p-3 sm:p-6">
              <FloweyPeek />
              {experience.map(([period, company, role], index) => (
                <div key={company} className="save-row">
                  <span className="text-[#ff0]">FILE {index + 1}</span>
                  <div>
                    <h3 className="text-sm sm:text-base">{company}</h3>
                    <p className="mt-2 text-[9px] text-white/45">{role}</p>
                  </div>
                  <span className="text-[9px] text-white/45 sm:text-xs">{period}</span>
                </div>
              ))}
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-[0.35fr_1fr]">
              <p className="text-[10px] text-white/45">INVENTORY / TOOLS</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-[10px] sm:grid-cols-4">
                {[
                  "PYTHON",
                  "JAVA",
                  "TYPESCRIPT",
                  "C / C++",
                  "SQL",
                  "R",
                  "REACT",
                  "NODE / EXPRESS",
                  "OPENCV",
                  "RASPBERRY PI",
                  "ARDUINO / ESP32",
                  "GIT",
                ].map((skill) => (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="text-[#ff0]">* </span>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Gallery />

        <section id="contact" className="star-field scroll-mt-20 px-5 py-24 md:px-8 lg:py-32">
          <div className="relative mx-auto max-w-[1000px] text-center">
            <Heart className="mx-auto size-10 text-[#f00]" />
            <p className="mt-7 text-[10px] tracking-widest text-[#ff0]">FINAL AREA / CONTACT</p>
            <h2 className="mt-8 text-4xl leading-tight sm:text-7xl">
              LET&apos;S MAKE
              <br />
              SOMETHING GREAT.
            </h2>
            <div className="dialog-box mx-auto mt-12 max-w-2xl text-left">
              <p className="text-sm leading-[1.9] sm:text-base">
                * You feel like you&apos;ve found your next new hire. It fills you with determination!
              </p>
              <p className="mt-4 text-sm leading-[1.9] sm:text-base">
                * Open to internships, collaborations and full-time roles. Say hi and I&apos;ll get back to you quickly.
              </p>
              <button
                onClick={copyEmail}
                className="mt-7 flex w-full items-center justify-between border-t-2 border-white/30 pt-6 text-left text-[10px] text-[#ff0] hover:text-white sm:text-xs"
              >
                <span>{copied ? "* EMAIL COPIED TO INVENTORY!" : `* ${EMAIL.toUpperCase()}`}</span>
                <Arrow />
              </button>
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <a
                href="https://github.com/armaanballagan"
                target="_blank"
                rel="noreferrer"
                onClick={openExternal}
                className="game-button"
                aria-label="GitHub"
              >
                <Github /> GITHUB
              </a>
              <a
                href="https://www.linkedin.com/in/armaan-ballagan/"
                target="_blank"
                rel="noreferrer"
                onClick={openExternal}
                className="game-button"
              >
                LINKEDIN
              </a>
            </div>
          </div>
        </section>
      </main>

      <SansToggle />

      <div
        ref={miniPlayerRef}
        className={`mini-player ${miniPlayerVisible ? "is-visible" : ""}`}
        aria-hidden={!miniPlayerVisible}
        role="region"
        aria-label="Music player (mini)"
      >
        <button
          onClick={toggleMusic}
          className={`gramophone-button ${audioActive ? "is-playing" : ""}`}
          aria-label={audioActive ? "Turn music off" : "Turn music on"}
          aria-pressed={audioActive}
          tabIndex={miniPlayerVisible ? 0 : -1}
        >
          <Gramophone className="size-9 sm:size-10" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[7px] leading-loose text-white/40">
            {dogsongOn ? "NOW PLAYING / ???" : musicPlaying ? "NOW PLAYING" : "MUSIC / OFF"}
          </p>
          <p className="truncate text-[8px] leading-loose text-[#ff0] sm:text-[9px]">“{track.title}”</p>
        </div>
        {playlist.length > 1 && (
          <div className="flex shrink-0 gap-1">
            <button
              onClick={previousTrack}
              className="player-control !px-2"
              aria-label="Previous song"
              tabIndex={miniPlayerVisible ? 0 : -1}
            >
              ◀◀
            </button>
            <button
              onClick={nextTrack}
              className="player-control !px-2"
              aria-label="Next song"
              tabIndex={miniPlayerVisible ? 0 : -1}
            >
              ▶▶
            </button>
          </div>
        )}
      </div>

      <footer className="border-t-4 border-white bg-black px-5 pt-8 pb-32 md:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 text-[8px] leading-loose text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ARMAAN BALLAGAN / BUILT WITH DETERMINATION.</p>
          <p>UNOFFICIAL FAN-THEMED PORTFOLIO. UNDERTALE IMAGERY © TOBY FOX.</p>
          <a
            href="https://undertale.com/"
            target="_blank"
            rel="noreferrer"
            onClick={openExternal}
            className="text-white/60 hover:text-[#ff0]"
          >
            ART SOURCE: OFFICIAL SITE ↗
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
