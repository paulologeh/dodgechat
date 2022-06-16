type relationshipStateType =
  | 'FRIEND'
  | 'FRIEND_REQUEST_SENT'
  | 'FRIEND_REQUEST_RECEIVED'
  | 'BLOCKED'
  | null

export type userProfileType = {
  name: string
  username: string
  location: string
  gravatar: string
  aboutMe: string
  lastSeen: Date
  memberSince: Date
  numberOfFriends: number
  relationshipState: relationshipStateType
}
