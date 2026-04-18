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
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isRecsExpanded, setIsRecsExpanded] = useState(false);
  const { playSong, playPlaylist, recentlyPlayed: realHistory } = usePlayer();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pl, trending] = await Promise.all([api.getPlaylists(), api.getRecentlyPlayed()]);
        setPlaylists(pl);
        setTrendingSongs(trending);

        // Personalized Recommendations Logic
        const history = JSON.parse(localStorage.getItem('quro_search_history') || '[]');
        if (history.length > 0) {
          // Use the most recent search term to get relevant songs
          const recs = await api.searchMusic(history[0]);
          setRecommendedSongs(recs);
        } else {
          // Fallback to trending
          setRecommendedSongs(trending);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Recently Played Logic
  const historyToDisplay = realHistory.length > 0 ? realHistory : trendingSongs;
  const historyTitle = realHistory.length > 0 ? "Recently Played" : "Trending Now";
  const historyLimit = isHistoryExpanded ? 10 : 4;
  const visibleHistory = historyToDisplay.slice(0, historyLimit);

  // Recommendations Logic
  const recsLimit = isRecsExpanded ? 10 : 4;
  const visibleRecs = recommendedSongs.slice(0, recsLimit);
  const recsTitle = JSON.parse(localStorage.getItem('quro_search_history') || '[]').length > 0 
    ? `Since you searched for "${JSON.parse(localStorage.getItem('quro_search_history') || '[]')[0]}"`
    : "Recommended For You";

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
            {getGreeting()}, <span className="text-primary font-black">User</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Ready to discover your next favorite song?</p>
        </motion.div>

        {/* AI Playlist Generator Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
          className="mb-10 relative group"
        >
          {/* Vibrant Aura Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          
          <motion.button
            whileHover={{ scale: 1.01, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAiDialogOpen(true)}
            className="w-full max-w-3xl p-6 md:p-8 rounded-[2rem] bg-card/40 hover:bg-card/60 backdrop-blur-3xl border border-white/10 hover:border-primary/50 transition-all shadow-2xl relative overflow-hidden flex items-center gap-6"
          >
            {/* Animated Background Pulse */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10"
              animate={{
                opacity: [0, 0.5, 0],
                x: ['-100%', '100%']
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

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
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(29,185,84,0.4)] group-hover:shadow-primary/60 transition-shadow flex-shrink-0"
            >
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
            </motion.div>
            
            <div className="flex-1 text-left min-w-0 relative z-10">
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">Magic AI</span>
                 <h3 className="text-xl md:text-3xl font-black text-foreground tracking-tight truncate">
                   Generate Playlist
                 </h3>
              </div>
              <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed max-w-md">
                Let our AI understand your mood and craft the ultimate sonic journey just for you.
              </p>
            </div>
            
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-primary text-3xl font-light hidden sm:block"
            >
              →
            </motion.div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {quickAccessCards.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => handlePlayPlaylist(playlist)}
                className="group relative p-3 md:p-4 rounded-2xl bg-card/30 hover:bg-card/50 backdrop-blur-3xl border border-white/5 hover:border-primary/30 cursor-pointer transition-all shadow-xl hover:shadow-primary/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex items-center gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-2xl border border-white/5">
                    <img
                      src={playlist.coverImage}
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-foreground text-sm md:text-base truncate group-hover:text-primary transition-colors">
                      {playlist.name}
                    </h3>
                    <p className="text-xs text-muted-foreground/60 font-bold uppercase tracking-wider">
                      {playlist.songCount} TRACKS
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(29,185,84,0.4)] opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <Play className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground fill-current ml-1" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {/* Recently Played Section (Real history or Trending) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{historyTitle}</h2>
            {historyToDisplay.length > 4 && (
              <button 
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className="text-xs md:text-sm font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20"
              >
                {isHistoryExpanded ? "Show Less" : `Show ${Math.min(6, historyToDisplay.length - 4)} more`}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
            {visibleHistory.map((song, index) => (
              <motion.div
                key={song.id + index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.05, y: -8 }}
                onClick={() => playSong(song)}
                className="group p-4 rounded-3xl bg-card/40 hover:bg-card/60 backdrop-blur-xl border border-border hover:border-primary/20 cursor-pointer transition-all shadow-lg hover:shadow-2xl relative"
              >
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

        {/* Smart Recommendations (Personalized Songs) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 md:mt-12"
        >
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-primary" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">{recsTitle}</h2>
            </div>
            {recommendedSongs.length > 4 && (
              <button 
                onClick={() => setIsRecsExpanded(!isRecsExpanded)}
                className="text-xs md:text-sm font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20"
              >
                {isRecsExpanded ? "Show Less" : `Show ${Math.min(6, recommendedSongs.length - 4)} more`}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
            {visibleRecs.map((song, index) => (
              <motion.div
                key={song.id + index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.05, y: -8 }}
                onClick={() => playSong(song)}
                className="group p-4 rounded-3xl bg-card/40 hover:bg-card/60 backdrop-blur-xl border border-border hover:border-primary/20 cursor-pointer transition-all shadow-lg hover:shadow-2xl relative"
              >
                <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-primary/90 backdrop-blur-xl shadow-lg">
                  <span className="text-[10px] font-black text-primary-foreground uppercase tracking-widest">Personalized</span>
                </div>

                <motion.div
                  className="absolute bottom-4 right-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10"
                >
                  <Play className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground fill-current ml-1" />
                </motion.div>

                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-2xl">
                  <img
                    src={song.albumArt}
                    alt={song.title}
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
        </motion.div>v>
      </div>

      <AIPlaylistGenerator open={aiDialogOpen} onOpenChange={setAiDialogOpen} />
    </ScrollArea>
  );
}
