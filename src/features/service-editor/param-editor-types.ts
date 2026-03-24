/* ── Shared types for param editor sub-modules ─────────────── */

/** Emit configuration shape (matches authoring schema) */
export interface EmitDraft {
  arg?: string;
  flag?: string;
  flagTrue?: string;
  flagFalse?: string;
  env?: string;
  pos?: number;
  file?: {
    pathTemplate?: string;
    format?: string;
    encoding?: string;
  };
  stdin?: {
    format?: string;
    encoding?: string;
  };
  mode?: string;
  separator?: string;
  emitIf?: string;
}

/** Enum option shape */
export interface EnumOption {
  value: string;
  label: string;
}

/** UI hints shape */
export interface UIDraft {
  widget?: string;
  grid?: {
    colSpan?: Record<string, number>;
  };
  placeholder?: string;
  description?: string;
}

/** Validation shape */
export interface ValidationDraft {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternError?: string;
}

/** Condition shape */
export interface ConditionDraft {
  when?: string;
  eq?: unknown;
  neq?: unknown;
  in?: unknown[];
  operator?: string;
}

/** Param items (for list type) */
export interface ParamItemDraft {
  key: string;
  type: string;
  label: string;
}

/** Single param draft — all fields optional except key/type */
export interface ParamDraft {
  key: string;
  type: string;
  label?: string;
  required?: boolean;
  secret?: boolean;
  default?: unknown;
  options?: EnumOption[];
  items?: ParamItemDraft;
  properties?: ParamDraft[];
  emit?: EmitDraft;
  ui?: UIDraft;
  validation?: ValidationDraft;
  conditions?: ConditionDraft[];
}

/** Source configuration shape */
export interface SourceDraft {
  type: string;
  repo?: string;
  assetPattern?: string;
  tag?: string;
  extractPath?: string;
  strip?: number;
  url?: string;
  arch?: Record<string, string>;
  packageName?: string;
}

/** Exec configuration shape */
export interface ExecDraft {
  bin: string;
  baseArgs: string[];
  workingDir?: string;
  timeoutSeconds?: number;
  source?: SourceDraft;
}

/** The top-level contract / service definition draft */
export interface ContractDraft {
  schemaVersion?: string;
  contractKey?: string;
  version?: number;
  title?: string;
  description?: string;
  requiresPort?: boolean;
  exec?: ExecDraft;
  ui?: Record<string, unknown>;
  params?: ParamDraft[];
}

/** Emit preset kind */
export type EmitPresetKind =
  | "arg"
  | "flag"
  | "flagTrue"
  | "env"
  | "pos"
  | "file"
  | "stdin";

/** Common props for param sub-editors */
export interface ParamEditorProps {
  param: ParamDraft;
  onChange: (fn: (param: ParamDraft, draft?: ContractDraft) => void) => void;
}
