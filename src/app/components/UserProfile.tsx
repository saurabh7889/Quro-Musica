import { User, Settings, LogOut, ChevronDown, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function UserProfile() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 px-3 py-2 rounded-full bg-background/40 backdrop-blur-xl border border-border hover:border-primary/50 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-[0_0_15px_rgba(29,185,84,0.4)] transition-shadow">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-medium text-foreground text-sm">User</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-popover/95 backdrop-blur-2xl border border-border text-popover-foreground"
      >
        <DropdownMenuLabel className="text-muted-foreground">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
          <User className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              Dark Mode
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem className="focus:bg-destructive/20 focus:text-destructive cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
