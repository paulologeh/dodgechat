import { useContext, useState, useEffect, createContext, FC } from 'react'
import { Auth } from 'services'
import { Loader, Dimmer } from 'semantic-ui-react'

const UserContext = createContext({
  loggedIn: false,
  setLoggedIn: (loggedIn: boolean) => {
    loggedIn
  },
  currentUser: {},
  setCurrentUser: (data: unknown) => {
    data
  },
})

export function useAuth() {
  return useContext(UserContext)
}

export const UserProvider: FC = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<unknown>({})
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
    getUserSession()
  }, [])

  const value = { currentUser, setCurrentUser, loggedIn, setLoggedIn }

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
      {loading && (
        <Dimmer active>
          <Loader />
        </Dimmer>
      )}
    </UserContext.Provider>
  )
}
