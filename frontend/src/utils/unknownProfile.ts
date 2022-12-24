import { FriendMinimal } from 'types/api'

export const unknownProfile: FriendMinimal = {
  id: Date.now() * -1,
  lastSeen: new Date('1970-01-01'),
  name: 'Unknown',
  username: 'unknown',
  gravatar: '',
  location: '',
  aboutMe: '',
}
