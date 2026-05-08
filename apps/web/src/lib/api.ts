export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message?: string,
  ) {
    super(message ?? `${status} ${statusText}`)
    this.name = 'ApiError'
  }
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${import.meta.env.VITE_API_URL}${path}`
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
  })
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText)
  }
  return response
}
