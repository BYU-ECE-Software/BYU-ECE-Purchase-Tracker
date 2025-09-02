const API = import.meta.env.VITE_API_URL || '';

export async function adminCheck(): Promise<boolean> {
  const res = await fetch(`${API}/auth/admin-check`, {
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({ authed: false }));
  return !!data.authed;
}

export async function adminLogin(password: string): Promise<boolean> {
  const res = await fetch(`${API}/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // ← important: send cookie
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

export async function adminLogout(): Promise<void> {
  await fetch(`${API}/auth/admin-logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
