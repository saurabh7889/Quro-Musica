import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Grid, List, Heart, Clock, Music } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { api, Song, Playlist } from "../api";
import { usePlayer } from "../context/PlayerContext";

export function Library() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  
  const { playSong, playPlaylist, toggleLike } = usePlayer();

  useEffect(() => {
    Promise.all([api.getPlaylists(), api.getSongs(), api.getRecentlyPlayed()])
      .then(([pl, sgs, rp]) => {
        setPlaylists(pl);
        setSongs(sgs);
        setRecentSongs(rp);
      })
      .catch(console.error);
  }, []);

  const likedSongs = songs.filter((song) => song.liked);

  const handlePlayPlaylist = async (playlist: Playlist) => {
     // Play all liked songs if it's the Liked Songs playlist, else generic slice
     if (playlist.name === "Liked Songs") {
        playPlaylist(likedSongs);
     } else {
        const plSongs = songs.slice(0, playlist.songCount);
        playPlaylist(plSongs);
     }
  };

  return (
    <ScrollArea className="h-full transition-colors duration-300">
      <div className="p-4 md:p-8 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">Your Library</h1>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-accent border border-border">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-5 h-5" />
              </motion.button>
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
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {playlists.map((playlist, index) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -8 }}
                    onClick={() => handlePlayPlaylist(playlist)}
                    className="group p-5 rounded-3xl bg-card/40 hover:bg-card/60 backdrop-blur-xl border border-border hover:border-primary/20 cursor-pointer transition-all shadow-lg hover:shadow-2xl"
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
                    <p className="text-xs text-muted-foreground font-medium truncate">
                      {playlist.songCount} songs
                    </p>
                    {playlist.description && (
                      <p className="text-[10px] text-muted-foreground/60 mt-1 line-clamp-2 leading-relaxed">
                        {playlist.description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {playlists.map((playlist, index) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 8 }}
                    onClick={() => handlePlayPlaylist(playlist)}
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
                    <span className="text-xs font-bold text-muted-foreground/40 group-hover:text-primary transition-colors">
                      {playlist.songCount} songs
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Liked Songs Tab */}
          <TabsContent value="liked">
            {/* Liked Songs Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 md:p-10 rounded-3xl bg-gradient-to-br from-purple-600/20 to-pink-600/10 border border-purple-500/20 backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full" />
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 flex-shrink-0">
                  <Heart className="w-16 h-16 md:w-24 md:h-24 text-white fill-white animate-pulse" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] md:text-xs font-black text-purple-500 uppercase tracking-[0.2em] mb-2 md:mb-3">
                    Your Collection
                  </p>
                  <h2 className="text-4xl md:text-6xl font-black mb-2 md:mb-4 text-foreground tracking-tight">Liked Songs</h2>
                  <p className="text-muted-foreground font-medium text-sm md:text-lg">
                    {likedSongs.length} songs • Your favorite tracks all in one place
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Liked Songs List */}
            <div className="space-y-2">
              {likedSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 8 }}
                  onClick={() => playSong(song)}
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-card/20 hover:bg-card/40 border border-transparent hover:border-primary/20 cursor-pointer group transition-all"
                >
                  <span className="text-muted-foreground/40 font-black w-6 md:w-8 text-center text-xs hidden md:block">{index + 1}</span>
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                    <img
                      src={song.albumArt}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate text-sm md:text-lg">{song.title}</p>
                    <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">{song.artist}</p>
                  </div>
                  <p className="text-sm text-muted-foreground/60 truncate max-w-[200px] hidden md:block">
                    {song.album}
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                    className="p-3 rounded-full hover:bg-primary/10 transition-colors"
                  >
                     <Heart className="w-5 h-5 text-primary fill-primary shadow-primary/50" />
                  </button>
                  <span className="text-xs font-bold text-muted-foreground/40 w-12 text-right">{song.duration}</span>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Recent Tab (Last.fm Dynamic) */}
          <TabsContent value="recent">
            <div className="space-y-2">
              {recentSongs.map((song, index) => (
                <motion.div
                  key={song.id + index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 8 }}
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
                    <p className="font-bold text-foreground truncate text-sm md:text-lg">{song.title}</p>
                    <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">
                      {song.artist}
                    </p>
                  </div>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary/60 px-2 md:px-3 py-1 rounded-full bg-primary/5 hidden md:block">Recently</span>
                  <span className="text-xs font-bold text-muted-foreground/40 w-12 text-right">{song.duration}</span>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
