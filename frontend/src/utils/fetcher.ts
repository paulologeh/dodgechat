export const fetcher = async (
  url: string,
  method: string,
  body: unknown = null
) => {
  if (!body) {
    return fetch(url, {
      method: method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  return fetch(url, {
    method: method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}
