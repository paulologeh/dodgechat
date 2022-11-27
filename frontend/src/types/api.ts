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

export type UserResult = {
  title: string
  image: string
  description: string
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
