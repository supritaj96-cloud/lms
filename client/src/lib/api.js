const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim()

// Use the local API only during development.  A deployed client must be given
// the deployed API URL (for example https://your-api.vercel.app) so it never
// attempts to call the visitor's own localhost.
export const backendUrl = (configuredBackendUrl || (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/$/, '')

export const request = async (path, { token, headers, ...options } = {}) => {
  if (!backendUrl) {
    throw new Error('Backend is not configured. Set VITE_BACKEND_URL to your deployed API URL in Vercel and redeploy.')
  }

  let response
  try {
    response = await fetch(`${backendUrl}${path}`, {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    })
  } catch {
    throw new Error('Unable to reach the server. Check VITE_BACKEND_URL and the API deployment.')
  }
  const data = await response.json().catch(() => ({ success: false, message: 'Invalid server response' }))
  if (!response.ok || !data.success) throw new Error(data.message || 'Request failed')
  return data
}
