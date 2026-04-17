import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { MusicPlayer } from "./MusicPlayer";
import { QueuePanel } from "./QueuePanel";
import { UserProfile } from "./UserProfile";
import { Toaster } from "./ui/sonner";

export function Layout() {
  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex transition-colors duration-300">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-500" />
      </div>

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Bar */}
        <div className="h-16 border-b border-border bg-background/20 backdrop-blur-xl flex items-center justify-end px-8 relative z-10 transition-colors duration-300">
          <UserProfile />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>

        {/* Bottom Music Player */}
        <MusicPlayer />
      </div>

      {/* Right Queue Panel */}
      <QueuePanel />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
