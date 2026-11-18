const API = 'http://localhost:3000/api';

export async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));

  // An expired or invalid token: clear the saved login and go back to the login screen
  if (res.status === 401 && token) {
    localStorage.removeItem('session');
    window.location.reload();
  }

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}