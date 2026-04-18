import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, Circle, Heart, ListMusic } from "lucide-react";
import { useState, useEffect } from "react";
import { usePlayer, Playlist, Song } from "../context/PlayerContext";
import { api } from "../api";

export function AddToPlaylistDialog() {
  const { 
    isAddPlaylistDialogOpen, 
    setIsAddPlaylistDialogOpen, 
    activeSongForPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
  } = usePlayer();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [initialSelected, setInitialSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAddPlaylistDialogOpen && activeSongForPlaylist) {
      setIsLoading(true);
      Promise.all([
        api.getPlaylists(),
        api.getPlaylistsForSong(activeSongForPlaylist.id)
      ]).then(([allPl, songPl]) => {
        setPlaylists(allPl);
        const ids = songPl.map(p => p.id);
        if (activeSongForPlaylist.liked) {
          ids.push('liked');
        }
        setSelectedPlaylists(ids);
        setInitialSelected(ids);
        setIsLoading(false);
      });
    }
  }, [isAddPlaylistDialogOpen, activeSongForPlaylist]);

  const handleToggle = (id: string) => {
    setSelectedPlaylists(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleClose = async () => {
    if (!activeSongForPlaylist) return;

    // Detect changes and sync with API
    const toAdd = selectedPlaylists.filter(id => !initialSelected.includes(id));
    const toRemove = initialSelected.filter(id => !selectedPlaylists.includes(id));

    const ps = [
      ...toAdd.map(id => addSongToPlaylist(activeSongForPlaylist.id, id)),
      ...toRemove.map(id => removeSongFromPlaylist(activeSongForPlaylist.id, id))
    ];

    await Promise.all(ps);
    setIsAddPlaylistDialogOpen(false);
  };

  return (
    <AnimatePresence>
      {isAddPlaylistDialogOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Subtle Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden p-6 z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-primary" />
                Add to playlist
              </h2>
              <button 
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-white/5 text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 max-h-[40vh] overflow-y-auto mb-6 pr-2 -mr-2 scrollbar-hide">
              {/* Liked Songs Option */}
              <label 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg">
                    <Heart className="w-5 h-5 text-black fill-current" />
                  </div>
                  <span className="font-bold text-sm text-white">Liked Songs</span>
                </div>
                <input 
                  type="checkbox"
                  checked={selectedPlaylists.includes('liked')}
                  onChange={() => handleToggle('liked')}
                  className="hidden"
                />
                <div className="text-primary transition-transform group-active:scale-90">
                  {selectedPlaylists.includes('liked') ? <CheckCircle2 className="w-6 h-6 fill-primary text-black" /> : <Circle className="w-6 h-6 text-white/20" />}
                </div>
              </label>

              {playlists.map((playlist) => (
                <label 
                  key={playlist.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={playlist.coverImage} 
                      className="w-10 h-10 rounded-lg object-cover shadow-lg" 
                      alt=""
                    />
                    <span className="font-bold text-sm text-white">{playlist.name}</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={selectedPlaylists.includes(playlist.id)}
                    onChange={() => handleToggle(playlist.id)}
                    className="hidden"
                  />
                  <div className="text-primary transition-transform group-active:scale-90">
                    {selectedPlaylists.includes(playlist.id) ? <CheckCircle2 className="w-6 h-6 fill-primary text-black" /> : <Circle className="w-6 h-6 text-white/20" />}
                  </div>
                </label>
              ))}

              {isLoading && (
                <div className="py-10 text-center text-muted-foreground animate-pulse text-sm font-medium">
                  Loading your playlists...
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className="w-full py-4 bg-primary text-black font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all uppercase tracking-widest text-xs"
            >
              Done
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
