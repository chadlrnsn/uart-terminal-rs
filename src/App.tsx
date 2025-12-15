import { useState, useEffect, useCallback } from "react";
import { useComPort } from "@/hooks/useComPort";
import { Terminal } from "@/components/Terminal";
import { DataSender } from "@/components/DataSender";
import { TerminalSidebar } from "@/components/TerminalSidebar";
import { Sidebar } from "@/components/Sidebar";
import { SettingsTabs } from "@/components/SettingsTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { TxSettings, RxSettings } from "@/types";

function App() {
  const {
    ports,
    selectedPort,
    setSelectedPort,
    isOpen,
    settings,
    setSettings,
    error,
    isLoading,
    refreshPorts,
    openPort,
    closePort,
    writeData,
    readData,
  } = useComPort();

  const [terminalData, setTerminalData] = useState("");
  const [sendMode, setSendMode] = useState<"text" | "hex">("text");
  const [isReading, setIsReading] = useState(false);
  const [activeTab, setActiveTab] = useState<"metrics" | "settings" | "terminal" | "logs">("settings");
  const [localTxEcho, setLocalTxEcho] = useState(false);
  const [txSettings, setTxSettings] = useState<TxSettings>({
    enterKey: "lf",
    backspaceKey: "backspace",
    deleteKey: "vt_sequence",
    ctrlKeys: true,
    altKeys: true,
  });
  const [rxSettings, setRxSettings] = useState<RxSettings>({
    dataType: "ascii",
    ansiEscapeCodes: true,
    maxEscapeCodeLength: 10,
    localTxEcho: false,
    newLineBehavior: "crlf",
    swallowNewLine: true,
    carriageReturnBehavior: "none",
    swallowCarriageReturn: true,
    nonVisibleDisplay: "control_glyphs",
  });

  const handleSend = useCallback(
    async (data: Uint8Array) => {
      await writeData(data);
      const hexString = Array.from(data)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");
      
      if (localTxEcho) {
        const decoder = new TextDecoder("utf-8", { fatal: false });
        const text = decoder.decode(data);
        setTerminalData((prev) => prev + `[TX] ${text} (${hexString})\n`);
      } else {
        setTerminalData((prev) => prev + `[TX] ${hexString}\n`);
      }
    },
    [writeData, localTxEcho]
  );

  const handleRead = useCallback(async () => {
    if (!isOpen || isReading) {
      return;
    }

    setIsReading(true);
    try {
      const data = await readData(1024);
      if (data && data.length > 0) {
        const decoder = new TextDecoder("utf-8", { fatal: false });
        const text = decoder.decode(data);
        const hexString = Array.from(data)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" ");
        setTerminalData((prev) => prev + `[RX] ${text} (${hexString})\n`);
      }
    } catch (err) {
      console.error("Read error:", err);
    } finally {
      setIsReading(false);
    }
  }, [isOpen, isReading, readData]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const interval = setInterval(handleRead, 100);
    return () => clearInterval(interval);
  }, [isOpen, handleRead]);

  const handleToggleConnection = async () => {
    if (isOpen) {
      await closePort();
      setTerminalData("");
    } else {
      await openPort();
    }
  };

  const handleClearTerminal = () => {
    setTerminalData("");
  };

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 ml-64 flex flex-col overflow-hidden bg-background">
        {error && (
          <div className="px-6 pt-4 border-b border-destructive/20 bg-destructive/5">
            <Alert variant="destructive" className="border-destructive/50">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex-1 overflow-hidden p-6">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as "metrics" | "settings" | "terminal" | "logs")} 
            className="h-full flex flex-col"
          >
            <TabsContent value="metrics" className="flex-1 overflow-hidden mt-0">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Metrics</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="text-sm text-muted-foreground">
                    Metrics will be displayed here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 overflow-hidden mt-0">
              <SettingsTabs
                ports={ports}
                selectedPort={selectedPort}
                onSelectPort={setSelectedPort}
                onRefreshPorts={refreshPorts}
                isOpen={isOpen}
                isLoading={isLoading}
                onToggleConnection={handleToggleConnection}
                settings={settings}
                onSettingsChange={setSettings}
                txSettings={txSettings}
                onTxSettingsChange={setTxSettings}
                rxSettings={rxSettings}
                onRxSettingsChange={setRxSettings}
              />
            </TabsContent>

            <TabsContent value="terminal" className="flex-1 overflow-hidden mt-0">
              <div className="h-full flex gap-6">
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                  <div className="flex-1 min-h-0">
                    <Terminal
                      data={terminalData}
                      onClear={handleClearTerminal}
                      maxLines={1000}
                      localTxEcho={localTxEcho}
                      onLocalTxEchoChange={setLocalTxEcho}
                    />
                  </div>
                  <DataSender
                    onSend={handleSend}
                    disabled={!isOpen}
                    sendMode={sendMode}
                    onModeChange={setSendMode}
                  />
                </div>
                <TerminalSidebar
                  settings={settings}
                  onSettingsChange={setSettings}
                  disabled={isOpen || isLoading}
                  ports={ports}
                  selectedPort={selectedPort}
                  onSelectPort={setSelectedPort}
                  onRefreshPorts={refreshPorts}
                  isOpen={isOpen}
                  isLoading={isLoading}
                  onToggleConnection={handleToggleConnection}
                />
              </div>
            </TabsContent>

            <TabsContent value="logs" className="flex-1 overflow-hidden mt-0">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Logs</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="text-sm text-muted-foreground">
                    Logs will be displayed here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default App;
