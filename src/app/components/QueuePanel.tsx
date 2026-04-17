import { motion, AnimatePresence } from "motion/react";
import { Maximize2, MoreHorizontal, CheckCircle2, X } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { usePlayer } from "../context/PlayerContext";
import { useEffect, useState } from "react";
import { api, ArtistProfile } from "../api";

export function QueuePanel() {
  const { queue, currentSong, playSong, isQueueVisible, toggleQueueVisible } = usePlayer();
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);

  useEffect(() => {
    if (currentSong?.artist) {
      // Jiosaavn aggregates multiple artists in one string separated by commas.
      // We'll target the primary artist.
      const primaryFeatString = currentSong.artist.split(',')[0].trim();
      api.getArtistProfile(currentSong.artistId || "", primaryFeatString)
        .then(profile => setArtistProfile(profile))
        .catch(console.error);
    }
  }, [currentSong]);

  if (!currentSong && (!queue || queue.length === 0)) return null;

  return (
    <AnimatePresence>
      {isQueueVisible && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="h-screen bg-card/60 backdrop-blur-3xl border-l border-border transition-all flex origin-right flex-col"
        >
          <div className="w-[340px] flex flex-col h-full overflow-hidden">
            <ScrollArea type="always" className="flex-1 min-h-0">
              
              {/* Header inside Panel */}
              <div className="px-6 pt-6 pb-2 flex justify-between items-center">
                <span className="font-bold text-foreground text-sm tracking-wide">Most fav.</span>
                <div className="group relative">
                  <motion.button
                    onClick={toggleQueueVisible}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5 drop-shadow-md" />
                  </motion.button>
                  <div className="absolute top-8 right-0 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Hide Now Playing view
                  </div>
                </div>
              </div>

              {/* Banner Section */}
              {currentSong && (
                <div className="px-5 pb-5 pt-2">
                  <div className="relative w-full aspect-square overflow-hidden rounded-2xl group shadow-2xl border border-border/20">
                    <img
                      src={currentSong.albumArt}
                      alt={currentSong.title}
                      className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Song Details Footer of Banner */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                      <div className="flex-1 min-w-0 pr-4">
                        <h1 className="text-xl font-black text-white leading-tight drop-shadow-lg truncate">{currentSong.title}</h1>
                        <p className="text-xs font-medium text-white/80 drop-shadow-md mt-1 truncate">{currentSong.artist}</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-primary drop-shadow-md flex-shrink-0" />
                    </div>
                  </div>
                </div>
              )}

        {/* Content Container Below Banner */}
        <div className="p-4 space-y-4">
          
          {/* About the Artist */}
          {artistProfile && (
            <div className="bg-accent/40 rounded-2xl p-5 border border-border/50 hover:bg-accent/60 transition-colors">
              <h3 className="font-bold text-foreground text-sm tracking-wide mb-5">About the artist</h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 shadow-lg border border-border">
                    <img src={artistProfile.image} alt={artistProfile.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-[16px]">{artistProfile.name}</h4>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{artistProfile.listeners} monthly listeners</p>
                  </div>
                  <button className="px-[14px] py-[6px] rounded-full border border-muted-foreground text-[12px] font-bold text-foreground hover:scale-105 hover:border-foreground transition-all">
                    Follow
                  </button>
                </div>

                <p className="text-[13px] text-muted-foreground/90 leading-relaxed font-medium line-clamp-4">
                  {artistProfile.bio}
                </p>
              </div>
            </div>
          )}

          {/* Credits */}
          {currentSong && (
            <div className="bg-accent/40 rounded-2xl p-5 border border-border/50 hover:bg-accent/60 transition-colors">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-foreground text-sm tracking-wide">Credits</h3>
                <button className="text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors">Show all</button>
              </div>

              <div className="space-y-5">
                {/* Main Artist */}
                {currentSong.artist.split(',').map((artName, i) => (
                  <div key={artName + i} className="flex justify-between items-center group">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-bold text-foreground text-[15px] group-hover:underline cursor-pointer truncate">{artName.trim()}</p>
                      <p className="text-[13px] text-muted-foreground mt-0.5">{i === 0 ? "Main Artist" : "Featured"}</p>
                    </div>
                    <button className="px-[14px] py-[6px] rounded-full border border-muted-foreground text-[12px] font-bold text-foreground hover:scale-105 hover:border-foreground transition-all h-fit">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next in Queue */}
          {queue && queue.length > 0 && (
            <div className="bg-accent/40 rounded-2xl p-5 border border-border/50 hover:bg-accent/60 transition-colors mb-6">
               <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-foreground text-sm tracking-wide">Next in queue</h3>
                <button className="text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors">Open queue</button>
              </div>
              
               <div className="space-y-4">
                {queue.slice(0, 3).map((song, i) => (
                  <motion.div
                    key={song.id + i}
                    onClick={() => playSong(song)}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 shadow-md border border-border group-hover:shadow-primary/20 group-hover:border-primary/50 transition-all">
                      <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[14px] text-foreground truncate group-hover:text-primary transition-colors">{song.title}</p>
                      <p className="text-[12px] text-muted-foreground truncate font-medium">{song.artist}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
            </div>
          </ScrollArea>
        </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
