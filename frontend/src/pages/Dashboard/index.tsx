import { Container } from 'semantic-ui-react'
import { useState } from 'react'
import { UserMenu } from './UserMenu'
import { HomeFeed } from './HomeFeed'
import { Friends } from './Friends'
import { Auth } from 'services'
import { useAuth } from 'contexts/userContext'

type stateType = {
  activeItem: string
  unreadCount: number
}
export const Dashboard = () => {
  const [state, setState] = useState<stateType>({
    activeItem: 'friends',
    unreadCount: 0,
  })
  const { setLoggedIn, setCurrentUser } = useAuth()
  const handleMenuChange = (name: string) => {
    setState((prevState) => ({ ...prevState, activeItem: name }))
  }
  const logout = async () => {
    const response = await Auth.logout()

    if (response.status !== 200) {
      alert('Failed to logout')
      const jsonValue = await response.json()
      console.error(jsonValue)
      return
    }

    setLoggedIn(false)
    setCurrentUser({})
  }

  return (
    <div>
      <UserMenu
        activeItem={state.activeItem}
        unreadCount={state.unreadCount}
        handleMenuChange={handleMenuChange}
        logout={logout}
      />
      <Container text style={{ marginTop: '7em' }}>
        {state.activeItem === 'home' && <HomeFeed />}
        {state.activeItem === 'friends' && <Friends />}
      </Container>
    </div>
  )
}
