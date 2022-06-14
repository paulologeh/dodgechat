import { Container, Loader, Dimmer } from 'semantic-ui-react'
import { useState } from 'react'
import { UserMenu } from './UserMenu'
import { HomeFeed } from './HomeFeed'
import { Friends } from './Friends'
import { Messages } from './Messages'
import { Auth } from 'services'
import { useAuth } from 'contexts/userContext'
import { friendRequestsData, friendsData } from './Friends/sampledata'
import { friendRequestType, friendType } from './Friends/types'

type stateType = {
  activeItem: string
  unreadCount: number
  friendRequestsCount: number
  loading: boolean
  friendRequests: Array<friendRequestType>
  friends: Array<friendType>
}

type updateStateValues =
  | string
  | number
  | boolean
  | Array<friendRequestType>
  | Array<friendType>

export const Dashboard = () => {
  const [state, setState] = useState<stateType>({
    activeItem: 'friends',
    unreadCount: 0,
    friendRequestsCount: 0,
    loading: false,
    friendRequests: friendRequestsData,
    friends: friendsData,
  })

  const updateState = (key: string, value: updateStateValues) => {
    setState((prevState) => ({ ...prevState, [key]: value }))
  }
  const { setLoggedIn, setCurrentUser } = useAuth()
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
        updateState={updateState}
        logout={logout}
        friendRequestsCount={state.friendRequestsCount}
      />
      <Container text style={{ marginTop: '7em' }}>
        {state.activeItem === 'home' && <HomeFeed />}
        {state.activeItem === 'friends' && (
          <Friends
            friendRequests={state.friendRequests}
            friends={state.friends}
          />
        )}
        {state.activeItem === 'messages' && <Messages />}
      </Container>
    </div>
  )
}
