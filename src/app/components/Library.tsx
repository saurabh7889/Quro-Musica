import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Grid, List, Heart, Clock, Music, Search as SearchIcon, Plus, Play, Info } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { api, Song, Playlist } from "../api";
import { usePlayer } from "../context/PlayerContext";
import { PlaylistDetail } from "./PlaylistDetail";
import { PlaylistContextMenu } from "./PlaylistContextMenu";
import { useLocation } from "react-router";

export function Library() {
  const location = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // ... (existing states)
  
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, playlistId: string } | null>(null);
  
  const { 
    playSong, 
    playPlaylist, 
    toggleLike, 
    recentlyPlayed: realHistory,
    pinnedPlaylists,
    togglePinPlaylist
  } = usePlayer();

  const fetchPlaylists = async () => {
    try {
      const pl = await api.getPlaylists();
      setPlaylists(pl);
    } catch(err) { console.error(err); }
  };

  useEffect(() => {
    Promise.all([api.getPlaylists(), api.getSongs()])
      .then(([pl, sgs]) => {
        setPlaylists(pl);
        setSongs(sgs);
      })
      .catch(console.error);
  }, []);

  const likedSongs = songs.filter((song) => song.liked);
  const displayHistory = realHistory.length > 0 ? realHistory : recentSongs;

  // Filtered Data
  const filteredPlaylists = playlists.filter(pl => 
    pl.name.toLowerCase().includes(librarySearch.toLowerCase())
  );
  const filteredLiked = likedSongs.filter(s => 
    s.title.toLowerCase().includes(librarySearch.toLowerCase()) || 
    s.artist.toLowerCase().includes(librarySearch.toLowerCase())
  );
  const filteredRecent = displayHistory.filter(s => 
    s.title.toLowerCase().includes(librarySearch.toLowerCase()) || 
    s.artist.toLowerCase().includes(librarySearch.toLowerCase())
  );

  const handleOpenPlaylist = (playlistId: string) => {
    if (playlistId === 'liked') {
      setSelectedPlaylist({
        id: 'liked',
        name: 'Liked Songs',
        coverImage: 'https://images.unsplash.com/photo-1514525253361-bee8718a300c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        songCount: likedSongs.length
      });
    } else {
      const pl = playlists.find(p => p.id === playlistId);
      if (pl) setSelectedPlaylist(pl);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, playlistId: id });
  };

  const handleRename = async (id: string) => {
    const newName = window.prompt("New Name:");
    if (newName) {
       await api.renamePlaylist(id, newName);
       fetchPlaylists();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this playlist?")) {
      await api.deletePlaylist(id);
      fetchPlaylists();
    }
  };

  const handlePlayPlaylist = async (playlist: Playlist) => {
     // Play all liked songs if it's the Liked Songs playlist, else generic slice
     if (playlist.id === 'liked') {
        playPlaylist(likedSongs);
     } else {
        const fetchedSongs = await api.getSongs();
        playPlaylist(fetchedSongs.slice(0, playlist.songCount));
     }
  };

  // Auto-open playlist from navigation state
  useEffect(() => {
    if (location.state?.openPlaylist && playlists.length > 0) {
      handleOpenPlaylist(location.state.openPlaylist);
    }
  }, [location.state, playlists, handleOpenPlaylist]);

  return (
    <div className="flex-1 relative overflow-hidden h-full">
      <ScrollArea className="h-full transition-colors duration-300">
        <div className="p-4 md:p-8 pb-32">
          {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="flex-1 min-w-0">
               <h1 className="text-3xl md:text-6xl font-black tracking-tight text-foreground mb-2">
                 Your <span className="text-primary italic">Library</span>
               </h1>
               <p className="text-sm md:text-base text-muted-foreground font-medium">Manage your collection, playlists and favorite tracks.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative group flex-1 md:flex-none md:w-64">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search in library..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-card/40 border border-border focus:border-primary/50 focus:bg-card/60 rounded-xl outline-none transition-all text-white"
                />
              </div>

              {/* Create Playlist Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </motion.button>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-accent/50 border border-border">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="playlists" className="w-full">
          <TabsList className="bg-card/40 border border-border mb-8 p-1 rounded-2xl">
            <TabsTrigger value="playlists" className="rounded-xl px-6 py-2">
              <Music className="w-4 h-4 mr-2" />
              Playlists
            </TabsTrigger>
            <TabsTrigger value="liked" className="rounded-xl px-6 py-2">
              <Heart className="w-4 h-4 mr-2" />
              Liked Songs
            </TabsTrigger>
            <TabsTrigger value="recent" className="rounded-xl px-6 py-2">
              <Clock className="w-4 h-4 mr-2" />
              Recent
            </TabsTrigger>
          </TabsList>

          {/* Playlists Tab */}
          <TabsContent value="playlists">
            {filteredPlaylists.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {filteredPlaylists.map((playlist, index) => (
                    <motion.div
                      key={playlist.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -8 }}
                      onClick={() => handleOpenPlaylist(playlist.id)}
                      onContextMenu={(e) => handleContextMenu(e, playlist.id)}
                      className="group p-4 md:p-5 rounded-3xl bg-card/40 hover:bg-card/60 backdrop-blur-xl border border-border hover:border-primary/20 cursor-pointer transition-all shadow-lg hover:shadow-2xl relative"
                    >
                      {/* Play Overlay */}
                      <motion.div
                        className="absolute bottom-16 right-6 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10"
                      >
                        <Play className="w-4 h-4 text-primary-foreground fill-current ml-1" />
                      </motion.div>

                      <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-xl">
                        <img
                          src={playlist.coverImage}
                          alt={playlist.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <h3 className="font-bold text-foreground text-sm md:text-base truncate mb-1">
                        {playlist.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium truncate">
                        {playlist.songCount} songs
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPlaylists.map((playlist, index) => (
                    <motion.div
                      key={playlist.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, x: 8 }}
                      onClick={() => handleOpenPlaylist(playlist.id)}
                      onContextMenu={(e) => handleContextMenu(e, playlist.id)}
                      className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-card/20 hover:bg-card/40 border border-transparent hover:border-primary/20 cursor-pointer group transition-all"
                    >
                      <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                        <img
                          src={playlist.coverImage}
                          alt={playlist.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-sm md:text-lg truncate">
                          {playlist.name}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">
                          {playlist.description || `${playlist.songCount} songs`}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground/40 group-hover:text-primary transition-colors pr-4">
                        {playlist.songCount} songs
                      </span>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-24 bg-card/10 rounded-[3rem] border border-dashed border-border">
                  <Music className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-lg font-bold text-muted-foreground">No playlists found</p>
                  <p className="text-sm text-muted-foreground/60">Try searching for something else or create one!</p>
              </div>
            )}
          </TabsContent>

          {/* Liked Songs Tab */}
          <TabsContent value="liked">
            {/* Liked Songs Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleOpenPlaylist('liked')}
              onContextMenu={(e) => handleContextMenu(e, 'liked')}
              className="mb-8 p-6 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-purple-600/10 to-transparent border border-white/5 backdrop-blur-3xl relative overflow-hidden group/header cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full animate-pulse" />
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                <div className="relative">
                    <div className="w-32 h-32 md:w-56 md:h-56 rounded-[2.5rem] bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_50px_rgba(29,185,84,0.3)] rotate-3 group-hover/header:rotate-0 transition-transform duration-700 flex-shrink-0">
                    <Heart className="w-16 h-16 md:w-28 md:h-28 text-white fill-white animate-pulse" />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => playPlaylist(likedSongs)}
                        className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:bg-primary hover:text-white transition-colors border-4 border-black/10"
                    >
                        <Play className="w-7 h-7 fill-current ml-1" />
                    </motion.button>
                </div>
                
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-3 py-1 bg-primary/10 rounded-full border border-primary/20">Collection</span>
                  </div>
                  <h2 className="text-4xl md:text-7xl font-black mb-3 text-foreground tracking-tighter">Liked Songs</h2>
                  <p className="text-muted-foreground font-medium text-sm md:text-xl max-w-md">
                    {likedSongs.length} unique tracks saved by you. Your personal sonic vault.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Liked Songs List */}
            {filteredLiked.length > 0 ? (
                <div className="space-y-1">
                {filteredLiked.map((song, index) => (
                    <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.01, x: 8 }}
                    onClick={() => playSong(song)}
                    className="flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer group transition-all"
                    >
                    <span className="text-muted-foreground/30 font-black w-6 md:w-10 text-center text-xs hidden md:block">{index + 1}</span>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-lg relative">
                        <img
                        src={song.albumArt}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0 ml-2">
                        <p className="font-bold text-foreground truncate text-sm md:text-base leading-tight">{song.title}</p>
                        <p className="text-xs text-muted-foreground font-medium truncate opacity-60">{song.artist}</p>
                    </div>
                    <p className="text-xs text-muted-foreground/40 truncate max-w-[150px] hidden lg:block mr-8 italic">
                        {song.album}
                    </p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                        className="p-3 rounded-full hover:bg-primary/10 transition-colors"
                    >
                        <Heart className="w-5 h-5 text-primary fill-primary shadow-primary/50" />
                    </button>
                    <span className="text-xs font-bold text-muted-foreground/30 w-12 text-right mr-4">{song.duration}</span>
                    </motion.div>
                ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-card/10 rounded-[3rem] border border-dashed border-border mt-8">
                  <Heart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-lg font-bold text-muted-foreground">No liked songs found</p>
                  <p className="text-sm text-muted-foreground/60">Tap the heart on any song to add it here!</p>
              </div>
            )}
          </TabsContent>

          {/* Recent Tab (Last.fm Dynamic) */}
          <TabsContent value="recent">
            {filteredRecent.length > 0 ? (
                <div className="space-y-1">
                {filteredRecent.map((song, index) => (
                    <motion.div
                    key={song.id + index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.01, x: 8 }}
                    onClick={() => playSong(song)}
                    className="flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer group transition-all"
                    >
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                        <img
                        src={song.albumArt}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <div className="flex-1 min-w-0 ml-2">
                        <p className="font-bold text-foreground truncate text-sm md:text-base leading-tight">{song.title}</p>
                        <p className="text-xs text-muted-foreground font-medium truncate opacity-60">
                        {song.artist}
                        </p>
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 px-4 py-1.5 rounded-full bg-primary/10 hidden sm:block">Recently Played</span>
                    <span className="text-xs font-bold text-muted-foreground/30 w-12 text-right mr-4">{song.duration}</span>
                    </motion.div>
                ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-card/10 rounded-[3rem] border border-dashed border-border mt-8">
                  <Clock className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-lg font-bold text-muted-foreground">No recent tracks</p>
                  <p className="text-sm text-muted-foreground/60">Start listening to build your history!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>

    {/* Playlist Detail Overlay */}
    <AnimatePresence>
      {selectedPlaylist && (
        <PlaylistDetail 
          playlist={selectedPlaylist} 
          onBack={() => setSelectedPlaylist(null)} 
        />
      )}
    </AnimatePresence>

    {/* Context Menu Overlay */}
    {contextMenu && (
      <PlaylistContextMenu 
        x={contextMenu.x}
        y={contextMenu.y}
        playlistId={contextMenu.playlistId}
        isPinned={pinnedPlaylists.includes(contextMenu.playlistId)}
        onPinToggle={() => togglePinPlaylist(contextMenu.playlistId)}
        onRename={() => handleRename(contextMenu.playlistId)}
        onDelete={() => handleDelete(contextMenu.playlistId)}
        onClose={() => setContextMenu(null)}
      />
    )}
  </div>
);
}
