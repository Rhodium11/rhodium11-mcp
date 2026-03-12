/** Custom error class for Rhodium11 API errors. */
export class RH11ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "RH11ApiError";
  }
}

/** Format an RH11ApiError (or unknown error) into a human-readable string. */
export function formatError(error: unknown): string {
  if (error instanceof RH11ApiError) {
    return `API Error [${error.code}] (${error.statusCode}): ${error.message}`;
  }
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return `Unknown error: ${String(error)}`;
}
