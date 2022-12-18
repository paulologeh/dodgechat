export const validateEmail = (email: string) => {
  return /^\w+(-?\w+)*@\w+(-?\w+)*(\.\w{2,3})+$/.test(email)
}

const environment = process.env.ENVIRONMENT

export const fetcher = async (
  url: string,
  method: string,
  body: unknown = null
) => {
  if (environment === 'DEVELOPMENT') {
    await delay(1000)
  }

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

const robotEmails = [
  'stephen.little@example.com',
  'oya.yildizoglu@example.com',
  'alma.poulsen@example.com',
  'eren.turkdogan@example.com',
  'veeti.nurmi@example.com',
  'zlatomira.romenskiy@example.com',
  'umut.yetkiner@example.com',
]

export const getGravatarUrl = (
  avatarHash: string,
  email: string,
  size: number
) => {
  const isRobohash = email && robotEmails.includes(email)
  const d = isRobohash ? 'robohash' : 'identicon'
  const r = isRobohash ? 'x' : 'g'
  return `https://secure.gravatar.com/avatar/${avatarHash}?s=${size}&d=${d}&r=${r}`
}

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

export const removedFriend = {
  id: 0,
  lastSeen: '1970-01-01',
  name: 'Unknown',
  username: 'unknow',
}
