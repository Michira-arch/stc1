
import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { CarvedButton } from './CarvedButton';

interface Props {
  src: string;
  className?: string;
}

export const AudioPlayer: React.FC<Props> = ({ src, className = '' }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Static pattern for the waveform
  const bars = [40, 70, 30, 80, 50, 90, 30, 70, 40, 60, 80, 40, 30, 50, 90, 60, 40, 70, 30, 50];

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl 
                  bg-ceramic-base dark:bg-obsidian-surface
                  shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.7)]
                  dark:shadow-[inset_3px_3px_6px_#151618,inset_-3px_-3px_6px_#35363e]
                  ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <CarvedButton
        onClick={togglePlay}
        className={`!w-10 !h-10 !rounded-full flex-shrink-0 ${isPlaying ? 'text-emerald-500' : 'text-slate-500'}`}
      >
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </CarvedButton>

      <div className="flex-1 flex flex-col justify-center gap-1">
        {/* CSS Waveform Visualizer */}
        <div className="flex items-center justify-between h-8 px-1 gap-[2px]">
          {bars.map((height, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-300 ${isPlaying ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`}
              style={{
                height: `${height}%`,
                animation: isPlaying ? `pulse 1s infinite ${i * 0.1}s` : 'none'
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />

        {/* Time Overlay */}
        <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};
