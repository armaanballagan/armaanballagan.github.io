import { useEffect, useState } from "react";
import { isTextVoiceMuted, onTextVoiceMuteChange, setTextVoiceMuted } from "./audio";

const image = (file: string) => `${import.meta.env.BASE_URL}${file}`;

/**
 * Floating sans in the bottom-left corner that mutes/unmutes the typing voice.
 * Trombone sans = text voice ON. Regular sans = text voice OFF.
 */
export function SansToggle() {
  const [muted, setMuted] = useState(isTextVoiceMuted());

  useEffect(() => onTextVoiceMuteChange(setMuted), []);

  const voiceOn = !muted;

  return (
    <button
      onClick={() => setTextVoiceMuted(!muted)}
      className="sans-toggle group fixed bottom-4 left-4 z-40 flex flex-col items-start gap-1 sm:bottom-6 sm:left-6"
      aria-pressed={voiceOn}
      aria-label={voiceOn ? "Text voice is on. Click to mute it." : "Text voice is muted. Click to turn it on."}
      title={voiceOn ? "Mute text voice" : "Unmute text voice"}
    >
      <span className="sans-toggle-label">TEXT SFX: {voiceOn ? "ON" : "OFF"}</span>
      <span className="flex h-16 w-20 items-end sm:h-24 sm:w-[7.5rem]">
        <img
          src={image(voiceOn ? "sans-trombone.png" : "sans-idle.png")}
          alt=""
          aria-hidden="true"
          className="image-smooth max-h-full max-w-full object-contain object-left-bottom transition-transform duration-150 group-hover:-translate-y-1"
        />
      </span>
    </button>
  );
}
