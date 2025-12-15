import { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Search, X } from "lucide-react";

interface TerminalProps {
  data: string;
  onClear?: () => void;
  maxLines?: number;
  localTxEcho?: boolean;
  onLocalTxEchoChange?: (enabled: boolean) => void;
}

type FilterType = "all" | "tx" | "rx";

export function Terminal({ 
  data, 
  onClear, 
  maxLines = 1000,
  localTxEcho = false,
  onLocalTxEchoChange,
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [data, autoScroll]);

  const handleScroll = () => {
    if (terminalRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setAutoScroll(isAtBottom);
    }
  };

  const filteredLines = useMemo(() => {
    let lines = data.split("\n").slice(-maxLines);
    
    if (filterType !== "all") {
      lines = lines.filter((line) => {
        if (filterType === "tx") {
          return line.startsWith("[TX]");
        } else if (filterType === "rx") {
          return line.startsWith("[RX]");
        }
        return true;
      });
    }
    
    if (searchFilter.trim()) {
      const searchLower = searchFilter.toLowerCase();
      lines = lines.filter((line) => line.toLowerCase().includes(searchLower));
    }
    
    return lines;
  }, [data, maxLines, filterType, searchFilter]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Terminal Output</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="auto-scroll"
                checked={autoScroll}
                onCheckedChange={(checked) => setAutoScroll(checked === true)}
              />
              <Label
                htmlFor="auto-scroll"
                className="text-sm font-normal cursor-pointer"
              >
                Auto-scroll
              </Label>
            </div>
            {onLocalTxEchoChange && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="local-tx-echo"
                  checked={localTxEcho}
                  onCheckedChange={(checked) => onLocalTxEchoChange(checked === true)}
                />
                <Label
                  htmlFor="local-tx-echo"
                  className="text-sm font-normal cursor-pointer"
                >
                  Local TX Echo
                </Label>
              </div>
            )}
            {onClear && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClear}
                title="Clear terminal"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-8 h-9"
            />
            {searchFilter && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchFilter("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              type="button"
              variant={filterType === "all" ? "secondary" : "ghost"}
              size="sm"
              className="h-9 px-3 text-xs"
              onClick={() => setFilterType("all")}
            >
              All
            </Button>
            <Button
              type="button"
              variant={filterType === "tx" ? "secondary" : "ghost"}
              size="sm"
              className="h-9 px-3 text-xs"
              onClick={() => setFilterType("tx")}
            >
              TX
            </Button>
            <Button
              type="button"
              variant={filterType === "rx" ? "secondary" : "ghost"}
              size="sm"
              className="h-9 px-3 text-xs"
              onClick={() => setFilterType("rx")}
            >
              RX
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div
          ref={terminalRef}
          className="h-full overflow-auto bg-slate-950 dark:bg-black text-green-400 dark:text-green-500 font-mono text-sm p-4 rounded-b-lg"
          onScroll={handleScroll}
          tabIndex={0}
        >
          {filteredLines.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap break-words">
              {line || " "}
            </div>
          ))}
          {filteredLines.length === 0 && (
            <div className="text-muted-foreground">
              {data.length === 0 ? "No data received" : "No data matches filter"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

