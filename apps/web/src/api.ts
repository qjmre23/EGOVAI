const DEFAULT_MESSAGE = 'The demonstration service is unavailable. Please try again.';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: init?.body
      ? { 'Content-Type': 'application/json', ...(init.headers ?? {}) }
      : init?.headers,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(body?.error ?? DEFAULT_MESSAGE, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
