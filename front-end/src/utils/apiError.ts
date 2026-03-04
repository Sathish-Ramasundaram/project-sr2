export function formatBackendError(error: unknown, context: string): string {
  if (error instanceof Error) {
    const message = error.message.trim();
    const normalized = message.toLowerCase();

    if (
      normalized.includes("failed to fetch") ||
      normalized.includes("networkerror") ||
      normalized.includes("load failed") ||
      normalized.includes("fetch failed")
    ) {
      return `Failed to fetch ${context}. Start backend Docker services and try again.`;
    }

    return `Failed to load ${context}: ${message}`;
  }

  return `Failed to load ${context}. Start backend Docker services and try again.`;
}
