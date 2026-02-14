export function getAuthHeaders(): HeadersInit {
  const userId = localStorage.getItem('userId') || 'default';
  return {
    'X-User-Id': userId
  };
}

export function getUserId(): string {
  return localStorage.getItem('userId') || 'default';
}
