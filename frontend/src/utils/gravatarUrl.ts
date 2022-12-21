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
