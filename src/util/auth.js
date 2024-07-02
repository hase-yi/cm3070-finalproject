// util/auth.js
export async function refreshToken() {
  const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
    method: 'POST',
    credentials: 'include', // Include cookies in the request
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }
}

export async function fetchWithAuth(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies in the request
  });

  if (response.status === 401) {
    await refreshToken();
    response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies in the request
    });
  }

  return response;
}
