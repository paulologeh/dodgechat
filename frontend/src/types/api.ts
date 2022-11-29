type RelationshipState =
  | 'ACCEPTED'
  | 'REQUESTED'
  | 'REQUESTEE'
  | 'BLOCKED'
  | null

export type UserProfile = {
  name: string
  username: string
  location: string
  gravatar: string
  aboutMe: string
  lastSeen: Date
  memberSince: Date
  numberOfFriends: number
  relationshipState: RelationshipState
}
export type FriendMinimal = {
  username: string
  name: string
  location: string
  aboutMe: string
  gravatar: string
  memberSince?: Date
  lastSeen?: Date
}

export type UserUpdate = {
  name?: string
  username?: string
  avatarHash?: string
  location?: string
  aboutMe?: string
}
