import { RouterProvider } from "react-router";
import { router } from "./routes";
import { PlayerProvider } from "./context/PlayerContext";
import { ThemeProvider } from "next-themes";

/**
 * Quro Música - AI-Powered Music Streaming Application
 * 
 * A modern, premium dark-themed music streaming UI with:
 * - Glassmorphism + Neumorphism design
 * - AI Playlist Generator
 * - Smart Recommendations
 * - Full music player controls
 * - Queue management
 * - Search with voice UI
 * - User library management
 */
export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <PlayerProvider>
        <RouterProvider router={router} />
      </PlayerProvider>
    </ThemeProvider>
  );
}