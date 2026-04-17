import { motion, useDragControls } from "motion/react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, ChevronDown } from "lucide-react";
import { Slider } from "./ui/slider";
import { usePlayer } from "../context/PlayerContext";
import { useEffect, useState } from "react";
import { api, ArtistProfile } from "../api";

interface Props {
  onClose: () => void;
}

export function FullScreenPlayer({ onClose }: Props) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    togglePlayPause,
    next,
    previous,
    seek,
    toggleLike,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);

  useEffect(() => {
    if (currentSong?.artist) {
      const primaryFeatString = currentSong.artist.split(',')[0].trim();
      api.getArtistProfile(currentSong.artistId || "", primaryFeatString)
        .then(profile => setArtistProfile(profile))
        .catch(console.error);
    }
  }, [currentSong]);

  const formatTime = (totalSeconds: number) => {
    if (isNaN(totalSeconds)) return "0:00";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!currentSong) return null;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, { offset, velocity }) => {
        if (offset.y > 150 || velocity.y > 500) {
          onClose(); // Swipe down to close
        }
      }}
      className="fixed inset-0 z-[100] bg-background md:hidden flex flex-col pt-safe overflow-y-auto"
    >
      {/* Background blur */}
      <div 
        className="absolute inset-0 z-0 opacity-40 blur-3xl"
        style={{ backgroundImage: `url(${currentSong.albumArt})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="absolute inset-0 bg-background/80 z-0" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 z-10 relative">
        <button onClick={onClose} className="p-2 -ml-2 text-muted-foreground hover:text-white transition-colors">
          <ChevronDown className="w-8 h-8" />
        </button>
        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Now Playing</span>
        <div className="w-8" /> {/* Balance for spacing */}
      </div>

      {/* Artwork Container */}
      <div className="flex-1 w-full flex items-center justify-center px-8 z-10 relative mt-4 max-h-[40vh]">
        <motion.div 
          className="w-full aspect-square max-w-sm rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          animate={{ scale: isPlaying ? 1 : 0.95 }}
          transition={{ duration: 0.5 }}
        >
          <img src={currentSong.albumArt} className="w-full h-full object-cover" alt="Artwork" />
        </motion.div>
      </div>

      {/* Primary Controls */}
      <div className="px-8 pb-10 z-10 relative flex flex-col space-y-6 mt-6">
        
        {/* Title & Like */}
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-2xl font-black text-white truncate">{currentSong.title}</h1>
            <p className="text-lg text-white/70 font-medium truncate mt-1">{currentSong.artist}</p>
          </div>
          <button onClick={() => toggleLike(currentSong.id)} className="p-2">
            <Heart className={`w-7 h-7 ${currentSong.liked ? "fill-primary text-primary" : "text-white/70"}`} />
          </button>
        </div>

        {/* Progress */}
        <div className="w-full space-y-2">
          <Slider
            value={[currentTime]}
            onValueChange={(val) => seek(val[0])}
            max={duration || 100}
            step={1}
            className="w-full touch-none"
          />
          <div className="flex justify-between text-xs font-medium text-white/50 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between pt-2">
          <button onClick={toggleShuffle} className={`p-3 ${isShuffle ? 'text-primary' : 'text-white/60'}`}>
            <Shuffle className="w-6 h-6" />
          </button>
          <button onClick={previous} className="p-3 text-white hover:scale-110 active:scale-90 transition-transform">
            <SkipBack className="w-10 h-10 fill-current" />
          </button>
          <button onClick={togglePlayPause} className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-primary/30">
            {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
          </button>
          <button onClick={next} className="p-3 text-white hover:scale-110 active:scale-90 transition-transform">
            <SkipForward className="w-10 h-10 fill-current" />
          </button>
          <button onClick={toggleRepeat} className={`p-3 relative ${repeatMode > 0 ? 'text-primary' : 'text-white/60'}`}>
            <Repeat className="w-6 h-6" />
            {repeatMode === 2 && <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-primary rounded-full" />}
          </button>
        </div>
      </div>

      {/* Artist Profile Card (Mobile implementation of QueuePanel data) */}
      {artistProfile && (
        <div className="px-6 pb-24 z-10 relative">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
            <h3 className="font-bold text-white text-sm tracking-wide mb-5">About the artist</h3>
            <div className="flex items-center gap-4 mb-4">
              <img src={artistProfile.image} alt={artistProfile.name} className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h4 className="font-bold text-white text-lg">{artistProfile.name}</h4>
                <p className="text-white/60 text-sm mt-0.5">{artistProfile.listeners} monthly listeners</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-h-32 overflow-y-auto">
              {artistProfile.bio}
            </p>
          </div>
        </div>
      )}

    </motion.div>
  );
}
