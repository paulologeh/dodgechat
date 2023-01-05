import { fetcher } from 'utils'
import { UserUpdate } from 'types/api'

type NewUser = {
  email: string
  username: string
  password: string
  name?: string
  location?: string
  aboutMe?: string
}

const USERS_ROUTE = `${process.env.API_URI}/api/users`

export class Users {
  static whoami() {
    return fetcher(`${USERS_ROUTE}/whoami`, 'GET')
  }

  static login(emailOrUsername: string, password: string, remember: boolean) {
    return fetcher(`${USERS_ROUTE}/login`, 'POST', {
      emailOrUsername,
      password,
      remember,
    })
  }

  static delete(password: string) {
    return fetcher(`${USERS_ROUTE}/delete`, 'DELETE', { password })
  }

  static register(user: NewUser) {
    return fetcher(`${USERS_ROUTE}/register`, 'POST', user)
  }

  static update(userUpdate: UserUpdate) {
    return fetcher(`${USERS_ROUTE}/update`, 'PATCH', userUpdate)
  }

  static logout() {
    return fetcher(`${USERS_ROUTE}/logout`, 'POST')
  }

  static resendConfirmation() {
    return fetcher(`${USERS_ROUTE}/confirm`, 'POST')
  }

  static confirm(token: string) {
    return fetcher(`${USERS_ROUTE}/confirm/${token}`, 'POST')
  }

  static changePassword(
    oldPassword: string,
    password: string,
    confirmPassword: string
  ) {
    return fetcher(`${USERS_ROUTE}/change-password`, 'POST', {
      oldPassword,
      password,
      confirmPassword,
    })
  }

  static forgotpassword(email: string) {
    return fetcher(`${USERS_ROUTE}/reset`, 'POST', {
      email,
    })
  }

  static passwordReset(password: string, token: string) {
    return fetcher(`${USERS_ROUTE}/reset/${token}`, 'POST', { password })
  }

  static changeEmailRequest(email: string, password: string) {
    return fetcher(`${USERS_ROUTE}/change_email`, 'POST', {
      email,
      password,
    })
  }

  static changeEmail(token: string) {
    return fetcher(`${USERS_ROUTE}/change_email/${token}`, 'POST')
  }
}
