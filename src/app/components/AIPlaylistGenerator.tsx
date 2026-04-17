import { useState } from "react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { api } from "../api";
import { usePlayer } from "../context/PlayerContext";

interface AIPlaylistGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIPlaylistGenerator({
  open,
  onOpenChange,
}: AIPlaylistGeneratorProps) {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { playPlaylist } = usePlayer();

  const moods = [
    { id: "focus", label: "Focus", gradient: "from-blue-500 to-cyan-500" },
    { id: "chill", label: "Chill", gradient: "from-purple-500 to-pink-500" },
    { id: "energetic", label: "Energetic", gradient: "from-orange-500 to-red-500" },
    { id: "happy", label: "Happy", gradient: "from-yellow-500 to-orange-500" },
    { id: "sad", label: "Melancholic", gradient: "from-indigo-500 to-purple-500" },
    { id: "romantic", label: "Romantic", gradient: "from-pink-500 to-rose-500" },
  ];

  const activities = [
    "Coding",
    "Studying",
    "Night Drive",
    "Workout",
    "Reading",
    "Gaming",
    "Meditation",
    "Party",
  ];

  const handleGenerate = async () => {
    if (!selectedMood || !selectedActivity) {
      toast.error("Please select both mood and activity");
      return;
    }

    setIsGenerating(true);

    try {
      // Call the new backend endpoint
      const res = await api.generatePlaylist(`${selectedActivity} ${selectedMood}`);
      
      toast.success("AI Playlist Generated!", {
        description: `Created "${res.playlist.name}" with ${res.playlist.songCount} songs`,
      });
      
      // Auto-play the generated playlist
      playPlaylist(res.songs);
      
      onOpenChange(false);
      setSelectedMood("");
      setSelectedActivity("");
    } catch(err) {
      toast.error("Failed to generate playlist");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/90 backdrop-blur-3xl border border-border text-foreground max-w-2xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
        
        <div className="p-10 space-y-8 relative z-10">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-4xl font-black tracking-tight mb-1">
                  AI Generator
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium">
                  Create the perfect playlist based on your mood and activity
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-8">
            {/* Mood Selection */}
            <div>
              <Label className="text-sm font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4 block">
                Select Your Mood
              </Label>
              <div className="grid grid-cols-3 gap-4">
                {moods.map((mood) => (
                  <motion.button
                    key={mood.id}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`p-5 rounded-3xl border-2 transition-all text-center group ${
                      selectedMood === mood.id
                        ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(29,185,84,0.2)]"
                        : "border-border bg-accent/40 hover:border-primary/30 hover:bg-accent/60"
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mood.gradient} mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-500`}
                    />
                    <p className={`text-sm font-bold ${selectedMood === mood.id ? "text-primary" : "text-foreground"}`}>
                      {mood.label}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Activity Selection */}
            <div>
              <Label className="text-sm font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4 block">
                What are you doing?
              </Label>
              <div className="grid grid-cols-4 gap-3">
                {activities.map((activity) => (
                  <motion.button
                    key={activity}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedActivity(activity)}
                    className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                      selectedActivity === activity
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40"
                        : "bg-accent/40 text-muted-foreground hover:bg-accent/80 border border-border"
                    }`}
                  >
                    {activity}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-8 text-xl rounded-3xl shadow-2xl hover:shadow-primary/40 transition-all disabled:opacity-50 group mt-4 h-auto"
              >
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="generating"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3"
                    >
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Generating Magic...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="generate"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3"
                    >
                      <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      Generate AI Playlist
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
