import { Container, Loader, Dimmer } from 'semantic-ui-react'
import { useState } from 'react'
import { UserMenu } from './UserMenu'
import { HomeFeed } from './HomeFeed'
import { Friends } from './Friends'
import { Messages } from './Messages'
import { Auth } from 'services'
import { useAuth } from 'contexts/userContext'

type stateType = {
  activeItem: string
  unreadCount: number
  friendRequests: number
  loading: boolean
}
export const Dashboard = () => {
  const [state, setState] = useState<stateType>({
    activeItem: 'friends',
    unreadCount: 0,
    friendRequests: 0,
    loading: false,
  })
  const { setLoggedIn, setCurrentUser } = useAuth()
  const handleMenuChange = (name: string) => {
    setState((prevState) => ({ ...prevState, activeItem: name }))
  }
  const logout = async () => {
    setState({ ...state, loading: true })
    const response = await Auth.logout()

    if (response.status !== 200) {
      alert('Failed to logout')
      const jsonValue = await response.json()
      console.error(jsonValue)
      return
    }
    setLoggedIn(false)
    setCurrentUser({})
    setState({ ...state, loading: false })
  }

  return (
    <div>
      <Dimmer active={state.loading}>
        <Loader>Logging out</Loader>
      </Dimmer>
      <UserMenu
        activeItem={state.activeItem}
        unreadCount={state.unreadCount}
        handleMenuChange={handleMenuChange}
        logout={logout}
        friendRequests={state.friendRequests}
      />
      <Container text style={{ marginTop: '7em' }}>
        {state.activeItem === 'home' && <HomeFeed />}
        {state.activeItem === 'friends' && <Friends />}
        {state.activeItem === 'messages' && <Messages />}
      </Container>
    </div>
  )
}
