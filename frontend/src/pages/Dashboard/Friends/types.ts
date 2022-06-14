export type friendRequestType = {
  name: string
  username: string
}

export type friendType = {
  name: string
  dateJoined: string
  aboutMe: string
  noOfFriends: number
  avatar: string
}

export type friendsPropType = {
  friendRequests: Array<friendRequestType>
  friends: Array<friendType>
}
