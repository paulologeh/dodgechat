import { fetcher } from 'utils'

const ROOT = `${process.env.APP_URL}/api/relationships`

export class Relationships {
  static getFriends() {
    return fetcher(`${ROOT}/friends`, 'GET')
  }

  static addUser(username: string) {
    return fetcher(`${ROOT}/add/${username}`, 'POST')
  }

  static deleteUser(username: string) {
    return fetcher(`${ROOT}/delete/${username}`, 'DELETE')
  }

  static blockUser(username: string) {
    return fetcher(`${ROOT}/block/${username}`, 'POST')
  }

  static unBlockUser(username: string) {
    return fetcher(`${ROOT}/unblock/${username}`, 'POST')
  }
}
