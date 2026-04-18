import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5001;
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

app.use(cors());
app.use(express.json());

// Request logging middleware for debugging mobile connectivity
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Helper to format JioSaavn tracks to our Song interface
const formatJioSaavnTrack = (track) => {
  // Find highest quality image
  let hdArtwork = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
  if (track.image && track.image.length > 0) {
    // pick last one (usually highest res)
    hdArtwork = track.image[track.image.length - 1].link;
  }
  
  // Find highest quality audio
  let bestAudio = "";
  if (track.downloadUrl && track.downloadUrl.length > 0) {
    bestAudio = track.downloadUrl[track.downloadUrl.length - 1].link; // usually 320kbps
  }

  // Format seconds to min:sec
  const seconds = parseInt(track.duration || "0");
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const durationStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  return {
    id: track.id,
    title: track.name || 'Unknown Title',
    artist: track.primaryArtists || 'Unknown Artist',
    album: track.album?.name || 'Single',
    duration: durationStr,
    albumArt: hdArtwork,
    liked: false,
    audioUrl: bestAudio,
    artistId: track.primaryArtistsId?.split(',')[0]?.trim() || '',
    featuredArtists: track.featuredArtists || ''
  };
};

// Routes
app.get('/api/songs', (req, res) => {
  try {
    const songs = db.prepare('SELECT * FROM songs').all();
    const formatted = songs.map(s => ({ ...s, liked: s.liked === 1 }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/playlists', (req, res) => {
  try {
    const playlists = db.prepare('SELECT * FROM playlists').all();
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/recently-played', async (req, res) => {
  // Using popular query for "Recently Played"
  try {
    const response = await axios.get(`https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=trending+pop&limit=24`);
    const tracks = response.data.data.results;
    const formatted = tracks.map(formatJioSaavnTrack);
    res.json(formatted);
  } catch (err) {
    console.error("JioSaavn Error fallback to DB:", err.message);
    const songs = db.prepare('SELECT * FROM songs LIMIT 12').all();
    res.json(songs.map(s => ({ ...s, liked: s.liked === 1 })));
  }
});

app.get('/api/music/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);
    
    // JioSaavn provides full audio streaming urls & 500x500 album art
    const response = await axios.get(`https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(query)}&limit=50`);
    const tracks = response.data.data.results || [];
    
    const formatted = tracks.map(formatJioSaavnTrack);
    res.json(formatted);
  } catch (err) {
     res.status(500).json({ error: err.message });
  }
});

app.get('/api/artist/:id/:name', async (req, res) => {
  try {
    const { id, name } = req.params;
    let bio = "";
    let listeners = "0";
    let image = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";

    // 1. Fetch Follower count & image from Jiosaavn
    if (id && id !== 'undefined' && id !== '') {
      try {
        const jsResponse = await axios.get(`https://jiosaavn-api-privatecvc2.vercel.app/artists?id=${id}`);
        const jsData = jsResponse.data?.data;
        if (jsData) {
           listeners = jsData.followerCount || jsData.listener || "120,000";
           if (Array.isArray(jsData.image) && jsData.image.length > 0) {
              image = jsData.image[jsData.image.length - 1].link;
           }
        }
      } catch (err) {
        console.warn("JioSaavn Artist Fetch failed", err.message);
      }
    }

    // 2. Fetch bio from Last.FM
    if (LASTFM_API_KEY && name) {
      try {
        const lfResponse = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(name)}&api_key=${LASTFM_API_KEY}&format=json`);
        const lfData = lfResponse.data?.artist;
        if (lfData?.bio?.summary) {
          // Strip out the `<a href="...` HTML tag at the end of last.fm bios
          bio = lfData.bio.summary.split('<a href')[0].trim();
        }
      } catch (err) {
        console.warn("Last.fm Bio Fetch failed", err.message);
      }
    }

    if (!bio) {
       bio = `Described by many as a phenomenal artist, ${name} has captivated audiences worldwide with their distinct sound and passionate lyricism.`;
    }

    res.json({
       name,
       bio,
       listeners: Number(listeners).toLocaleString(),
       image
    });
  } catch (err) {
     res.status(500).json({ error: err.message });
  }
});

app.post('/api/songs/:id/like', (req, res) => {
  try {
    const songId = req.params.id;
    const { liked } = req.body;
    
    // We update local DB if it exists, otherwise we could insert it
    const stmt = db.prepare('UPDATE songs SET liked = ? WHERE id = ?');
    const result = stmt.run(liked ? 1 : 0, songId);
    
    res.json({ message: 'Success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/playlists', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    
    const newPlaylist = {
      id: "pl_" + Date.now(),
      name: name,
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      songCount: 0,
      description: "Custom Playlist",
    };
    
    const insert = db.prepare('INSERT INTO playlists (id, name, coverImage, songCount, description) VALUES (?, ?, ?, ?, ?)');
    insert.run(newPlaylist.id, newPlaylist.name, newPlaylist.coverImage, newPlaylist.songCount, newPlaylist.description);
    
    res.json(newPlaylist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/generate', (req, res) => {
  try {
    const { description } = req.body;
    const songs = db.prepare('SELECT * FROM songs ORDER BY RANDOM() LIMIT 20').all();
    const formatted = songs.map(s => ({ ...s, liked: s.liked === 1 }));
    
    const newPlaylist = {
      id: "ai_" + Date.now(),
      name: "AI: " + (description.substring(0, 15) || "Custom Playlist"),
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxYWlZifGVufDF8fHx8MTc3NjQwNDQxMHww&ixlib=rb-4.1.0&q=80&w=1080",
      songCount: formatted.length,
      description: description
    };
    
    const insert = db.prepare('INSERT INTO playlists (id, name, coverImage, songCount, description) VALUES (?, ?, ?, ?, ?)');
    insert.run(newPlaylist.id, newPlaylist.name, newPlaylist.coverImage, newPlaylist.songCount, newPlaylist.description);
    
    res.json({ playlist: newPlaylist, songs: formatted });
  } catch(err) {
     res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
