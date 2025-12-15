import { useState } from "react";
import { PortSelector } from "@/components/PortSelector";
import { PortSettingsComponent } from "@/components/PortSettings";
import { TxSettingsComponent } from "@/components/TxSettings";
import { RxSettingsComponent } from "@/components/RxSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { PortSettings, PortInfo, TxSettings, RxSettings } from "@/types";

type SettingsTab = "connection" | "tx" | "rx" | "display" | "general" | "profiles" | "sounds";

interface SettingsTabsProps {
  ports: PortInfo[];
  selectedPort: string | null;
  onSelectPort: (port: string | null) => void;
  onRefreshPorts: () => void;
  isOpen: boolean;
  isLoading: boolean;
  onToggleConnection: () => void;
  settings: PortSettings;
  onSettingsChange: (settings: PortSettings) => void;
  txSettings: TxSettings;
  onTxSettingsChange: (settings: TxSettings) => void;
  rxSettings: RxSettings;
  onRxSettingsChange: (settings: RxSettings) => void;
}

export function SettingsTabs({
  ports,
  selectedPort,
  onSelectPort,
  onRefreshPorts,
  isOpen,
  isLoading,
  onToggleConnection,
  settings,
  onSettingsChange,
  txSettings,
  onTxSettingsChange,
  rxSettings,
  onRxSettingsChange,
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("connection");

  return (
    <Card className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)} className="h-full flex flex-col">
        <div className="border-b px-6 pt-6">
          <TabsList className="w-full justify-start h-auto bg-transparent p-0">
            <TabsTrigger value="connection" className="px-4 py-2 data-[state=active]:bg-secondary">
              Connection Configuration
            </TabsTrigger>
            <TabsTrigger value="tx" className="px-4 py-2 data-[state=active]:bg-secondary">
              TX Settings
            </TabsTrigger>
            <TabsTrigger value="rx" className="px-4 py-2 data-[state=active]:bg-secondary">
              RX Settings
            </TabsTrigger>
            <TabsTrigger value="display" className="px-4 py-2 data-[state=active]:bg-secondary">
              Display
            </TabsTrigger>
            <TabsTrigger value="general" className="px-4 py-2 data-[state=active]:bg-secondary">
              General
            </TabsTrigger>
            <TabsTrigger value="profiles" className="px-4 py-2 data-[state=active]:bg-secondary">
              Profiles
            </TabsTrigger>
            <TabsTrigger value="sounds" className="px-4 py-2 data-[state=active]:bg-secondary">
              Sounds
            </TabsTrigger>
          </TabsList>
        </div>
        <CardContent className="flex-1 overflow-y-auto p-6">
          <TabsContent value="connection" className="mt-0">
            <div className="space-y-5">
              <PortSelector
                ports={ports}
                selectedPort={selectedPort}
                onSelectPort={(portName) => onSelectPort(portName || null)}
                onRefresh={onRefreshPorts}
                disabled={isOpen || isLoading}
              />
              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  onClick={onToggleConnection}
                  disabled={!selectedPort || isLoading}
                  className={cn(
                    "w-full h-11 font-semibold",
                    isOpen && "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  )}
                >
                  {isOpen ? "Disconnect" : "Connect"}
                </Button>
                {isOpen && (
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
              <PortSettingsComponent
                settings={settings}
                onChange={onSettingsChange}
                disabled={isOpen || isLoading}
              />
            </div>
          </TabsContent>
          <TabsContent value="tx" className="mt-0">
            <TxSettingsComponent
              settings={txSettings}
              onChange={onTxSettingsChange}
              disabled={isOpen || isLoading}
            />
          </TabsContent>
          <TabsContent value="rx" className="mt-0">
            <RxSettingsComponent
              settings={rxSettings}
              onChange={onRxSettingsChange}
              disabled={isOpen || isLoading}
            />
          </TabsContent>
          <TabsContent value="display" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Display</h3>
              <div className="text-sm text-muted-foreground">
                Display settings will be displayed here
              </div>
            </div>
          </TabsContent>
          <TabsContent value="general" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">General</h3>
              <div className="text-sm text-muted-foreground">
                General settings will be displayed here
              </div>
            </div>
          </TabsContent>
          <TabsContent value="profiles" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profiles</h3>
              <div className="text-sm text-muted-foreground">
                Profiles will be displayed here
              </div>
            </div>
          </TabsContent>
          <TabsContent value="sounds" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sounds</h3>
              <div className="text-sm text-muted-foreground">
                Sound settings will be displayed here
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
