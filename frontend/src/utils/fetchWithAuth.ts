/**
 * Wrapper around fetch that automatically includes the JWT token from localStorage.
 * Use this for all authenticated API calls from client components.
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("saf_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
