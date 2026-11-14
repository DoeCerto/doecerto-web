export function decodeJwtRole(token?: string | null): string | null {
  if (!token) return null;
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) return null;
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    return typeof decoded?.role === 'string' ? decoded.role.toLowerCase() : null;
  } catch {
    return null;
  }
}

export async function ssrFetchJson<T = unknown>(
  endpoint: string,
  token?: string | null
): Promise<{ status: number; data: T | null }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const res = await fetch(`${apiUrl}${normalizedEndpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: 'no-store',
    });

    const text = await res.text();
    if (!text) {
      return { status: res.status, data: null };
    }

    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }

    if (!res.ok) {
      return { status: res.status, data: null };
    }

    return { status: res.status, data: parsed as T };
  } catch {
    return { status: 0, data: null };
  }
}

