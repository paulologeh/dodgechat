import { createContext, FC, useContext, useEffect, useState } from 'react'
import { Users } from 'api'
import { PageLoading } from 'components/common'

export type CurrentUser = {
  aboutMe?: string
  avatarHash?: string
  email?: string
  id?: number
  lastSeen?: Date
  location?: string
  memberSince?: Date
  name?: string
  username?: string
}

const initialUser: CurrentUser = {}

const UserContext = createContext({
  loggedIn: false,
  setLoggedIn: (loggedIn: boolean) => {
    loggedIn
  },
  currentUser: initialUser,
  setCurrentUser: (data: CurrentUser) => {
    data
  },
})

export function useUser() {
  return useContext(UserContext)
}

export const UserProvider: FC = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>({})
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  const getUserSession = async () => {
    try {
      const response = await Users.whoami()
      if (response.status === 200) {
        const userData = await response.json()
        setCurrentUser(userData)
        setLoggedIn(true)
      }
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    getUserSession().catch(console.error)
  }, [])

  const value = { currentUser, setCurrentUser, loggedIn, setLoggedIn }

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
      {loading && <PageLoading />}
    </UserContext.Provider>
  )
}
