import { useEffect, useRef, useState } from "react";
import { HeroPlaybackButton } from "./HeroPlaybackButton";

type Player = { mute(): void; playVideo(): void; pauseVideo(): void; destroy(): void };
type PlayerEvent = { target: Player; data: number };
type YouTubeAPI = {
  Player: new (
    element: HTMLElement,
    options: {
      host: string;
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady(event: PlayerEvent): void;
        onStateChange(event: PlayerEvent): void;
        onError(): void;
      };
    },
  ) => Player;
};
declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}
let apiPromise: Promise<YouTubeAPI> | undefined;
function loadAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  return (apiPromise ??= new Promise<YouTubeAPI>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      apiPromise = undefined;
      reject(new Error("Video unavailable"));
    };
    document.head.append(script);
  }));
}

export function youtubeVideoId(source: string) {
  try {
    const url = new URL(source);
    if (
      ![
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "www.youtube-nocookie.com",
      ].includes(url.hostname)
    )
      return null;
    const id =
      url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : url.searchParams.get("v") || url.pathname.split("/")[2];
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function YouTubeHero({ videoId }: { videoId: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [available, setAvailable] = useState(false);
  const playerRef = useRef<Player | null>(null);
  const requestedPlayback = useRef<boolean | null>(null);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let cancelled = false;
    let visible = true;
    let ready = false;
    let player: Player | undefined;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (!ready) return;
      if (
        document.hidden ||
        !visible ||
        requestedPlayback.current === false ||
        (motion.matches && requestedPlayback.current !== true)
      )
        player?.pauseVideo();
      else player?.playVideo();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    void loadAPI()
      .then((api) => {
        if (cancelled) return;
        const slot = document.createElement("div");
        element.append(slot);
        player = new api.Player(slot, {
          host: "https://www.youtube-nocookie.com",
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            playsinline: 1,
            loop: 1,
            playlist: videoId,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return;
              player = event.target;
              playerRef.current = player;
              player.mute();
              ready = true;
              setAvailable(true);
              const iframe = element.querySelector("iframe");
              if (iframe) {
                iframe.title = "UB Circus background video";
                iframe.tabIndex = -1;
                iframe.setAttribute("aria-hidden", "true");
                iframe.setAttribute("allow", "autoplay; encrypted-media");
              }
              sync();
            },
            onStateChange: (event) => {
              if (cancelled) return;
              setPlaying(event.data === 1);
              if (event.data === 1) setHasFrame(true);
            },
            onError: () => {
              if (!cancelled) {
                setPlaying(false);
                setHasFrame(false);
                setAvailable(false);
              }
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setPlaying(false);
      });
    return () => {
      cancelled = true;
      observer.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      player?.destroy();
      playerRef.current = null;
    };
  }, [videoId]);
  return (
    <>
      <div
        ref={container}
        className={"hero-youtube-background" + (hasFrame ? " is-playing" : "")}
        aria-hidden="true"
      />
      {available && (
        <HeroPlaybackButton
          playing={playing}
          onClick={() => {
            requestedPlayback.current = !playing;
            if (playing) playerRef.current?.pauseVideo();
            else playerRef.current?.playVideo();
          }}
        />
      )}
    </>
  );
}
