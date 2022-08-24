import { useContext, useState, useEffect, createContext, FC } from 'react'
import { Auth } from 'services'
import { PageLoading } from 'components'

type currentUserType = {
  aboutMe?: string
  avatarHash?: string
  email?: string
  id?: string
  lastSeen?: Date
  location?: string
  memberSince?: Date
  name?: string
  username?: string
}

const initialUser: currentUserType = {}

const UserContext = createContext({
  loggedIn: false,
  setLoggedIn: (loggedIn: boolean) => {
    loggedIn
  },
  currentUser: initialUser,
  setCurrentUser: (data: currentUserType) => {
    data
  },
})

export function useAuth() {
  return useContext(UserContext)
}

export const UserProvider: FC = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<currentUserType>({})
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  const getUserSession = async () => {
    try {
      const response = await Auth.whoami()
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
