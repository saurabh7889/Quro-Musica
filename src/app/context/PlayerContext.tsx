import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { api } from '../api';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  albumArt: string;
  liked: boolean;
  audioUrl?: string;
  artistId?: string;
  featuredArtists?: string;
}

export interface Playlist {
  id: string;
  name: string;
  coverImage: string;
  songCount: number;
  description?: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: number;
  playSong: (song: Song) => void;
  playPlaylist: (playlistSongs: Song[]) => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleLike: (songId: string) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  recentlyPlayed: Song[];
  isQueueVisible: boolean;
  toggleQueueVisible: () => void;
  // Playlist Dialog
  isAddPlaylistDialogOpen: boolean;
  setIsAddPlaylistDialogOpen: (open: boolean) => void;
  activeSongForPlaylist: Song | null;
  setActiveSongForPlaylist: (song: Song | null) => void;
  addSongToPlaylist: (songId: string, playlistId: string) => Promise<void>;
  removeSongFromPlaylist: (songId: string, playlistId: string) => Promise<void>;
  pinnedPlaylists: string[];
  togglePinPlaylist: (playlistId: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// A royalty-free chill track as a fallback
const PLACEHOLDER_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('player-volume');
    return saved ? parseInt(saved, 10) : 70;
  });
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off (next), 1: all (cycle), 2: one (loop)
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>(() => {
    const saved = localStorage.getItem('player-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isAddPlaylistDialogOpen, setIsAddPlaylistDialogOpen] = useState(false);
  const [activeSongForPlaylist, setActiveSongForPlaylist] = useState<Song | null>(null);
  const [pinnedPlaylists, setPinnedPlaylists] = useState<string[]>(() => {
    const saved = localStorage.getItem('quro_pinned_playlists');
    return saved ? JSON.parse(saved) : [];
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('quro_pinned_playlists', JSON.stringify(pinnedPlaylists));
  }, [pinnedPlaylists]);

  const togglePinPlaylist = useCallback((id: string) => {
    setPinnedPlaylists(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  }, []);

  const addSongToPlaylist = async (songId: string, playlistId: string) => {
     try {
       if (playlistId === 'liked') {
          await api.toggleLike(songId, true);
          setAllSongs(prev => prev.map(s => s.id === songId ? { ...s, liked: true } : s));
          if (currentSong?.id === songId) setCurrentSong({ ...currentSong, liked: true });
       } else {
          await api.addSongToPlaylist(playlistId, songId);
       }
     } catch (err) {
       console.error("Failed to add song to playlist", err);
     }
  };

  const removeSongFromPlaylist = async (songId: string, playlistId: string) => {
    try {
      if (playlistId === 'liked') {
        await api.toggleLike(songId, false);
        setAllSongs(prev => prev.map(s => s.id === songId ? { ...s, liked: false } : s));
        if (currentSong?.id === songId) setCurrentSong({ ...currentSong, liked: false });
      } else {
        await api.removeSongFromPlaylist(playlistId, songId);
      }
    } catch (err) {
      console.error("Failed to remove song from playlist", err);
    }
  };

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume / 100;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.pause();
    };
  }, []);

  const next = useCallback(() => {
    const currentQueue = queue.length > 0 ? queue : allSongs;
    if (currentQueue.length === 0) return;
    
    const currentIndex = currentQueue.findIndex((s) => s.id === currentSong?.id);
    let nextIndex;

    if (isShuffle) {
      // Pick random index that isn't the current one (if possible)
      nextIndex = Math.floor(Math.random() * currentQueue.length);
      if (nextIndex === currentIndex && currentQueue.length > 1) {
        nextIndex = (nextIndex + 1) % currentQueue.length;
      }
    } else {
      nextIndex = currentIndex + 1;
      // Handle end of queue
      if (nextIndex >= currentQueue.length) {
        if (repeatMode === 1) { // Repeat All
          nextIndex = 0;
        } else {
          // End of queue and not repeating all
          setIsPlaying(false);
          return;
        }
      }
    }

    const nextSong = currentQueue[nextIndex];
    if (nextSong) {
      setCurrentTime(0);
      setCurrentSong(nextSong);
      setIsPlaying(true);
    }
  }, [queue, allSongs, currentSong, isShuffle, repeatMode]);

  const previous = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const currentQueue = queue.length > 0 ? queue : allSongs;
    if (currentQueue.length === 0) return;

    const currentIndex = currentQueue.findIndex((s) => s.id === currentSong?.id);
    if (currentIndex === -1) return;

    const prevIndex = currentIndex === 0 ? currentQueue.length - 1 : currentIndex - 1;
    setCurrentTime(0);
    setCurrentSong(currentQueue[prevIndex]);
    setIsPlaying(true);
  }, [queue, allSongs, currentSong]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Update handlers for ended and error
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeatMode === 2) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        next();
      }
    };

    const handleError = (e: any) => {
      console.error("[player] Playback error, skipping to next...", e);
      // Only auto-skip if it was actually trying to play
      if (isPlaying) {
        // Small delay to prevent infinite fast-looping if everything is broken
        setTimeout(next, 1000);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [next, repeatMode, isPlaying]);

  // Sync Audio Source and Playback State
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const source = currentSong?.audioUrl || PLACEHOLDER_AUDIO_URL;
    
    // Only update src if it changed
    if (audio.src !== source) {
      audio.src = source;
      audio.load();
    }

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("[player] Autoplay blocked or interrupted:", error);
          if (error.name === "NotAllowedError") {
            setIsPlaying(false);
          }
        });
      }
      
      // Update recently played history
      if (currentSong) {
        setRecentlyPlayed(prev => {
          const filtered = prev.filter(s => s.id !== currentSong.id);
          const updated = [currentSong, ...filtered].slice(0, 20);
          localStorage.setItem('player-history', JSON.stringify(updated));
          return updated;
        });
      }
    } else {
      audio.pause();
    }
  }, [currentSong, isPlaying]);

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      localStorage.setItem('player-volume', volume.toString());
    }
  }, [volume]);

  // Initial Data Load
  useEffect(() => {
    api.getSongs().then(songs => {
      setAllSongs(songs);
      if (songs.length > 0 && !currentSong) {
        setCurrentSong(songs[0]);
      }
    }).catch(console.error);
  }, []);

  const playSong = useCallback((song: Song) => {
    setCurrentTime(0);
    setCurrentSong(song);
    setIsPlaying(true);
  }, []);

  const playPlaylist = useCallback((playlistSongs: Song[]) => {
    if (playlistSongs.length === 0) return;
    setQueue(playlistSongs);
    setCurrentTime(0);
    setCurrentSong(playlistSongs[0]);
    setIsPlaying(true);
  }, []);

  const handleSeek = useCallback((timeInSeconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeInSeconds;
    }
    setCurrentTime(timeInSeconds);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
  }, []);

  const toggleLike = useCallback(async (songId: string) => {
    let song = allSongs.find(s => s.id === songId);
    if (!song && currentSong?.id === songId) song = currentSong;
    
    if (song) {
      setActiveSongForPlaylist(song);
      setIsAddPlaylistDialogOpen(true);
    }
  }, [allSongs, currentSong]);

  const toggleShuffle = useCallback(() => setIsShuffle(prev => !prev), []);
  const toggleRepeat = useCallback(() => setRepeatMode(prev => (prev + 1) % 3), []);
  const toggleQueueVisible = useCallback(() => setIsQueueVisible(prev => !prev), []);
  
  const addToQueue = useCallback((song: Song) => {
    setQueue(prev => [...prev, song]);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        currentTime,
        duration,
        volume,
        isShuffle,
        repeatMode,
        playSong,
        playPlaylist,
        togglePlayPause,
        next,
        previous,
        seek: handleSeek,
        setVolume,
        toggleLike,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        recentlyPlayed,
        isQueueVisible,
        toggleQueueVisible,
        isAddPlaylistDialogOpen,
        setIsAddPlaylistDialogOpen,
        activeSongForPlaylist,
        setActiveSongForPlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        pinnedPlaylists,
        togglePinPlaylist
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
