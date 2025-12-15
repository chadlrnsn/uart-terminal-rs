import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PortInfo } from "@/types";

interface PortSelectorProps {
  ports: PortInfo[];
  selectedPort: string | null;
  onSelectPort: (portName: string) => void;
  onRefresh: () => void;
  disabled?: boolean;
}

export function PortSelector({
  ports,
  selectedPort,
  onSelectPort,
  onRefresh,
  disabled = false,
}: PortSelectorProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
        e.preventDefault();
        onRefresh();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onRefresh]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="port-select">COM Port</Label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={disabled}
          title="Refresh ports (F5)"
        >
          <RefreshCw className={cn("h-4 w-4", disabled && "animate-spin")} />
        </Button>
      </div>
      <Select
        id="port-select"
        value={selectedPort || ""}
        onChange={(e) => onSelectPort(e.target.value)}
        disabled={disabled}
      >
        <option value="">Select port...</option>
        {ports.map((port) => (
          <option key={port.name} value={port.name}>
            {port.name}
            {port.description ? ` - ${port.description}` : ""}
          </option>
        ))}
      </Select>
      {ports.length === 0 && (
        <p className="text-sm text-muted-foreground">No ports available</p>
      )}
    </div>
  );
}

