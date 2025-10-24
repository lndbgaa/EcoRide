type DetailValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | boolean[]
  | Record<string, string | number | boolean>;

export type ErrorDetails = Record<string, DetailValue>;

export interface AppErrorOptions {
  statusCode?: number;
  statusText?: string;
  userMessage?: string;
  debugMessage?: string;
  code?: string;
  details?: ErrorDetails;
  isOperational?: boolean;
}

export interface ParsedJoiErrorItem {
  index?: number;
  field: string;
  message: string;
}
