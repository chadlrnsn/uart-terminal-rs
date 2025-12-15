import { useState } from "react";
import { ChevronRight, ChevronLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortSettingsComponent } from "@/components/PortSettings";
import { PortSelector } from "@/components/PortSelector";
import { cn } from "@/lib/utils";
import type { PortSettings, PortInfo } from "@/types";

interface TerminalSidebarProps {
  settings: PortSettings;
  onSettingsChange: (settings: PortSettings) => void;
  disabled?: boolean;
  ports?: PortInfo[];
  selectedPort?: string | null;
  onSelectPort?: (port: string | null) => void;
  onRefreshPorts?: () => void;
  isOpen?: boolean;
  isLoading?: boolean;
  onToggleConnection?: () => void;
}

export function TerminalSidebar({
  settings,
  onSettingsChange,
  disabled = false,
  ports = [],
  selectedPort = null,
  onSelectPort,
  onRefreshPorts,
  isOpen: portIsOpen = false,
  isLoading = false,
  onToggleConnection,
}: TerminalSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative flex h-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-10 top-4 h-8 w-8 rounded-l-md rounded-r-none border border-r-0 bg-card hover:bg-accent z-10 shadow-sm"
        title={isOpen ? "Hide settings" : "Show settings"}
      >
        {isOpen ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      <div
        className={cn(
          "transition-all duration-300 ease-in-out border-l bg-card h-full",
          isOpen ? "w-80" : "w-0 overflow-hidden"
        )}
      >
        <Card className="h-full flex flex-col rounded-none border-0 border-l shadow-none">
          <CardHeader className="flex-shrink-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Port Settings
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5">
            {ports.length > 0 && onSelectPort && onRefreshPorts && (
              <PortSelector
                ports={ports}
                selectedPort={selectedPort}
                onSelectPort={(portName) => onSelectPort(portName || null)}
                onRefresh={onRefreshPorts}
                disabled={portIsOpen || isLoading}
              />
            )}

            {onToggleConnection && (
              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  onClick={onToggleConnection}
                  disabled={!selectedPort || isLoading}
                  className={cn(
                    "w-full h-11 font-semibold",
                    portIsOpen && "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  )}
                >
                  {portIsOpen ? "Disconnect" : "Connect"}
                </Button>
                {portIsOpen && selectedPort && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-500/10 border border-green-500/20">
                    <div className="relative">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <div className="absolute inset-0 h-2 w-2 rounded-full bg-green-500 animate-ping opacity-75" />
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Connected to {selectedPort}
                    </span>
                  </div>
                )}
              </div>
            )}

            <PortSettingsComponent
              settings={settings}
              onChange={onSettingsChange}
              disabled={disabled}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

