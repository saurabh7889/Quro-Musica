import { NavLink } from "react-router";
import { Home, Search, Library } from "lucide-react";

export function BottomNav() {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/library", icon: Library, label: "Library" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-background/95 backdrop-blur-2xl border-t border-white/5 z-[60] flex items-center justify-around px-4 pb-safe">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-300 ${
              isActive ? "text-primary scale-105 drop-shadow-[0_0_8px_rgba(29,185,84,0.4)]" : "text-muted-foreground hover:text-foreground"
            }`
          }
        >
          <item.icon className="w-6 h-6" />
          <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
