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

export type searchResultShape = {
  title: string
  image: string
  description: string
}

type userResult = {
  name: string
  results: Array<searchResultShape>
}

export type searchResultsType = {
  users: userResult
}

export type friendMinimalType = {
  username: string
  name: string
  location: string
  aboutMe: string
  gravatar: string
  memberSince?: Date
  lastSeen?: Date
}
