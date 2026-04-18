import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { MusicPlayer } from "./MusicPlayer";
import { QueuePanel } from "./QueuePanel";
import { BottomNav } from "./BottomNav";
import { UserProfile } from "./UserProfile";
import { Toaster } from "./ui/sonner";
import { AddToPlaylistDialog } from "./AddToPlaylistDialog";

export function Layout() {
  return (
    <div className="h-screen w-full max-w-full bg-background text-foreground overflow-x-hidden overflow-y-auto flex transition-colors duration-300 relative">
      <AddToPlaylistDialog />
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-500" />
      </div>

      {/* Left Sidebar (Desktop Only) */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative pb-[64px] md:pb-0">
        {/* Top Bar */}
        <div className="h-16 border-b border-border bg-background/20 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 relative z-10 transition-colors duration-300">
          {/* Mobile Branding */}
          <div className="md:hidden">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Quro Música
            </h1>
          </div>
          
          <div className="ml-auto">
            <UserProfile />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>

        {/* Bottom Music Player */}
        <MusicPlayer />
      </div>

      {/* Right Queue Panel (Desktop Large Only) */}
      <div className="hidden lg:flex z-40">
        <QueuePanel />
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
