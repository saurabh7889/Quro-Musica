import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  isQueueVisible: boolean;
  toggleQueueVisible: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// A royalty-free chill track as a playable placeholder since Last.FM doesn't provide audio streams
const PLACEHOLDER_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [isQueueVisible, setIsQueueVisible] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(PLACEHOLDER_AUDIO_URL);
    audioRef.current.volume = volume / 100;

    const audio = audioRef.current;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      // Repeat One
      if (repeatMode === 2) {
        audio.currentTime = 0;
        audio.play();
      } else {
        next();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    
    // Ensure duration is caught immediately when metadata loads
    audio.addEventListener('loadedmetadata', updateTime);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', updateTime);
      audio.pause();
    };
  }, []); // Note: handleEnded uses stale `next` reference, so we'll re-bind it below

  // Load initial global list of songs
  useEffect(() => {
    api.getSongs().then(songs => {
      setAllSongs(songs);
      if (songs.length > 0 && !currentSong) {
        setCurrentSong(songs[0]);
        setQueue(songs.slice(0, 10)); // Initial queue
      }
    }).catch(console.error);
  }, []);

  // Sync play/pause state when isPlaying or currentSong changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    // Update the track URL
    const realAudioUrl = currentSong?.audioUrl || PLACEHOLDER_AUDIO_URL;
    if (audioRef.current.src !== realAudioUrl) {
      audioRef.current.src = realAudioUrl;
      audioRef.current.load();
    }

    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Playback prevented:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Update handleEnded listener with fresh references
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    const handleEnded = () => {
      if (repeatMode === 2) {
        audio.currentTime = 0;
        audio.play().catch(e => null);
      } else {
        next();
      }
    };
    
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [queue, currentSong, repeatMode, isShuffle, allSongs]);

  const playSong = (song: Song) => {
    if (audioRef.current) audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const playPlaylist = (playlistSongs: Song[]) => {
    if (playlistSongs.length === 0) return;
    setQueue(playlistSongs);
    if (audioRef.current) audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setCurrentSong(playlistSongs[0]);
    setIsPlaying(true);
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const next = () => {
    if (queue.length === 0 && !allSongs.length) return;
    const currentQueue = queue.length > 0 ? queue : allSongs;
    const currentIndex = currentQueue.findIndex((s) => s.id === currentSong?.id);
    if (currentIndex === -1) return;
    
    let nextIndex = (currentIndex + 1) % currentQueue.length;
    
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * currentQueue.length);
    }
    
    if (audioRef.current) audioRef.current.currentTime = 0;
    setCurrentSong(currentQueue[nextIndex]);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const previous = () => {
    if (queue.length === 0 && !allSongs.length) return;
    
    // If we're more than 3 seconds in, just restart current song
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentQueue = queue.length > 0 ? queue : allSongs;
    const currentIndex = currentQueue.findIndex((s) => s.id === currentSong?.id);
    if (currentIndex === -1) return;
    
    const prevIndex = currentIndex === 0 ? currentQueue.length - 1 : currentIndex - 1;
    if (audioRef.current) audioRef.current.currentTime = 0;
    setCurrentSong(currentQueue[prevIndex]);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSeek = (timeInSeconds: number) => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = timeInSeconds;
    }
    setCurrentTime(timeInSeconds);
  };

  const toggleLike = async (songId: string) => {
    try {
      const isLiked = currentSong?.id === songId ? !currentSong.liked : false;
      await api.toggleLike(songId, isLiked);
      
      if (currentSong && currentSong.id === songId) {
        setCurrentSong({ ...currentSong, liked: isLiked });
      }
      setQueue(queue.map(s => s.id === songId ? { ...s, liked: isLiked } : s));
      setAllSongs(allSongs.map(s => s.id === songId ? { ...s, liked: isLiked} : s));
    } catch(err) {
      console.error("Failed to toggle like", err);
    }
  }

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setRepeatMode((repeatMode + 1) % 3);
  const toggleQueueVisible = () => setIsQueueVisible(!isQueueVisible);
  
  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

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
        isQueueVisible,
        toggleQueueVisible
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
