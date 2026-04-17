import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Sparkles } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { AIPlaylistGenerator } from "./AIPlaylistGenerator";
import { api, Playlist, Song } from "../api";
import { usePlayer } from "../context/PlayerContext";

export function Home() {
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong, playPlaylist } = usePlayer();

  useEffect(() => {
    Promise.all([api.getPlaylists(), api.getRecentlyPlayed()])
      .then(([pl, rp]) => {
        setPlaylists(pl);
        setRecentlyPlayed(rp);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const quickAccessCards = playlists.slice(0, 6);

  const handlePlayPlaylist = async (playlist: Playlist) => {
     // In a real app we'd fetch the songs for this playlist
     // For this prototype, if it's "Liked Songs", we could fetch all liked songs
     // Otherwise just fetch some songs to play
     const allSongs = await api.getSongs();
     const plSongs = allSongs.slice(0, playlist.songCount);
     playPlaylist(plSongs);
  };

  if (loading) {
    return <div className="p-8 text-foreground animate-pulse">Loading amazing music...</div>;
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-8 pb-32">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 text-foreground">
            {getGreeting()}, <span className="text-primary font-black">Saurabh</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Ready to discover your next favorite song?</p>
        </motion.div>

        {/* AI Playlist Generator Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setAiDialogOpen(true)}
            className="w-full max-w-2xl p-4 md:p-6 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 hover:border-primary/40 transition-all shadow-xl hover:shadow-primary/10 backdrop-blur-xl group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4 md:gap-5 relative z-10">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-2xl group-hover:shadow-primary/50 transition-shadow flex-shrink-0"
              >
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
              </motion.div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="text-lg md:text-2xl font-bold text-foreground mb-0.5 md:mb-1 truncate">
                  Generate AI Playlist
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">
                  Let AI create the perfect playlist for your mood and activity
                </p>
              </div>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-primary text-xl font-bold"
              >
                →
              </motion.div>
            </div>
          </motion.button>
        </motion.div>

        {/* Quick Access Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 text-foreground">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {quickAccessCards.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => handlePlayPlaylist(playlist)}
                className="group relative p-3 md:p-4 rounded-2xl bg-card/40 hover:bg-card/60 backdrop-blur-xl border border-border hover:border-primary/30 cursor-pointer transition-all shadow-lg hover:shadow-2xl overflow-hidden"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex items-center gap-3 md:gap-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-2xl">
                    <img
                      src={playlist.coverImage}
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">
                      {playlist.name}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground/70 font-medium">
                      {playlist.songCount} songs
                    </p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <Play className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground fill-current ml-1" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recently Played Section (Last.fm Top Tracks) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Recently Played</h2>
            <button className="text-xs md:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              Show all
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
            {recentlyPlayed.slice(0, 12).map((song, index) => (
              <motion.div
                key={song.id + index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.05, y: -8 }}
                onClick={() => playSong(song)}
                className="group p-4 rounded-3xl bg-card/40 hover:bg-card/60 backdrop-blur-xl border border-border hover:border-primary/20 cursor-pointer transition-all shadow-lg hover:shadow-2xl relative"
              >
                {/* Play button overlay */}
                <motion.div
                  className="absolute bottom-4 right-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10"
                >
                  <Play className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground fill-current ml-1" />
                </motion.div>

                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-2xl">
                  <img
                    src={song.albumArt}
                    alt={song.album}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <h3 className="font-bold text-foreground text-sm truncate mb-1">
                  {song.title}
                </h3>
                <p className="text-xs text-muted-foreground font-medium truncate">{song.artist}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Smart Recommendations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 md:mt-12"
        >
          <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Recommended For You</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {playlists.slice(1, 6).map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.05, y: -8 }}
                onClick={() => handlePlayPlaylist(playlist)}
                className="group p-5 rounded-3xl bg-card/40 hover:bg-card/60 backdrop-blur-xl border border-border hover:border-primary/20 cursor-pointer transition-all shadow-lg hover:shadow-2xl relative"
              >
                {/* AI Tag */}
                <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-primary/90 backdrop-blur-xl shadow-lg">
                  <span className="text-[10px] font-black text-primary-foreground uppercase tracking-widest">AI</span>
                </div>

                {/* Play button overlay */}
                <motion.div
                  className="absolute bottom-4 right-4 w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10"
                >
                  <Play className="w-4 h-4 md:w-7 md:h-7 text-primary-foreground fill-current ml-1" />
                </motion.div>

                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-2xl">
                  <img
                    src={playlist.coverImage}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <h3 className="font-bold text-foreground text-base truncate mb-1">
                  {playlist.name}
                </h3>
                <p className="text-xs text-muted-foreground font-medium truncate line-clamp-2">
                  {playlist.description || `${playlist.songCount} songs`}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <AIPlaylistGenerator open={aiDialogOpen} onOpenChange={setAiDialogOpen} />
    </ScrollArea>
  );
}
