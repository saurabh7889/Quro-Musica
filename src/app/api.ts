import { mockSongs, mockPlaylists, recentlyPlayed } from './data/mockData';

// Use environment variable for production, default to localhost for development
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

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
    try {
      const res = await safeFetch(`${API_URL}/playlists`);
      return res.json();
    } catch {
      console.warn('[api] Backend unreachable, using mock playlists');
      return mockPlaylists;
    }
  },

  async createPlaylist(name: string) {
    try {
      const res = await safeFetch(`${API_URL}/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      return res.json();
    } catch {
      console.warn('[api] Backend unreachable, returning mock');
      return { id: "pl_" + Date.now(), name, coverImage: "", songCount: 0 };
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
  }
};
