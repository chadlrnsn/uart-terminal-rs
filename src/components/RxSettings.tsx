import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { RxSettings } from "@/types";

interface RxSettingsProps {
  settings: RxSettings;
  onChange: (settings: RxSettings) => void;
  disabled?: boolean;
}

export function RxSettingsComponent({
  settings,
  onChange,
  disabled = false,
}: RxSettingsProps) {
  const updateSetting = <K extends keyof RxSettings>(
    key: K,
    value: RxSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-sm text-muted-foreground mb-3 block">
              How to interpret RX data:
            </Label>
            <RadioGroup
              value={settings.dataType}
              onValueChange={(value) =>
                updateSetting("dataType", value as RxSettings["dataType"])
              }
              disabled={disabled}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ascii" id="data-type-ascii" />
                <Label htmlFor="data-type-ascii" className="text-sm font-normal cursor-pointer">
                  ASCII
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="number" id="data-type-number" />
                <Label htmlFor="data-type-number" className="text-sm font-normal cursor-pointer">
                  Number (e.g. hex, uint8, int16, ...)
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Echo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="local-tx-echo-rx"
                checked={settings.localTxEcho}
                onCheckedChange={(checked) =>
                  updateSetting("localTxEcho", checked === true)
                }
                disabled={disabled}
              />
              <Label htmlFor="local-tx-echo-rx" className="text-sm font-normal cursor-pointer">
                Local TX Echo
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ANSI Escape Codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ansi-escape-codes"
              checked={settings.ansiEscapeCodes}
              onCheckedChange={(checked) =>
                updateSetting("ansiEscapeCodes", checked === true)
              }
              disabled={disabled}
            />
            <Label htmlFor="ansi-escape-codes" className="text-sm font-normal cursor-pointer">
              Enable ANSI Escape Code Parsing
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="max-escape-length" className="text-sm">
              Max. Escape Code Length:
            </Label>
            <Input
              id="max-escape-length"
              type="number"
              min="1"
              max="100"
              value={settings.maxEscapeCodeLength}
              onChange={(e) =>
                updateSetting("maxEscapeCodeLength", parseInt(e.target.value) || 10)
              }
              disabled={disabled || !settings.ansiEscapeCodes}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">chars</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Lines</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-sm text-muted-foreground mb-3 block">
              When a \n byte is received:
            </Label>
            <RadioGroup
              value={settings.newLineBehavior}
              onValueChange={(value) =>
                updateSetting("newLineBehavior", value as RxSettings["newLineBehavior"])
              }
              disabled={disabled}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="newline-none" />
                <Label htmlFor="newline-none" className="text-sm font-normal cursor-pointer">
                  Don't move the cursor
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="newline" id="newline-newline" />
                <Label htmlFor="newline-newline" className="text-sm font-normal cursor-pointer">
                  Move cursor down one line (new line)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="crlf" id="newline-crlf" />
                <Label htmlFor="newline-crlf" className="text-sm font-normal cursor-pointer">
                  Move cursor to the start of line and then down one line.
                </Label>
              </div>
            </RadioGroup>
            <div className="flex items-center space-x-2 mt-3">
              <Checkbox
                id="swallow-newline"
                checked={settings.swallowNewLine}
                onCheckedChange={(checked) =>
                  updateSetting("swallowNewLine", checked === true)
                }
                disabled={disabled}
              />
              <Label htmlFor="swallow-newline" className="text-sm font-normal cursor-pointer">
                Swallow \n bytes
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Carriage Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-sm text-muted-foreground mb-3 block">
              When a \r byte is received:
            </Label>
            <RadioGroup
              value={settings.carriageReturnBehavior}
              onValueChange={(value) =>
                updateSetting("carriageReturnBehavior", value as RxSettings["carriageReturnBehavior"])
              }
              disabled={disabled}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="cr-none" />
                <Label htmlFor="cr-none" className="text-sm font-normal cursor-pointer">
                  Don't move the cursor
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="start_of_line" id="cr-start" />
                <Label htmlFor="cr-start" className="text-sm font-normal cursor-pointer">
                  Move cursor to the start of the current line
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="start_and_down" id="cr-start-down" />
                <Label htmlFor="cr-start-down" className="text-sm font-normal cursor-pointer">
                  Move cursor to the start and then down one line.
                </Label>
              </div>
            </RadioGroup>
            <div className="flex items-center space-x-2 mt-3">
              <Checkbox
                id="swallow-cr"
                checked={settings.swallowCarriageReturn}
                onCheckedChange={(checked) =>
                  updateSetting("swallowCarriageReturn", checked === true)
                }
                disabled={disabled}
              />
              <Label htmlFor="swallow-cr" className="text-sm font-normal cursor-pointer">
                Swallow \r bytes
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Non-visible Character Display</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="text-sm text-muted-foreground mb-3 block">
            For all received bytes in the range 0x00-0xFF that are not visible ASCII characters AND that are not swallowed above:
          </Label>
          <RadioGroup
            value={settings.nonVisibleDisplay}
            onValueChange={(value) =>
              updateSetting("nonVisibleDisplay", value as RxSettings["nonVisibleDisplay"])
            }
            disabled={disabled}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="swallow" id="nonvisible-swallow" />
              <Label htmlFor="nonvisible-swallow" className="text-sm font-normal cursor-pointer">
                Swallow
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="control_glyphs" id="nonvisible-control" />
              <Label htmlFor="nonvisible-control" className="text-sm font-normal cursor-pointer">
                Convert ASCII control codes to control code glyphs, and all others to hex code glyphs
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hex_glyphs" id="nonvisible-hex" />
              <Label htmlFor="nonvisible-hex" className="text-sm font-normal cursor-pointer">
                Convert all to hex code glyphs
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
