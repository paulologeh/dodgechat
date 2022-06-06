import { fetcher } from 'utils'

type registerType = {
  email: string
  username: string
  password: string
  name?: string
  location?: string
  aboutMe?: string
}

const AUTH_ROUTE = `${process.env.API_URI}/api/auth`

export class User {
  static whoami() {
    return fetcher(`${AUTH_ROUTE}/whoami`, 'GET')
  }

  static login(emailOrUsername: string, password: string) {
    return fetcher(`${AUTH_ROUTE}/login`, 'POST', {
      emailOrUsername,
      password,
    })
  }

  static delete(password: string) {
    return fetcher(`${AUTH_ROUTE}/delete`, 'POST', { password })
  }

  static register(user: registerType) {
    return fetcher(`${AUTH_ROUTE}/register`, 'POST', user)
  }
  static logout() {
    return fetcher(`${AUTH_ROUTE}/logout`, 'POST')
  }

  static resendConfirmation() {
    return fetcher(`${AUTH_ROUTE}/confirm`, 'POST')
  }

  static confirm(token: string) {
    return fetcher(`${AUTH_ROUTE}/confirm/${token}`, 'POST')
  }

  static changePassword(
    oldPassword: string,
    password: string,
    confirmPassword: string
  ) {
    return fetcher(`${AUTH_ROUTE}/change-password`, 'POST', {
      oldPassword,
      password,
      confirmPassword,
    })
  }

  static passwordResetRequest(email: string) {
    return fetcher(`${AUTH_ROUTE}/reset`, 'POST', {
      email,
    })
  }

  static passwordReset(password: string, token: string) {
    return fetcher(`${AUTH_ROUTE}/reset/${token}`, 'POST', { password })
  }

  static changeEmailRequest(email: string, password: string) {
    return fetcher(`${AUTH_ROUTE}/change_email`, 'POST', {
      email,
      password,
    })
  }

  static changeEmail(token: string) {
    return fetcher(`${AUTH_ROUTE}/change_email/${token}`, 'POST')
  }
}
