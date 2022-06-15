import { fetcher } from 'utils'

const ROOT = `${process.env.API_URI}/api/relationships`

export class Relationships {
  static getFriends() {
    return fetcher(`${ROOT}/friends`, 'GET')
  }

  static addUser(username: string) {
    return fetcher(`${ROOT}/add/${username}`, 'POST')
  }
}
