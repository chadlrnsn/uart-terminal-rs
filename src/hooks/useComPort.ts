import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { PortInfo, PortSettings, ErrorResponse } from "@/types";

export function useComPort() {
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PortSettings>({
    baud_rate: 115200,
    data_bits: 8,
    stop_bits: 1,
    parity: "None",
    flow_control: "None",
    timeout_ms: 1000,
    rts: false,
    cts: false,
    dtr: false,
    dsr: false,
    dcd: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshPorts = useCallback(async () => {
    try {
      const result = await invoke<PortInfo[]>("list_ports");
      setPorts(result);
      setError(null);
    } catch (err) {
      const errorMsg = err as ErrorResponse;
      setError(errorMsg.error || "Failed to list ports");
    }
  }, []);

  const openPort = useCallback(async () => {
    if (!selectedPort) {
      setError("No port selected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await invoke("open_port", {
        portName: selectedPort,
        settings,
      });
      setIsOpen(true);
    } catch (err) {
      const errorMsg = err as ErrorResponse;
      setError(errorMsg.error || "Failed to open port");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPort, settings]);

  const closePort = useCallback(async () => {
    if (!selectedPort) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await invoke("close_port", {
        portName: selectedPort,
      });
      setIsOpen(false);
    } catch (err) {
      const errorMsg = err as ErrorResponse;
      setError(errorMsg.error || "Failed to close port");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPort]);

  const writeData = useCallback(
    async (data: Uint8Array) => {
      if (!selectedPort || !isOpen) {
        setError("Port is not open");
        return;
      }

      try {
        await invoke("write_data", {
          portName: selectedPort,
          data: Array.from(data),
        });
        setError(null);
      } catch (err) {
        const errorMsg = err as ErrorResponse;
        setError(errorMsg.error || "Failed to write data");
      }
    },
    [selectedPort, isOpen]
  );

  const readData = useCallback(
    async (bufferSize: number = 1024): Promise<Uint8Array | null> => {
      if (!selectedPort || !isOpen) {
        setError("Port is not open");
        return null;
      }

      try {
        const data = await invoke<number[]>("read_data", {
          portName: selectedPort,
          bufferSize,
        });
        setError(null);
        return new Uint8Array(data);
      } catch (err) {
        const errorMsg = err as ErrorResponse;
        setError(errorMsg.error || "Failed to read data");
        return null;
      }
    },
    [selectedPort, isOpen]
  );

  useEffect(() => {
    refreshPorts();
    const interval = setInterval(refreshPorts, 2000);
    return () => clearInterval(interval);
  }, [refreshPorts]);

  return {
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
  };
}

