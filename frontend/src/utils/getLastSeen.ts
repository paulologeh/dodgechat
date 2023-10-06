export const getLastSeen = (date: Date) => {
  const datetime = new Date(date)
  const now = new Date()
  const diff = now.getTime() - datetime.getTime()
  if (diff <= 600000) {
    // Less than 10 minutes
    return 'Now'
  } else if (diff <= 3600000) {
    // Less than 1 hour
    const minutes = Math.round(diff / 60000)
    return `${minutes} minutes ago`
  } else if (diff === 3600000) {
    // equal to 1 hour
    return '1 hour ago'
  } else if (diff <= 86400000) {
    // less than a day
    const time = Math.floor(diff / 3600000)
    return `${time} hours ago`
  } else {
    return 'Over a day ago'
  }
}
