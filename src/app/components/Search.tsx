import { useState, useEffect } from "react";
import { Search as SearchIcon, Mic, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { api, Song, Playlist } from "../api";
import { usePlayer } from "../context/PlayerContext";

export function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const { playSong, playPlaylist } = usePlayer();

  useEffect(() => {
    api.getPlaylists()
      .then(setAllPlaylists)
      .catch(console.error);
  }, []);

  // Debounced search logic for initial results
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setPage(0);
      setHasMore(true);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setPage(0); // Reset page on new query
      
      try {
        const results = await api.searchMusic(trimmedQuery, 0);
        setSearchResults(results);
        setHasMore(results.length >= 20);
      } catch (err: any) {
        console.error("Search API Execution Failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    
    const nextPage = page + 1;
    setIsLoadingMore(true);
    
    try {
      const results = await api.searchMusic(searchQuery, nextPage);
      if (results.length === 0) {
        setHasMore(false);
      } else {
        setSearchResults(prev => [...prev, ...results]);
        setPage(nextPage);
        setHasMore(results.length >= 20);
      }
    } catch (err) {
      console.error("Failed to load more results", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filteredPlaylists = allPlaylists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayPlaylist = async (playlist: Playlist) => {
     const fetchedSongs = await api.getSongs();
     const plSongs = fetchedSongs.slice(0, playlist.songCount);
     playPlaylist(plSongs);
  };

  const categories = [
    { name: "Pop", color: "from-pink-500 to-rose-500" },
    { name: "Hip-Hop", color: "from-orange-500 to-red-500" },
    { name: "Rock", color: "from-purple-500 to-indigo-500" },
    { name: "Electronic", color: "from-cyan-500 to-blue-500" },
    { name: "Jazz", color: "from-amber-500 to-yellow-500" },
    { name: "Classical", color: "from-violet-500 to-purple-500" },
    { name: "R&B", color: "from-rose-500 to-pink-500" },
    { name: "Country", color: "from-green-500 to-emerald-500" },
  ];

  return (
    <ScrollArea className="h-full transition-colors duration-300">
      <div className="p-4 md:p-8 pb-32">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">Search</h1>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <kbd className="px-2 py-1 rounded-lg bg-accent border border-border">⌘</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 rounded-lg bg-accent border border-border">K</kbd>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-3xl">
            <div className="relative group">
              <SearchIcon className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="What do you want to listen to?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 md:pl-16 pr-24 md:pr-32 py-6 md:py-8 text-base md:text-xl bg-card/40 border-border focus:border-primary/50 focus:bg-card/60 rounded-2xl md:rounded-3xl backdrop-blur-2xl transition-all text-foreground placeholder:text-muted-foreground/50 shadow-2xl"
              />
              
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {/* Loader or Clear Button */}
                <AnimatePresence mode="wait">
                  {isSearching ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </motion.div>
                  ) : searchQuery && (
                    <motion.button
                      key="clear"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery("")}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Voice Search Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsVoiceActive(!isVoiceActive)}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                    isVoiceActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40"
                      : "bg-accent hover:bg-accent/80 text-muted-foreground"
                  }`}
                >
                  <Mic className="w-4 h-4 md:w-6 md:h-6" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Results */}
        <AnimatePresence mode="wait">
          {searchQuery ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-card/40 border border-border mb-8 p-1 rounded-2xl">
                  <TabsTrigger value="all" className="rounded-xl px-8 py-2">All</TabsTrigger>
                  <TabsTrigger value="songs" className="rounded-xl px-8 py-2">Songs</TabsTrigger>
                  <TabsTrigger value="playlists" className="rounded-xl px-8 py-2">Playlists</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-12">
                  {/* Songs Results */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl md:text-2xl font-bold text-foreground">Songs</h2>
                    </div>
                    {searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {searchResults.slice(0, 20).map((song, index) => (
                          <motion.div
                            key={song.id + index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, x: 8 }}
                            onClick={() => playSong(song)}
                            className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-card/20 hover:bg-card/40 border border-transparent hover:border-primary/20 cursor-pointer group transition-all"
                          >
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                              <img
                                src={song.albumArt}
                                alt={song.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-foreground truncate text-sm md:text-lg">
                                {song.title}
                              </p>
                              <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">
                                {song.artist}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-muted-foreground/40 group-hover:text-primary transition-colors">
                              {song.duration}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    ) : !isSearching && (
                      <p className="text-muted-foreground/60 italic">Searching real-time music...</p>
                    )}
                    {searchResults.length > 20 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                           const tabsList = document.querySelector('[role="tablist"]');
                           const songsTab = tabsList?.querySelector('[data-value="songs"]') as HTMLElement;
                           songsTab?.click();
                        }}
                        className="w-full mt-6 py-4 rounded-2xl bg-accent/30 hover:bg-accent/50 text-sm font-bold text-primary transition-all border border-dashed border-primary/20"
                      >
                        See all {searchResults.length} results
                      </motion.button>
                    )}
                  </div>

                  {/* Playlists Results */}
                  {filteredPlaylists.length > 0 && (
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Playlists</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {filteredPlaylists.map((playlist, index) => (
                          <motion.div
                            key={playlist.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -8 }}
                            onClick={() => handlePlayPlaylist(playlist)}
                            className="p-5 rounded-3xl bg-card/40 hover:bg-card/60 backdrop-blur-xl border border-border group cursor-pointer transition-all shadow-lg hover:shadow-2xl"
                          >
                            <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-xl relative">
                              <img
                                src={playlist.coverImage}
                                alt={playlist.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            </div>
                            <h3 className="font-bold text-foreground text-base truncate mb-1">
                              {playlist.name}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">
                              {playlist.songCount} songs
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isSearching && searchResults.length === 0 && filteredPlaylists.length === 0 && (
                    <div className="text-center py-20">
                      <p className="text-muted-foreground text-xl font-medium">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="songs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResults.map((song, index) => (
                      <motion.div
                        key={song.id + index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 8 }}
                        onClick={() => playSong(song)}
                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-card/20 hover:bg-card/40 border border-transparent hover:border-primary/20 cursor-pointer group transition-all"
                      >
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                          <img
                            src={song.albumArt}
                            alt={song.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground truncate text-sm md:text-lg">
                            {song.title}
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">
                            {song.artist}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground/40">
                          {song.duration}
                        </span>
                      </motion.div>
                    ))}
                    
                    {hasMore && searchResults.length >= 20 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoadingMore}
                        onClick={handleLoadMore}
                        className="w-full mt-8 py-6 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-bold transition-all border border-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Loading more...
                          </>
                        ) : (
                          "Load more results"
                        )}
                      </motion.button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="playlists">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {filteredPlaylists.map((playlist, index) => (
                      <motion.div
                        key={playlist.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -8 }}
                        onClick={() => handlePlayPlaylist(playlist)}
                        className="p-5 rounded-3xl bg-card/40 hover:bg-card/60 backdrop-blur-xl border border-border group cursor-pointer transition-all shadow-lg hover:shadow-2xl"
                      >
                        <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-xl">
                          <img
                            src={playlist.coverImage}
                            alt={playlist.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <h3 className="font-bold text-foreground text-base truncate mb-1">
                          {playlist.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                          {playlist.songCount} songs
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          ) : (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-8 text-foreground">Browse Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03, y: -6 }}
                    whileTap={{ scale: 0.97 }}
                    className={`p-6 rounded-3xl bg-gradient-to-br ${category.color} cursor-pointer shadow-xl hover:shadow-2xl transition-all h-40 flex items-end relative overflow-hidden group`}
                  >
                    <motion.div
                      className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/80 transition-all duration-500"
                    />
                    <h3 className="text-2xl font-black text-white relative z-10 tracking-tight">
                      {category.name}
                    </h3>
                    <div className="absolute top-4 right-4 text-white/20 group-hover:text-white/40 transition-colors">
                       <SearchIcon className="w-12 h-12 rotate-12" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}