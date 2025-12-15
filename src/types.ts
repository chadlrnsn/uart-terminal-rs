export interface PortInfo {
  name: string;
  description?: string;
  vid?: number;
  pid?: number;
}

export interface PortSettings {
  baud_rate: number;
  data_bits: number;
  stop_bits: number;
  parity: string;
  flow_control: string;
  timeout_ms: number;
  rts?: boolean;
  cts?: boolean;
  dtr?: boolean;
  dsr?: boolean;
  dcd?: boolean;
}

export interface ErrorResponse {
  error: string;
}

export interface TxSettings {
  enterKey: "lf" | "cr" | "crlf" | "break";
  backspaceKey: "backspace" | "delete";
  deleteKey: "backspace" | "delete" | "vt_sequence";
  ctrlKeys: boolean;
  altKeys: boolean;
}

export interface RxSettings {
  dataType: "ascii" | "number";
  ansiEscapeCodes: boolean;
  maxEscapeCodeLength: number;
  localTxEcho: boolean;
  newLineBehavior: "none" | "newline" | "crlf";
  swallowNewLine: boolean;
  carriageReturnBehavior: "none" | "start_of_line" | "start_and_down";
  swallowCarriageReturn: boolean;
  nonVisibleDisplay: "swallow" | "control_glyphs" | "hex_glyphs";
}

