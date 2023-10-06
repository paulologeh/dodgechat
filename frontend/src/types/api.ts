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
  id?: number
}

export type UserUpdate = {
  name?: string
  username?: string
  avatarHash?: string
  location?: string
  aboutMe?: string
}

export type Message = {
  id: string
  senderId: number
  body: string
  read: Date | null
  createdAt: Date
}
export type Conversation = {
  id: string | null
  senderId: number
  recipientId: number
  messages: Message[]
  bottomMessage?: Message
}
