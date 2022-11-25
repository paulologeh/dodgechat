export const validateEmail = (email: string) => {
  return /^\w+(-?\w+)*@\w+(-?\w+)*(\.\w{2,3})+$/.test(email)
}

export const fetcher = (url: string, method: string, body: unknown = null) => {
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

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const gravatarUrl = 'https://secure.gravatar.com/avatar'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const months: any = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December',
}

export const getLastSeen = (date: Date) => {
  const datetime = new Date(date)
  const now = new Date()
  const diff = now.getTime() - datetime.getTime()
  if (diff <= 600000) {
    // 10 minutes
    return 'Now'
  } else if (diff <= 86400000) {
    const time = Math.round(diff / 3600000)
    if (time === 1) {
      return `${time} hour ago`
    }
    return `${time} hours ago`
  } else {
    return 'Over a day ago'
  }
}
