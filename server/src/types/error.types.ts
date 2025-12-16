type DetailValue = string | number | boolean | null | string[] | number[] | boolean[] | Record<string, string | number | boolean>;

export type ErrorDetails = Record<string, DetailValue>;

export interface AppErrorOptions {
  statusCode?: number;
  statusText?: string;
  userMessageKey?: string;
  userMessageParams?: Record<string, any>;
  debugMessage?: string;
  code?: string;
  debugCode?: string;
  isOperational?: boolean;
}

export interface ParsedJoiErrorItem {
  index?: number;
  field: string;
  message: string;
}
