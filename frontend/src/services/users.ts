import { fetcher } from 'utils'

type userSignUp = {
  email: string
  username: string
  password: string
  name?: string
  location?: string
  aboutMe?: string
}

type userLogin = {
  email: string
  password: string
}

export class User {
  static whoami() {
    return fetcher(`${process.env.API_URI}/api/auth/whoami`, 'GET')
  }

  static login(data: userLogin) {
    return fetcher(`${process.env.API_URI}/api/auth/login`, 'POST', data)
  }

  static signup(user: userSignUp) {
    return fetcher(`${process.env.API_URI}/api/auth/register`, 'POST', user)
  }
  static logout() {
    return fetcher(`${process.env.API_URI}/api/auth/logout`, 'POST')
  }

  static forgotPassword(email: string) {
    return fetcher(`${process.env.API_URI}/api/auth/forgotpassword`, 'POST', {
      email,
    })
  }

  static async resetPassword(password: string, token: string, uuid: string) {
    return await fetcher(
      `${process.env.API_URI}/api/auth/resetpassword/${uuid}?token=${token}`,
      'POST',
      { password }
    )
  }
}
