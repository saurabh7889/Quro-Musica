import { NavLink } from "react-router";
import { Home, Search, Library } from "lucide-react";
import { motion } from "motion/react";

export function BottomNav() {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/library", icon: Library, label: "Library" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-background/60 backdrop-blur-3xl border-t border-white/10 z-[60] flex items-center justify-around px-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className="relative h-full"
        >
          {({ isActive }) => (
            <div className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-500 relative ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}>
              {/* Active Indicator Bubble */}
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <motion.div
                animate={isActive ? {
                  scale: [1, 1.15, 1],
                  filter: [
                    "drop-shadow(0 0 0px rgba(29,185,84,0))",
                    "drop-shadow(0 0 8px rgba(29,185,84,0.4))",
                    "drop-shadow(0 0 4px rgba(29,185,84,0.2))"
                  ]
                } : {}}
                transition={{ duration: 0.4 }}
              >
                <item.icon className={`w-6 h-6 ${isActive ? "fill-primary/20" : ""}`} />
              </motion.div>
              
              <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                isActive ? "opacity-100 scale-100" : "opacity-60 scale-90"
              }`}>
                {item.label}
              </span>

              {/* Bottom Line Indicator */}
              {isActive && (
                <motion.div
                  layoutId="nav-line"
                  className="absolute -bottom-1 w-6 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(29,185,84,0.6)]"
                />
              )}
            </div>
          )}
        </NavLink>
      ))}
    </div>
  );
}
