import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataSenderProps {
  onSend: (data: Uint8Array) => void;
  disabled?: boolean;
  sendMode: "text" | "hex";
  onModeChange: (mode: "text" | "hex") => void;
}

export function DataSender({
  onSend,
  disabled = false,
  sendMode,
  onModeChange,
}: DataSenderProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) {
      return;
    }

    let data: Uint8Array;

    if (sendMode === "hex") {
      const hexString = input.replace(/\s+/g, "");
      if (hexString.length % 2 !== 0) {
        alert("Invalid hex string: must have even number of characters");
        return;
      }

      const bytes = [];
      for (let i = 0; i < hexString.length; i += 2) {
        const byte = parseInt(hexString.substr(i, 2), 16);
        if (isNaN(byte)) {
          alert(`Invalid hex byte at position ${i}`);
          return;
        }
        bytes.push(byte);
      }
      data = new Uint8Array(bytes);
    } else {
      const encoder = new TextEncoder();
      data = encoder.encode(input);
    }

    onSend(data);
    setInput("");
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Send Data</CardTitle>
          <div className="flex gap-1">
            <Button
              type="button"
              variant={sendMode === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => onModeChange("text")}
              disabled={disabled}
            >
              Text
            </Button>
            <Button
              type="button"
              variant={sendMode === "hex" ? "default" : "outline"}
              size="sm"
              onClick={() => onModeChange("hex")}
              disabled={disabled}
            >
              Hex
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Textarea
            id="data-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder={
              sendMode === "hex"
                ? "Enter hex data (e.g., 48 65 6C 6C 6F)"
                : "Enter text to send (Enter to send, Shift+Enter for new line)"
            }
            rows={3}
            className="flex-1 font-mono"
          />
          <Button
            type="button"
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            size="icon"
            className="h-auto"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

