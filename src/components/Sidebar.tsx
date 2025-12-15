import { Settings, Terminal, Plug, FileText, Activity, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";

interface SidebarProps {
  className?: string;
  activeTab?: "metrics" | "settings" | "terminal" | "logs";
  onTabChange?: (tab: "metrics" | "settings" | "terminal" | "logs") => void;
}

type NavItem = "metrics" | "terminal" | "logs" | "settings";

export function Sidebar({ className, activeTab, onTabChange }: SidebarProps) {
  const [activeItem, setActiveItem] = useState<NavItem>("settings");
  const { theme, toggleTheme } = useTheme();

  const handleNavClick = (item: NavItem) => {
    setActiveItem(item);
    if (onTabChange && (item === "metrics" || item === "settings" || item === "terminal" || item === "logs")) {
      onTabChange(item);
    }
  };

  const navItems = [
    { id: "metrics" as NavItem, icon: Plug, label: "Metrics" },
    { id: "terminal" as NavItem, icon: Terminal, label: "Terminal" },
    { id: "logs" as NavItem, icon: FileText, label: "Logs" },
    { id: "settings" as NavItem, icon: Settings, label: "Settings" },
  ];

  return (
    <aside
      className={cn(
        "w-64 border-r bg-card/50 backdrop-blur-sm flex flex-col h-screen fixed left-0 top-0 z-10 shadow-lg",
        className
      )}
    >
      <div className="p-6 border-b bg-card/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Terminal className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">UART Terminal</h2>
            <p className="text-xs text-muted-foreground">Serial Communication</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            (item.id === "metrics" && activeTab === "metrics") ||
            (item.id === "settings" && activeTab === "settings") ||
            (item.id === "terminal" && activeTab === "terminal") ||
            (item.id === "logs" && activeTab === "logs") ||
            (activeTab === undefined && activeItem === item.id);
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                isActive && "bg-secondary font-medium"
              )}
              onClick={() => handleNavClick(item.id)}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t bg-card/80 space-y-3">
        <div className="text-xs">
          <div className="font-semibold mb-2 text-foreground">System Status</div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-green-500 animate-ping opacity-75" />
            </div>
            <span>Ready</span>
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span>v0.1.0</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 hover:bg-accent transition-colors"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 text-blue-500" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}

