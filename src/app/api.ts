/// <reference types="vite/client" />
import { mockSongs, mockPlaylists, recentlyPlayed } from './data/mockData';

// Use environment variable for production, default to Render backend
const API_URL = import.meta.env.VITE_API_URL || 'https://quromusic.onrender.com/api';

console.info(`[api] Initialized with BASE_URL: ${API_URL}`);
if (window.location.protocol === 'https:' && API_URL.startsWith('http:')) {
  console.warn('[api] SECURITY WARNING: Mixed Content detected. Calling HTTP API from HTTPS site. This will likely fail on mobile browsers!');
}

// Re-export types so components can import { Song, Playlist, ArtistProfile } from '../api'
export type { Song, Playlist, ArtistProfile } from './data/mockData';

/**
 * Helper to make a fetch request with a timeout.
 * Falls back gracefully if the backend server is unreachable.
 */
async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout for mobile networks
  
  console.log(`[api] Requesting: ${url}`, options ? { method: options.method } : '');
  const startTime = Date.now();

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const duration = Date.now() - startTime;
    clearTimeout(timeout);

    console.log(`[api] Response Received: ${res.status} (${duration}ms)`);
    
    if (!res.ok) {
       const errBody = await res.text().catch(() => 'No error body');
       throw new Error(`HTTP ${res.status}: ${errBody}`);
    }
    return res;
  } catch (err: any) {
    clearTimeout(timeout);
    const duration = Date.now() - startTime;
    
    if (err.name === 'AbortError') {
      console.error(`[api] Request Timed Out after ${duration}ms: ${url}`);
    } else {
      console.error(`[api] Fetch failed after ${duration}ms:`, err.message || err);
    }
    throw err;
  }
}

export const api = {
  async getSongs() {
    try {
      const res = await safeFetch(`${API_URL}/songs`);
      return res.json();
    } catch {
      console.warn('[api] Backend unreachable, using mock songs');
      return mockSongs;
    }
  },

  async getPlaylists() {
    const mappings = JSON.parse(localStorage.getItem('quro_playlist_songs') || '{}');
    const updateCount = (pl: Playlist) => {
       const count = mappings[pl.id]?.length || (pl.id === 'liked' ? 0 : pl.songCount);
       return { ...pl, songCount: count };
    };

    try {
      const res = await safeFetch(`${API_URL}/playlists`);
      const remote = (await res.json()).map(updateCount);
      const local = JSON.parse(localStorage.getItem('quro_local_playlists') || '[]').map(updateCount);
      return [...remote, ...local];
    } catch {
      console.warn('[api] Backend unreachable, using combined mock and local playlists');
      const local = JSON.parse(localStorage.getItem('quro_local_playlists') || '[]').map(updateCount);
      const mock = mockPlaylists.map(updateCount);
      return [...mock, ...local];
    }
  },

  async createPlaylist(name: string) {
    const newPl: Playlist = { 
      id: "pl_" + Date.now(), 
      name, 
      coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080", 
      songCount: 0 
    };
    
    try {
      const res = await safeFetch(`${API_URL}/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      return res.json();
    } catch {
      console.warn('[api] Backend unreachable, saving playlist locally');
      const local = JSON.parse(localStorage.getItem('quro_local_playlists') || '[]');
      localStorage.setItem('quro_local_playlists', JSON.stringify([...local, newPl]));
      return newPl;
    }
  },

  async getRecentlyPlayed() {
    try {
      const res = await safeFetch(`${API_URL}/recently-played`);
      return res.json();
    } catch {
      console.warn('[api] Backend unreachable, using mock recently played');
      return recentlyPlayed;
    }
  },

  async toggleLike(songId: string, liked: boolean) {
    // Sync Liked Songs list locally
    let likedSongs = JSON.parse(localStorage.getItem('quro_liked_songs') || '[]');
    if (liked) {
      if (!likedSongs.includes(songId)) likedSongs.push(songId);
    } else {
      likedSongs = likedSongs.filter((id: string) => id !== songId);
    }
    localStorage.setItem('quro_liked_songs', JSON.stringify(likedSongs));

    try {
      const res = await safeFetch(`${API_URL}/songs/${songId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked }),
      });
      return res.json();
    } catch {
      console.warn('[api] Backend unreachable, toggling like locally');
      return { message: 'Success (local)' };
    }
  },

  async generatePlaylist(description: string) {
    try {
      const res = await safeFetch(`${API_URL}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      return res.json();
    } catch {
      console.warn('[api] Backend unreachable, generating mock AI playlist');
      const shuffled = [...mockSongs].sort(() => Math.random() - 0.5);
      return {
        playlist: {
          id: "ai_" + Date.now(),
          name: "AI: " + description.substring(0, 15),
          coverImage: mockSongs[0]?.albumArt || "",
          songCount: shuffled.length,
          description,
        },
        songs: shuffled,
      };
    }
  },

  async searchMusic(query: string) {
    try {
      const res = await safeFetch(`${API_URL}/music/search?q=${encodeURIComponent(query)}`);
      return res.json();
    } catch {
      console.warn('[api] Backend unreachable, searching mock data locally');
      const q = query.toLowerCase();
      return mockSongs.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q)
      );
    }
  },

  async getArtistProfile(artistId: string, artistName: string) {
    try {
      const res = await safeFetch(`${API_URL}/artist/${encodeURIComponent(artistId || 'undefined')}/${encodeURIComponent(artistName)}`);
      return res.json();
    } catch (err) {
      console.warn('[api] Backend unreachable for artist profile', err);
      return {
        name: artistName,
        bio: `${artistName} is currently trending.`,
        listeners: "1,000,000",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
      };
    }
  },

  async addSongToPlaylist(playlistId: string, songId: string) {
    // Persist mapping locally
    const mappings = JSON.parse(localStorage.getItem('quro_playlist_songs') || '{}');
    if (!mappings[playlistId]) mappings[playlistId] = [];
    if (!mappings[playlistId].includes(songId)) mappings[playlistId].push(songId);
    localStorage.setItem('quro_playlist_songs', JSON.stringify(mappings));

    try {
      await safeFetch(`${API_URL}/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      });
    } catch {
      console.warn('[api] Backend unreachable, added song to playlist locally');
    }
  },

  async removeSongFromPlaylist(playlistId: string, songId: string) {
    const mappings = JSON.parse(localStorage.getItem('quro_playlist_songs') || '{}');
    if (mappings[playlistId]) {
      mappings[playlistId] = mappings[playlistId].filter((id: string) => id !== songId);
      localStorage.setItem('quro_playlist_songs', JSON.stringify(mappings));
    }

    try {
      await safeFetch(`${API_URL}/playlists/${playlistId}/songs/${songId}`, {
        method: "DELETE",
      });
    } catch {
      console.warn('[api] Backend unreachable, removed song from playlist locally');
    }
  },

  async getPlaylistsForSong(songId: string) {
    try {
      const res = await safeFetch(`${API_URL}/songs/${songId}/playlists`);
      return res.json();
    } catch {
      console.warn('[api] Backend unreachable, check local mappings');
      const mappings = JSON.parse(localStorage.getItem('quro_playlist_songs') || '{}');
      const likedSongs = JSON.parse(localStorage.getItem('quro_liked_songs') || '[]');
      
      const songPlaylists = Object.keys(mappings)
        .filter(plId => mappings[plId].includes(songId))
        .map(plId => ({ id: plId }));
        
      if (likedSongs.includes(songId)) songPlaylists.push({ id: 'liked' });
      return songPlaylists;
    }
  },

  async deletePlaylist(playlistId: string) {
    const local = JSON.parse(localStorage.getItem('quro_local_playlists') || '[]');
    localStorage.setItem('quro_local_playlists', JSON.stringify(local.filter((p: any) => p.id !== playlistId)));
    
    const mappings = JSON.parse(localStorage.getItem('quro_playlist_songs') || '{}');
    delete mappings[playlistId];
    localStorage.setItem('quro_playlist_songs', JSON.stringify(mappings));

    try {
      await safeFetch(`${API_URL}/playlists/${playlistId}`, {
        method: "DELETE",
      });
    } catch {
      console.warn('[api] Backend unreachable, deleted playlist locally');
    }
  },

  async renamePlaylist(playlistId: string, name: string) {
    const local = JSON.parse(localStorage.getItem('quro_local_playlists') || '[]');
    localStorage.setItem('quro_local_playlists', JSON.stringify(local.map((p: any) => p.id === playlistId ? { ...p, name } : p)));

    try {
      await safeFetch(`${API_URL}/playlists/${playlistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    } catch {
      console.warn('[api] Backend unreachable, renamed playlist locally');
    }
  },

  async getSongsByPlaylist(playlistId: string) {
    const all = await this.getSongs();
    const likedSongs = JSON.parse(localStorage.getItem('quro_liked_songs') || '[]');
    
    if (playlistId === 'liked') {
       return all.filter(s => s.liked || likedSongs.includes(s.id));
    }
    
    const mappings = JSON.parse(localStorage.getItem('quro_playlist_songs') || '{}');
    const songIds = mappings[playlistId] || [];
    return all.filter(s => songIds.includes(s.id));
  }
};
