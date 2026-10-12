import { Pause, Play } from "lucide-react";
import { useLanguage } from "./Language";

export function HeroPlaybackButton({
  playing,
  disabled,
  onClick,
}: {
  playing: boolean;
  disabled?: boolean;
  onClick(): void;
}) {
  const { language } = useLanguage();
  const label =
    language === "mn"
      ? playing
        ? "Видеог түр зогсоох"
        : "Видеог тоглуулах"
      : playing
        ? "Pause video"
        : "Play video";
  return (
    <button
      type="button"
      className="hero-playback-toggle"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
    </button>
  );
}
