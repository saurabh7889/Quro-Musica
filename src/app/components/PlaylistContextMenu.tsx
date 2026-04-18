import { motion, AnimatePresence } from "motion/react";
import { Pin, PinOff, Edit2, Trash2, ArrowRightCircle } from "lucide-react";
import { useEffect } from "react";

interface Props {
  x: number;
  y: number;
  onClose: () => void;
  playlistId: string;
  isPinned: boolean;
  onPinToggle: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

export function PlaylistContextMenu({ 
  x, 
  y, 
  onClose, 
  playlistId, 
  isPinned, 
  onPinToggle,
  onRename,
  onDelete
}: Props) {
  
  useEffect(() => {
    const handleClickOutside = () => onClose();
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleClickOutside, true);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleClickOutside, true);
    };
  }, [onClose]);

  const isLikedPlaylist = playlistId === 'liked';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{ top: y, left: x }}
        className="fixed z-[120] min-w-[180px] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-1.5 backdrop-blur-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pin Option (Common) */}
        <button
          onClick={(e) => { e.stopPropagation(); onPinToggle(); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-white hover:bg-primary/20 hover:text-primary transition-all"
        >
          {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          <span>{isPinned ? "Unpin from sidebar" : "Pin to sidebar"}</span>
        </button>

        {!isLikedPlaylist && (
          <>
            <div className="h-px bg-white/5 my-1" />
            
            <button
              onClick={(e) => { e.stopPropagation(); onRename?.(); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-white hover:bg-white/5 transition-all"
            >
              <Edit2 className="w-4 h-4" />
              <span>Rename</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-red-400 hover:bg-red-400/10 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </>
        )}

        <div className="h-px bg-white/5 my-1" />
        
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowRightCircle className="w-4 h-4" />
          <span>Close</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
