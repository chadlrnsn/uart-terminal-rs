import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { PortSettings } from "@/types";

interface PortSettingsProps {
  settings: PortSettings;
  onChange: (settings: PortSettings) => void;
  disabled?: boolean;
}

const BAUD_RATES = [
  9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600,
];

const PARITY_OPTIONS = ["None", "Odd", "Even"];

const FLOW_CONTROL_OPTIONS = ["None", "Software", "Hardware"];

export function PortSettingsComponent({
  settings,
  onChange,
  disabled = false,
}: PortSettingsProps) {
  const updateSetting = <K extends keyof PortSettings>(
    key: K,
    value: PortSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Port Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="baud-rate">Baud Rate</Label>
          <Select
            id="baud-rate"
            value={settings.baud_rate.toString()}
            onChange={(e) =>
              updateSetting("baud_rate", parseInt(e.target.value))
            }
            disabled={disabled}
          >
            {BAUD_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="data-bits">Data Bits</Label>
          <Select
            id="data-bits"
            value={settings.data_bits.toString()}
            onChange={(e) =>
              updateSetting("data_bits", parseInt(e.target.value))
            }
            disabled={disabled}
          >
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stop-bits">Stop Bits</Label>
          <Select
            id="stop-bits"
            value={settings.stop_bits.toString()}
            onChange={(e) =>
              updateSetting("stop_bits", parseInt(e.target.value))
            }
            disabled={disabled}
          >
            <option value="1">1</option>
            <option value="2">2</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parity">Parity</Label>
          <Select
            id="parity"
            value={settings.parity}
            onChange={(e) => updateSetting("parity", e.target.value)}
            disabled={disabled}
          >
            {PARITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="flow-control">Flow Control</Label>
          <Select
            id="flow-control"
            value={settings.flow_control}
            onChange={(e) => updateSetting("flow_control", e.target.value)}
            disabled={disabled}
          >
            {FLOW_CONTROL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeout">Timeout (ms)</Label>
          <Input
            id="timeout"
            type="number"
            min="100"
            max="10000"
            step="100"
            value={settings.timeout_ms}
            onChange={(e) =>
              updateSetting("timeout_ms", parseInt(e.target.value) || 1000)
            }
            disabled={disabled}
          />
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="text-sm font-semibold mb-3">Advanced Flow Control</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="rts" className="text-sm font-normal cursor-pointer">
              RTS (Request To Send)
            </Label>
            <Switch
              id="rts"
              checked={settings.rts ?? false}
              onCheckedChange={(checked) =>
                updateSetting("rts", checked)
              }
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="cts" className="text-sm font-normal cursor-pointer">
              CTS (Clear To Send)
            </Label>
            <Switch
              id="cts"
              checked={settings.cts ?? false}
              onCheckedChange={(checked) =>
                updateSetting("cts", checked)
              }
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dtr" className="text-sm font-normal cursor-pointer">
              DTR (Data Terminal Ready)
            </Label>
            <Switch
              id="dtr"
              checked={settings.dtr ?? false}
              onCheckedChange={(checked) =>
                updateSetting("dtr", checked)
              }
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dsr" className="text-sm font-normal cursor-pointer">
              DSR (Data Set Ready)
            </Label>
            <Switch
              id="dsr"
              checked={settings.dsr ?? false}
              onCheckedChange={(checked) =>
                updateSetting("dsr", checked)
              }
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dcd" className="text-sm font-normal cursor-pointer">
              DCD (Data Carrier Detect)
            </Label>
            <Switch
              id="dcd"
              checked={settings.dcd ?? false}
              onCheckedChange={(checked) =>
                updateSetting("dcd", checked)
              }
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

