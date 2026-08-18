export const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')

export const request = async (path, { token, headers, ...options } = {}) => {
  const response = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })
  const data = await response.json().catch(() => ({ success: false, message: 'Invalid server response' }))
  if (!response.ok || !data.success) throw new Error(data.message || 'Request failed')
  return data
}
