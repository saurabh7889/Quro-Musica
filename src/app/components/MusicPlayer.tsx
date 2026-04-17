import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  Heart,
  MoreHorizontal,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Slider } from "./ui/slider";
import { usePlayer } from "../context/PlayerContext";

export function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    repeatMode,
    togglePlayPause,
    next,
    previous,
    seek,
    setVolume,
    toggleLike,
    toggleShuffle,
    toggleRepeat,
    isQueueVisible,
    toggleQueueVisible
  } = usePlayer();

  const formatTime = (totalSeconds: number) => {
    if (isNaN(totalSeconds)) return "0:00";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!currentSong) return null;

  return (
    <div className="h-24 bg-background/80 backdrop-blur-3xl border-t border-border px-8 flex items-center gap-8 relative overflow-hidden transition-all duration-300">
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10"
        animate={{
          opacity: isPlaying ? [0.4, 0.6, 0.4] : 0.2,
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="flex items-center gap-5 w-1/4 relative z-10">
        {/* Album Art */}
        <motion.div
          className="w-16 h-16 rounded-xl overflow-hidden shadow-2xl relative group"
          whileHover={{ scale: 1.05 }}
        >
          <img
            src={currentSong.albumArt}
            alt={currentSong.album}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {isPlaying && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground truncate text-base leading-tight">
            {currentSong.title}
          </h4>
          <p className="text-sm text-muted-foreground font-medium truncate">{currentSong.artist}</p>
        </div>

        {/* Like Button */}
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleLike(currentSong.id)}
          className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/5"
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              currentSong.liked ? "fill-primary text-primary" : ""
            }`}
          />
        </motion.button>
      </div>

      {/* Center Controls */}
      <div className="flex-1 flex flex-col items-center gap-3 relative z-10">
        {/* Control Buttons */}
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleShuffle}
            className={`transition-all ${
              isShuffle ? "text-primary drop-shadow-[0_0_8px_rgba(29,185,84,0.4)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={previous}
            className="text-muted-foreground hover:text-foreground transition-all"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            className="w-12 h-12 rounded-full bg-foreground text-background hover:scale-105 flex items-center justify-center shadow-xl hover:shadow-primary/20 transition-all border border-foreground/10"
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Pause className="w-6 h-6 fill-current" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Play className="w-6 h-6 fill-current ml-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={next}
            className="text-muted-foreground hover:text-foreground transition-all"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRepeat}
            className={`transition-all ${
              repeatMode > 0 ? "text-primary drop-shadow-[0_0_8px_rgba(29,185,84,0.4)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative">
              <Repeat className="w-4 h-4" />
              {repeatMode === 2 && (
                <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-primary rounded-full shadow-[0_0_5px_rgba(29,185,84,0.6)]" />
              )}
            </div>
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-2xl flex items-center gap-4 group">
          <span className="text-[10px] font-bold text-muted-foreground/60 w-10 text-right font-mono">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative flex items-center">
            <Slider
              value={[currentTime]}
              onValueChange={(value) => seek(value[0])}
              max={duration || 100}
              step={0.1}
              className="w-full z-10"
            />
            {/* Animated Glow on progress handle */}
            <motion.div
              className="absolute top-1/2 left-0 h-1 bg-primary rounded-full blur-[2px] pointer-events-none group-hover:blur-[4px] transition-all"
              style={{ width: `${(currentTime / (duration || 30)) * 100}%`, translateY: "-50%" }}
              animate={{
                opacity: isPlaying ? [0.4, 0.8, 0.4] : 0.4,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground/60 w-10 font-mono">
             {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-5 w-1/4 justify-end relative z-10">
        
        <div className="group relative">
          <motion.button
            onClick={toggleQueueVisible}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`transition-all p-2 rounded-full hover:bg-accent ${
              isQueueVisible ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
          </motion.button>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {isQueueVisible ? "Hide Now Playing view" : "Show Now Playing view"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-muted-foreground" />
          <div className="w-28 flex items-center">
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          className="text-muted-foreground hover:text-foreground transition-all p-2 hover:bg-accent rounded-full"
        >
          <Maximize2 className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
