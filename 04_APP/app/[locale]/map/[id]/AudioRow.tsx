"use client";

import { useRef, useState } from "react";

export default function AudioRow({
  text,
  audioUrl,
}: {
  text: string;
  audioUrl: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  return (
    <div className="audio-row">
      <span>{text}</span>
      <button className="play-btn" onClick={toggle} aria-label={`Ascolta: ${text}`}>
        {playing ? "⏸" : "▶"}
      </button>
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
    </div>
  );
}
