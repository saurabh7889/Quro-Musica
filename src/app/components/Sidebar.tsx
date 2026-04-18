import { Home, Search, Library, Plus, Heart } from "lucide-react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { api, Playlist } from "../api";
import { ScrollArea } from "./ui/scroll-area";
import { usePlayer } from "../context/PlayerContext";
import { PlaylistContextMenu } from "./PlaylistContextMenu";

export function Sidebar() {
  const location = useLocation();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, playlistId: string } | null>(null);

  const { pinnedPlaylists, togglePinPlaylist } = usePlayer();

  const fetchPlaylists = async () => {
    try {
      const data = await api.getPlaylists();
      setPlaylists(data);
    } catch {
      console.warn("Failed to load user playlists.");
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreatePlaylist = async () => {
    const name = window.prompt("Enter Playlist Name:", "My New Playlist");
    if (!name) return;
    
    await api.createPlaylist(name);
    fetchPlaylists();
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, playlistId: id });
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Library, label: "Your Library", path: "/library" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 h-screen bg-background/40 backdrop-blur-xl border-r border-border flex flex-col relative">
      {/* Logo */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
          Quro Música
        </h1>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <motion.div
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                isActive(item.path)
                  ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(29,185,84,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="font-medium">{item.label}</span>
            </motion.div>
          </Link>
        ))}
      </nav>

      {/* Separator */}
      <div className="mx-6 my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Playlists */}
      <ScrollArea type="always" className="flex-1 min-h-0 px-3">
        <div className="space-y-1">
          {/* Liked Songs - Special */}
          <motion.div
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.hash = "/library"} // Basic hash routing or similar if needed, for now just ui
            onContextMenu={(e) => handleContextMenu(e, 'liked')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate uppercase tracking-tight">Liked Songs</p>
              <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                 Playlist
              </p>
            </div>
          </motion.div>

          {/* User Playlists */}
          <div className="pt-2 text-[10px] font-bold text-muted-foreground/40 px-4 uppercase tracking-widest pb-1">Playlists</div>
          
          {playlists.map((playlist) => (
            <motion.div
              key={playlist.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onContextMenu={(e) => handleContextMenu(e, playlist.id)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={playlist.coverImage}
                  alt={playlist.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{playlist.name}</p>
                <p className="text-xs text-muted-foreground/60">
                   Playlist
                </p>
              </div>
            </motion.div>
          ))}

          {/* Create Playlist Button */}
          <motion.div
            onClick={handleCreatePlaylist}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer transition-all mt-2"
          >
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center border border-border">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Create Playlist</span>
          </motion.div>
        </div>
      </ScrollArea>

      {/* Context Menu Overlay */}
      {contextMenu && (
        <PlaylistContextMenu 
          x={contextMenu.x}
          y={contextMenu.y}
          playlistId={contextMenu.playlistId}
          isPinned={pinnedPlaylists.includes(contextMenu.playlistId)}
          onPinToggle={() => togglePinPlaylist(contextMenu.playlistId)}
          onClose={() => setContextMenu(null)}
          onRename={() => {
            const n = window.prompt("New Name:");
            if(n) { api.renamePlaylist(contextMenu.playlistId, n).then(() => fetchPlaylists()); }
          }}
          onDelete={() => {
            if(window.confirm("Delete?")) { api.deletePlaylist(contextMenu.playlistId).then(() => fetchPlaylists()); }
          }}
        />
      )}

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground/60 text-center">
          AI-Powered Music Streaming
        </p>
      </div>
    </div>
  );
}
