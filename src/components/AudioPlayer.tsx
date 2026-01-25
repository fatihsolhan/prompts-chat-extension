import { cn } from '@/lib/utils';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
interface AudioPlayerProps {
  src: string;
  onError?: () => void;
  className?: string;
  compact?: boolean;
}

const BARS = 60;

export function AudioPlayer({
  src,
  onError,
  className,
  compact = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Generate a static waveform pattern based on src URL (deterministic)
  const waveformHeights = useMemo(() => {
    const seed = src
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: BARS }, (_, i) => {
      const pseudo = Math.abs(Math.sin(seed + i * 12.9898) * 43758.5453 % 1);
      const wave1 = Math.sin((i / BARS) * Math.PI * 2.5 + seed) * 0.2;
      const wave2 = Math.sin((i / BARS) * Math.PI * 5 + seed * 0.5) * 0.15;
      const base = 0.25 + pseudo * 0.5 + wave1 + wave2;
      return Math.max(0.15, Math.min(1, base));
    });
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      onError?.();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [onError]);

  const togglePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (err) {
      console.error('Playback error:', err);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audioRef.current.currentTime = percentage * duration;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-md bg-muted/50',
        className
      )}
      onClick={e => e.stopPropagation()}
    >
      <audio ref={audioRef} src={src} preload="auto" />

      <button
        type="button"
        onClick={togglePlay}
        disabled={!isLoaded}
        className="h-7 w-7 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isPlaying ? (
          <Pause className="h-3 w-3" />
        ) : (
          <Play className="h-3 w-3 ml-0.5" />
        )}
      </button>

      {/* Waveform - SoundCloud style with overlay */}
      <div
        className="flex-1 min-w-0 h-6 flex items-center cursor-pointer relative"
        onClick={handleSeek}
      >
        {/* Background waveform (gray) */}
        <div className="absolute inset-0 flex items-center gap-[1px]">
          {waveformHeights.map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded bg-muted-foreground/30"
              style={{ height: `${Math.max(12, height * 100)}%` }}
            />
          ))}
        </div>

        {/* Progress waveform (colored) - clips based on progress */}
        <div
          className="absolute inset-0 flex items-center gap-[1px] transition-[clip-path] duration-100 ease-linear"
          style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
        >
          {waveformHeights.map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-primary"
              style={{ height: `${Math.max(12, height * 100)}%` }}
            />
          ))}
        </div>
      </div>

      {!compact ? (
        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
          {formatTime(Math.max(0, duration - currentTime))}
        </span>
      ) : null}

      {!compact ? (
        <button
          type="button"
          onClick={toggleMute}
          className="h-6 w-6 shrink-0 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
        >
          {isMuted ? (
            <VolumeX className="h-3 w-3 text-muted-foreground" />
          ) : (
            <Volume2 className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      ) : null}
    </div>
  );
}
