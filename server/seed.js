import db, { initDb } from './db.js';

initDb();

const mockSongs = [
  {
    id: "1",
    title: "Midnight Vibes",
    artist: "The Nocturnal",
    album: "After Dark",
    duration: "3:45",
    albumArt: "https://images.unsplash.com/photo-1659117675918-69ec794c64f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbXVzaWMlMjBhbGJ1bSUyMHZpbnlsfGVufDF8fHx8MTc3NjQwNDQxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    liked: 1,
  },
  {
    id: "2",
    title: "Neon Dreams",
    artist: "Electric Pulse",
    album: "Digital Horizons",
    duration: "4:12",
    albumArt: "https://images.unsplash.com/photo-1730537455982-13fd2b5efb03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwbXVzaWMlMjBjb25jZXJ0JTIwc3RhZ2V8ZW58MXx8fHwxNzc2NDA0NDE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    liked: 0,
  },
  {
    id: "3",
    title: "Wave Frequency",
    artist: "Synthwave",
    album: "Abstract Sounds",
    duration: "5:20",
    albumArt: "https://images.unsplash.com/photo-1687868803274-b800be48c907?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwd2F2ZXN8ZW58MXx8fHwxNzc2MzQ2ODIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    liked: 1,
  },
  {
    id: "4",
    title: "Studio Flow",
    artist: "MC Rhythm",
    album: "Urban Beats",
    duration: "3:30",
    albumArt: "https://images.unsplash.com/photo-1595963202332-e837eb8e466c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXAlMjBob3AlMjBhcnRpc3QlMjBzdHVkaW98ZW58MXx8fHwxNzc2MzE4ODA0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    liked: 0,
  },
  {
    id: "5",
    title: "Digital Bass",
    artist: "DJ Vertex",
    album: "Electronic Nights",
    duration: "6:15",
    albumArt: "https://images.unsplash.com/photo-1692176548571-86138128e36c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwbXVzaWMlMjBkanxlbnwxfHx8fDE3NzYzNjE5NjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    liked: 1,
  },
  {
    id: "6",
    title: "Smooth Sax",
    artist: "Jazz Collective",
    album: "Late Night Jazz",
    duration: "4:45",
    albumArt: "https://images.unsplash.com/photo-1768935434604-2301398d92d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwc2F4b3Bob25lJTIwbXVzaWNpYW58ZW58MXx8fHwxNzc2Mzc1NzYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    liked: 0,
  },
  {
    id: "7",
    title: "Acoustic Soul",
    artist: "String Theory",
    album: "Unplugged Sessions",
    duration: "3:55",
    albumArt: "https://images.unsplash.com/photo-1648561848326-7eb7117274c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGd1aXRhciUyMGNsb3NlJTIwdXB8ZW58MXx8fHwxNzc2MzcwMTIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    liked: 1,
  },
  {
    id: "8",
    title: "Rock Revolution",
    artist: "Thunder Squad",
    album: "Live in Concert",
    duration: "4:30",
    albumArt: "https://images.unsplash.com/photo-1709731191876-899e32264420?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYmFuZCUyMGNvbmNlcnQlMjBsaWdodHN8ZW58MXx8fHwxNzc2Mzc2Nzg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    liked: 0,
  },
];

const mockPlaylists = [
  {
    id: "pl1",
    name: "Liked Songs",
    coverImage: "https://images.unsplash.com/photo-1727086492203-dbb506fe1a8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBncmFkaWVudCUyMHB1cnBsZSUyMHBpbmt8ZW58MXx8fHwxNzc2NDA0NDE3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    songCount: 42,
    description: "Your favorite tracks",
  },
  {
    id: "pl2",
    name: "Focus Boost",
    coverImage: "https://images.unsplash.com/photo-1758876202616-1af582182a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBoZWFkcGhvbmVzfGVufDF8fHx8MTc3NjQwNDQxOHww&ixlib=rb-4.1.0&q=80&w=1080",
    songCount: 28,
    description: "Deep focus music for coding",
  },
  {
    id: "pl3",
    name: "Night Drive",
    coverImage: "https://images.unsplash.com/photo-1620983626305-88db754c9a29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGNpdHklMjBuaWdodCUyMG5lb258ZW58MXx8fHwxNzc2MzYzNjc5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    songCount: 35,
    description: "Urban vibes for late night cruising",
  },
  {
    id: "pl4",
    name: "Tropical Chill",
    coverImage: "https://images.unsplash.com/photo-1672841828482-45faa4c70e50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwc3Vuc2V0fGVufDF8fHx8MTc3NjM0ODM4NXww&ixlib=rb-4.1.0&q=80&w=1080",
    songCount: 24,
    description: "Beach vibes and relaxation",
  },
  {
    id: "pl5",
    name: "My Playlist #1",
    coverImage: "https://images.unsplash.com/photo-1687868803274-b800be48c907?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwd2F2ZXN8ZW58MXx8fHwxNzc2MzQ2ODIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    songCount: 15,
    description: "",
  },
  {
    id: "pl6",
    name: "Workout Mix",
    coverImage: "https://images.unsplash.com/photo-1692176548571-86138128e36c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwbXVzaWMlMjBkanxlbnwxfHx8fDE3NzYzNjE5NjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    songCount: 40,
    description: "High energy gym tracks",
  },
];

const insertSong = db.prepare('INSERT OR IGNORE INTO songs (id, title, artist, album, duration, albumArt, liked) VALUES (?, ?, ?, ?, ?, ?, ?)');
console.log("Seeding songs...");
for (const song of mockSongs) {
  insertSong.run(song.id, song.title, song.artist, song.album, song.duration, song.albumArt, song.liked);
}

const insertPlaylist = db.prepare('INSERT OR IGNORE INTO playlists (id, name, coverImage, songCount, description) VALUES (?, ?, ?, ?, ?)');
console.log("Seeding playlists...");
for (const pl of mockPlaylists) {
  insertPlaylist.run(pl.id, pl.name, pl.coverImage, pl.songCount, pl.description);
}

console.log("Database seeded successfully!");
