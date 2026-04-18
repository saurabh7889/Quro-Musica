import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Shuffle, 
  Search as SearchIcon, 
  Clock, 
  MoreHorizontal, 
  Plus, 
  X,
  Heart,
  Calendar,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { usePlayer, Song, Playlist } from "../context/PlayerContext";
import { api } from "../api";
import { ScrollArea } from "./ui/scroll-area";

interface Props {
  playlist: Playlist;
  onBack: () => void;
}

export function PlaylistDetail({ playlist, onBack }: Props) {
  const { playSong, playPlaylist, currentSong, isPlaying, addSongToPlaylist } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [recommended, setRecommended] = useState<Song[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Load playlist songs from persistence
    api.getSongsByPlaylist(playlist.id).then(playlistSongs => {
      setSongs(playlistSongs);
      
      // Load recommendations (different from current songs)
      api.getSongs().then(all => {
        setRecommended(all.filter(s => !playlistSongs.map(ps => ps.id).includes(s.id)).slice(0, 5));
      });
    });
  }, [playlist]);

  // Contextual Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.searchMusic(searchQuery);
        setSearchResults(results.slice(0, 5));
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddTrack = async (song: Song) => {
    await addSongToPlaylist(song.id, playlist.id);
    setSongs(prev => [...prev, song]);
    setRecommended(prev => prev.filter(s => s.id !== song.id));
    setSearchResults(prev => prev.filter(s => s.id !== song.id));
  };

  return (
    <div className="absolute inset-0 bg-background z-20 flex flex-col animate-in fade-in slide-in-from-right-10 duration-500">
      <ScrollArea className="h-full">
        {/* Immersive Header */}
        <div 
          className="relative h-[30vh] md:h-[45vh] flex items-end p-6 md:p-12 overflow-hidden"
          style={{ 
            background: `linear-gradient(to bottom, ${playlist.id === 'liked' ? '#5038a0' : '#454545'} 0%, var(--background) 110%)` 
          }}
        >
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="absolute top-6 left-6 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors z-30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 relative z-20 w-full">
            <motion.div 
               layoutId={`playlist-art-${playlist.id}`}
               className="w-48 h-48 md:w-64 md:h-64 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex-shrink-0"
            >
              <img src={playlist.coverImage} className="w-full h-full object-cover" alt="" />
            </motion.div>
            
            <div className="flex-1 text-center md:text-left text-white">
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-2 md:mb-4 drop-shadow-lg">Public Playlist</p>
              <h1 className="text-4xl md:text-8xl font-black tracking-tighter mb-4 md:mb-6 drop-shadow-2xl truncate leading-none">
                {playlist.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-bold text-white/80 drop-shadow-lg">
                <span className="text-white">Quro Música</span>
                <span>•</span>
                <span>{playlist.songCount} songs</span>
                <span>•</span>
                <span className="opacity-60">About 45 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 md:px-12 py-8 flex items-center justify-between relative z-10 sticky top-0 bg-background/80 backdrop-blur-xl border-b border-white/5 mb-4">
           <div className="flex items-center gap-6 md:gap-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => playPlaylist(songs)}
                className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all group"
              >
                <Play className="w-6 h-6 md:w-8 md:h-8 text-black fill-current group-hover:scale-110 transition-transform" />
              </motion.button>
              
              <button className="text-muted-foreground hover:text-white transition-colors">
                <Shuffle className="w-6 md:w-8 h-6 md:h-8" />
              </button>
              
              <button className="text-muted-foreground hover:text-white transition-colors">
                <Plus className="w-6 md:w-8 h-6 md:h-8" />
              </button>

              <button className="text-muted-foreground hover:text-white transition-colors">
                <MoreHorizontal className="w-6 md:w-8 h-6 md:h-8" />
              </button>
           </div>

           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all ${isSearchOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`}
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              <div className="hidden md:flex items-center gap-2 text-xs font-bold text-muted-foreground">
                 <span>Custom Order</span>
                 <ChevronLeft className="-rotate-90 w-4 h-4" />
              </div>
           </div>
        </div>

        {/* Songs Table */}
        <div className="px-6 md:px-12 mb-20 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-0 min-w-[600px]">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-muted-foreground/60 border-b border-white/10">
                <th className="py-3 px-4 font-black w-12">#</th>
                <th className="py-3 px-4 font-black">Title</th>
                <th className="py-3 px-4 font-black">Album</th>
                <th className="py-3 px-4 font-black">Date Added</th>
                <th className="py-3 px-4 font-black text-right"><Clock className="w-4 h-4 ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {songs.map((song, index) => (
                <tr 
                  key={song.id}
                  onClick={() => playSong(song)}
                  className="group hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 text-sm font-medium text-muted-foreground/40 text-center">
                    {currentSong?.id === song.id && isPlaying ? (
                       <div className="w-4 h-4 flex items-center justify-center mx-auto">
                          <div className="w-1 bg-primary h-3 mx-0.5 animate-bounce" />
                          <div className="w-1 bg-primary h-4 mx-0.5 animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1 bg-primary h-2 mx-0.5 animate-bounce [animation-delay:0.1s]" />
                       </div>
                    ) : index + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-4">
                      <img src={song.albumArt} className="w-10 h-10 rounded-lg shadow-lg" alt="" />
                      <div className="min-w-0">
                        <p className={`font-bold truncate text-sm ${currentSong?.id === song.id ? 'text-primary' : 'text-white'}`}>{song.title}</p>
                        <p className="text-xs text-muted-foreground truncate font-medium">{song.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground/80 font-medium truncate max-w-[150px]">
                    {song.album}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground/60 font-medium">
                    5 days ago
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-muted-foreground/40 text-right">
                    {song.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Contextual Search - "Let's find something for your playlist" */}
          <div className="mt-16 pb-20">
             <div className="border-t border-white/10 pt-10 mb-10">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Let's find something for your playlist</h2>
                
                <div className="relative max-w-xl group">
                   <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-white transition-colors" />
                   <input 
                      type="text"
                      placeholder="Search songs or artists"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-xl py-4 pl-12 pr-12 text-sm text-white focus:outline-none transition-all"
                   />
                   {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                         <X className="w-4 h-4 text-muted-foreground hover:text-white" />
                      </button>
                   )}
                </div>

                <div className="mt-8 space-y-4">
                   <AnimatePresence mode="popLayout">
                      {searchResults.map((song) => (
                        <motion.div 
                          key={song.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 group/search"
                        >
                           <div className="flex items-center gap-4 flex-1 min-w-0">
                              <img src={song.albumArt} className="w-12 h-12 rounded-xl shadow-lg" alt="" />
                              <div className="min-w-0">
                                 <p className="font-bold text-white truncate text-sm">{song.title}</p>
                                 <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                              </div>
                           </div>
                           <button 
                              onClick={() => handleAddTrack(song)}
                              className="px-6 py-2 rounded-full border border-white/20 text-xs font-black text-white hover:bg-white hover:text-black transition-all uppercase tracking-widest bg-transparent"
                           >
                              Add
                           </button>
                        </motion.div>
                      ))}
                   </AnimatePresence>

                   {isSearching && (
                      <div className="flex items-center gap-3 py-4 text-muted-foreground text-sm font-medium">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        Searching for the best tracks...
                      </div>
                   )}
                </div>
             </div>

             {/* Recommended Section (Visual Placeholder based on vibe) */}
             <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                   <div>
                      <h2 className="text-xl font-black text-white">Recommended</h2>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Based on what's in this playlist</p>
                   </div>
                </div>

                <div className="space-y-4">
                   {recommended.map(song => (
                      <div key={song.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                           <img src={song.albumArt} className="w-12 h-12 rounded-xl shadow-lg" alt="" />
                           <div className="min-w-0">
                              <p className="font-bold text-white truncate text-sm">{song.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                           </div>
                           <div className="hidden lg:block ml-8 px-4 text-xs font-medium text-muted-foreground/60 truncate max-w-[200px]">
                              {song.album}
                           </div>
                        </div>
                        <button 
                           onClick={() => handleAddTrack(song)}
                           className="px-6 py-2 rounded-full border border-white/20 text-xs font-black text-white hover:bg-white hover:text-black transition-all uppercase tracking-widest bg-transparent"
                        >
                           Add
                        </button>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
