import { useEffect, useRef, useState } from "react";

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

type MusicEngine = {
  context: AudioContext;
  master: GainNode;
  timer: number;
};

const projects = [
  {
    id: "01",
    title: "PULSE",
    role: "FULL-STACK / 2024",
    description:
      "A collaborative observability platform helping engineering teams find and fix production issues in real time.",
    stack: ["REACT", "TYPESCRIPT", "NODE.JS"],
    image: "/undertale/screen1.png",
    imageAlt: "Official Undertale screenshot showing the history of humans and monsters",
    accent: "#ffb000",
  },
  {
    id: "02",
    title: "ATLAS",
    role: "PRODUCT ENGINEERING / 2023",
    description:
      "An intelligent research workspace that turns scattered customer feedback into clear product decisions.",
    stack: ["NEXT.JS", "POSTGRESQL", "AI"],
    image: "/undertale/screen10.png",
    imageAlt: "Official Undertale screenshot showing a human and monster before a castle",
    accent: "#00a2ff",
  },
  {
    id: "03",
    title: "THREAD",
    role: "FRONTEND / 2022",
    description:
      "A fast, focused knowledge base that keeps technical documentation close to the code.",
    stack: ["REACT", "GO", "GRAPHQL"],
    image: "/undertale/screen7.png",
    imageAlt: "Official Undertale screenshot featuring Papyrus",
    accent: "#ff3e9d",
  },
];

const experience = [
  ["2022—NOW", "NORTHSTAR LABS", "SENIOR SOFTWARE ENGINEER"],
  ["2020—2022", "FORM & FUNCTION", "SOFTWARE ENGINEER"],
  ["2018—2020", "STUDIO KITE", "FRONTEND DEVELOPER"],
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const [copied, setCopied] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const musicRef = useRef<MusicEngine | null>(null);
  const project = projects[activeProject];

  useEffect(() => {
    return () => {
      if (musicRef.current) {
        window.clearInterval(musicRef.current.timer);
        void musicRef.current.context.close();
      }
    };
  }, []);

  const scheduleChiptune = (context: AudioContext, destination: AudioNode) => {
    const notes = [
      261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 349.23, 440, 587.33, 440, 349.23,
    ];
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
  };

  const toggleMusic = () => {
    if (musicRef.current) {
      const engine = musicRef.current;
      window.clearInterval(engine.timer);
      engine.master.gain.setTargetAtTime(0.0001, engine.context.currentTime, 0.04);
      window.setTimeout(() => void engine.context.close(), 150);
      musicRef.current = null;
      setMusicPlaying(false);
      return;
    }

    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = 0.42;
    master.connect(context.destination);
    scheduleChiptune(context, master);
    const timer = window.setInterval(() => scheduleChiptune(context, master), 2160);
    musicRef.current = { context, master, timer };
    setMusicPlaying(true);
  };

  const playBark = () => {
    const context = new AudioContext();
    const duration = 0.34;
    const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < data.length; index += 1) {
      const time = index / context.sampleRate;
      const envelope = Math.exp(-time * 11);
      data[index] = (Math.random() * 2 - 1) * envelope;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(420, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(180, context.currentTime + duration);
    filter.Q.value = 2.4;
    gain.gain.setValueAtTime(0.5, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(context.destination);
    source.start();
    source.stop(context.currentTime + duration);
    source.addEventListener("ended", () => void context.close());
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("hello@alexmorgan.dev");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = "mailto:hello@alexmorgan.dev";
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b-4 border-white bg-black">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 md:px-8">
          <a href="#top" className="flex items-center gap-3 text-sm tracking-widest">
            <Heart className="size-5 text-[#f00]" />
            <span className="hidden sm:inline">ALEX_MORGAN.EXE</span>
            <span className="sm:hidden">AM.EXE</span>
          </a>
          <nav
            className="hidden items-center gap-8 text-[10px] tracking-widest md:flex"
            aria-label="Main navigation"
          >
            {["WORK", "ABOUT", "EXPERIENCE"].map((item) => (
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
            {["WORK", "ABOUT", "EXPERIENCE", "CONTACT"].map((item) => (
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
              <h1 className="text-[clamp(3rem,8vw,7rem)] leading-[0.95] tracking-[-0.04em]">
                ALEX
                <span className="block text-outline">MORGAN</span>
              </h1>
              <div className="dialog-box mt-10 max-w-2xl">
                <p className="text-base leading-[1.9] sm:text-xl">
                  <span className="mr-3">*</span>I build thoughtful digital experiences, from sturdy
                  systems to interfaces that feel <span className="text-[#ff0]">determined.</span>
                </p>
                <span className="dialog-caret" aria-hidden="true">
                  ▼
                </span>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#work" className="game-button game-button-fight">
                  <Heart className="size-4" /> VIEW WORK
                </a>
                <a href="#about" className="game-button">
                  ACT / ABOUT
                </a>
              </div>
              <div className="music-player mt-8">
                <button
                  onClick={toggleMusic}
                  className={`gramophone-button ${musicPlaying ? "is-playing" : ""}`}
                  aria-label={musicPlaying ? "Stop music" : "Play music"}
                  aria-pressed={musicPlaying}
                >
                  <Gramophone className="size-14 sm:size-16" />
                </button>
                <div>
                  <p className="text-[8px] leading-loose text-white/40">
                    {musicPlaying ? "NOW PLAYING" : "MUSIC PLAYER / OFF"}
                  </p>
                  <p className="mt-1 text-[9px] leading-loose text-[#ff0] sm:text-[10px]">
                    “A QUIET DETERMINATION”
                  </p>
                  <p className="mt-1 text-[7px] leading-loose text-white/30">
                    ORIGINAL BROWSER-GENERATED CHIPTUNE
                  </p>
                </div>
                <span
                  className={`sound-bars ${musicPlaying ? "is-playing" : ""}`}
                  aria-hidden="true"
                >
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="battle-window relative aspect-square overflow-hidden">
                <div className="absolute inset-x-0 top-0 border-b-4 border-white bg-black/85 p-4 text-[10px] leading-loose sm:text-xs">
                  ALEX&nbsp;&nbsp; LV 07
                  <span className="ml-4 text-[#ff0]">HP</span>
                  <span className="ml-2 inline-block h-4 w-20 bg-[#ff0] align-middle" />
                </div>
                <div className="grid h-full place-items-center pt-12">
                  <Heart className="soul-heart size-16 text-[#f00] sm:size-20" />
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
                  onClick={playBark}
                  className="dog-swap size-16 sm:size-20"
                  aria-label="Make the Annoying Dog bark"
                >
                  <img
                    src="/undertale/dog.png"
                    alt="Annoying Dog from Undertale"
                    className="dog-normal image-pixel size-full object-contain"
                  />
                  <img
                    src="/undertale/dog-bark.png"
                    alt=""
                    className="dog-bark image-pixel size-full object-contain"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-20 border-b-4 border-white bg-[#070707] px-5 py-24 md:px-8 lg:py-32"
        >
          <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="mb-5 text-[10px] tracking-widest text-[#00eaff]">AREA 01 / ABOUT</p>
              <div className="overflow-hidden border-4 border-white">
                <img
                  src="/undertale/screen2.png"
                  alt="Official Undertale screenshot showing a human fallen in the Ruins"
                  className="image-pixel aspect-[4/3] w-full object-cover"
                />
              </div>
              <p className="mt-3 text-[8px] leading-relaxed text-white/35">
                DECORATIVE ART FROM THE OFFICIAL UNDERTALE WEBSITE.
              </p>
            </div>
            <div>
              <h2 className="text-4xl leading-tight sm:text-6xl">
                ENGINEER BY TRADE.
                <span className="mt-3 block text-[#00eaff]">MAKER AT HEART.</span>
              </h2>
              <div className="dialog-box mt-10">
                <div className="space-y-5 text-sm leading-[1.9] text-white/80 sm:text-base">
                  <p>* I&apos;m Alex, a software engineer based in San Francisco.</p>
                  <p>
                    * For seven years, I&apos;ve helped ambitious teams turn difficult ideas into
                    simple, useful products.
                  </p>
                  <p>
                    * My favorite place is where product thinking, design craft, and solid
                    engineering meet.
                  </p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["07+", "YEARS"],
                  ["24", "SHIPPED"],
                  ["12M+", "USERS"],
                  ["∞", "COFFEE"],
                ].map(([number, label]) => (
                  <div key={label} className="border-2 border-white p-4 text-center">
                    <div className="text-2xl text-[#ff0]">{number}</div>
                    <div className="mt-2 text-[8px] text-white/45">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

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
              <div className="border-4 border-white p-3">
                {projects.map((item, index) => (
                  <button
                    key={item.title}
                    onClick={() => setActiveProject(index)}
                    className={`project-option ${activeProject === index ? "is-active" : ""}`}
                    aria-pressed={activeProject === index}
                  >
                    <span className="w-7">
                      {activeProject === index ? <Heart className="size-4 text-[#f00]" /> : ""}
                    </span>
                    <span className="w-8 text-white/35">{item.id}</span>
                    <span>{item.title}</span>
                    <span className="ml-auto hidden text-[9px] text-white/35 sm:inline">
                      {item.role}
                    </span>
                  </button>
                ))}
              </div>

              <article className="border-4 border-white">
                <div className="relative aspect-[16/9] overflow-hidden border-b-4 border-white bg-[#111]">
                  <img
                    key={project.image}
                    src={project.image}
                    alt={project.imageAlt}
                    className="image-pixel h-full w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
                  <div
                    className="absolute bottom-0 left-0 bg-black px-4 py-3 text-xs"
                    style={{ color: project.accent }}
                  >
                    FILE {project.id} / {project.title}
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <h3 className="text-3xl sm:text-4xl">{project.title}</h3>
                    <span className="text-[9px] leading-loose text-white/45">{project.role}</span>
                  </div>
                  <p className="mt-6 max-w-2xl text-sm leading-[1.9] text-white/75">
                    * {project.description}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    {project.stack.map((item) => (
                      <span key={item} className="border-2 border-white/40 px-3 py-2 text-[8px]">
                        {item}
                      </span>
                    ))}
                  </div>
                  <a
                    href="#"
                    onClick={(event) => event.preventDefault()}
                    className="mt-8 inline-flex items-center gap-3 text-[10px] text-[#ff0] hover:text-white"
                  >
                    READ CASE STUDY <Arrow />
                  </a>
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
            <div className="mt-12 border-4 border-white p-3 sm:p-6">
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
                  "TYPESCRIPT",
                  "REACT",
                  "NEXT.JS",
                  "NODE.JS",
                  "GO",
                  "POSTGRESQL",
                  "AWS",
                  "FIGMA",
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
                * You feel like a great collaboration is about to begin.
              </p>
              <button
                onClick={copyEmail}
                className="mt-7 flex w-full items-center justify-between border-t-2 border-white/30 pt-6 text-left text-[10px] text-[#ff0] hover:text-white sm:text-xs"
              >
                <span>{copied ? "* EMAIL COPIED TO INVENTORY!" : "* HELLO@ALEXMORGAN.DEV"}</span>
                <Arrow />
              </button>
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="game-button"
                aria-label="GitHub"
              >
                <Github /> GITHUB
              </a>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="game-button"
              >
                LINKEDIN
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-4 border-white bg-black px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 text-[8px] leading-loose text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 ALEX MORGAN / BUILT WITH DETERMINATION.</p>
          <p>UNOFFICIAL FAN-THEMED PORTFOLIO. UNDERTALE IMAGERY © TOBY FOX.</p>
          <a
            href="https://undertale.com/"
            target="_blank"
            rel="noreferrer"
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
