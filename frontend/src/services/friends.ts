import { fetcher } from 'utils'

const FRIEND_ROUTE = `${process.env.API_URI}/api/friend`

export class Friend {
  static getFriends() {
    return fetcher(`${FRIEND_ROUTE}/friends`, 'GET')
  }

  static addFriend(username: string) {
    return fetcher(`${FRIEND_ROUTE}/add/${username}`, 'POST')
  }
}
