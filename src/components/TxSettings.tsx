import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import type { TxSettings } from "@/types";

interface TxSettingsProps {
  settings: TxSettings;
  onChange: (settings: TxSettings) => void;
  disabled?: boolean;
}

export function TxSettingsComponent({
  settings,
  onChange,
  disabled = false,
}: TxSettingsProps) {
  const updateSetting = <K extends keyof TxSettings>(
    key: K,
    value: TxSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Enter</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="text-sm text-muted-foreground mb-3 block">
            When enter is pressed:
          </Label>
          <RadioGroup
            value={settings.enterKey}
            onValueChange={(value) =>
              updateSetting("enterKey", value as TxSettings["enterKey"])
            }
            disabled={disabled}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lf" id="enter-lf" />
              <Label htmlFor="enter-lf" className="text-sm font-normal cursor-pointer">
                Send LF (0x0A)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cr" id="enter-cr" />
              <Label htmlFor="enter-cr" className="text-sm font-normal cursor-pointer">
                Send CR (0x0D)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="crlf" id="enter-crlf" />
              <Label htmlFor="enter-crlf" className="text-sm font-normal cursor-pointer">
                Send CRLF (0x0D 0x0A)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="break" id="enter-break" />
              <Label htmlFor="enter-break" className="text-sm font-normal cursor-pointer">
                Send a break signal
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Backspace</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-sm text-muted-foreground mb-3 block">
              When backspace is pressed:
            </Label>
            <RadioGroup
              value={settings.backspaceKey}
              onValueChange={(value) =>
                updateSetting("backspaceKey", value as TxSettings["backspaceKey"])
              }
              disabled={disabled}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="backspace" id="backspace-backspace" />
                <Label htmlFor="backspace-backspace" className="text-sm font-normal cursor-pointer">
                  Send backspace (0x08)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delete" id="backspace-delete" />
                <Label htmlFor="backspace-delete" className="text-sm font-normal cursor-pointer">
                  Send delete (0x7F)
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Delete</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-sm text-muted-foreground mb-3 block">
              When delete is pressed:
            </Label>
            <RadioGroup
              value={settings.deleteKey}
              onValueChange={(value) =>
                updateSetting("deleteKey", value as TxSettings["deleteKey"])
              }
              disabled={disabled}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="backspace" id="delete-backspace" />
                <Label htmlFor="delete-backspace" className="text-sm font-normal cursor-pointer">
                  Send backspace (0x08)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delete" id="delete-delete" />
                <Label htmlFor="delete-delete" className="text-sm font-normal cursor-pointer">
                  Send delete (0x7F)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vt_sequence" id="delete-vt" />
                <Label htmlFor="delete-vt" className="text-sm font-normal cursor-pointer">
                  Send VT sequence (ESC [ 3 ~)
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Meta Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ctrl-keys"
              checked={settings.ctrlKeys}
              onCheckedChange={(checked) =>
                updateSetting("ctrlKeys", checked === true)
              }
              disabled={disabled}
            />
            <Label htmlFor="ctrl-keys" className="text-sm font-normal cursor-pointer">
              Send 0x01-0x1A when Ctrl+A thru Ctrl+Z is pressed
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="alt-keys"
              checked={settings.altKeys}
              onCheckedChange={(checked) =>
                updateSetting("altKeys", checked === true)
              }
              disabled={disabled}
            />
            <Label htmlFor="alt-keys" className="text-sm font-normal cursor-pointer">
              Send [ESC] + &lt;char&gt; when Alt-&lt;char&gt; is pressed (e.g. Alt-A sends 0x1B 0x41).
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
