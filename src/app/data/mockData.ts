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

export interface ArtistProfile {
  name: string;
  bio: string;
  listeners: string;
  image: string;
}

export interface Playlist {
  id: string;
  name: string;
  coverImage: string;
  songCount: number;
  description?: string;
}

export const mockSongs: Song[] = [];
export const mockPlaylists: Playlist[] = [];

export const recentlyPlayed: Song[] = [];
export const queue: Song[] = [];
