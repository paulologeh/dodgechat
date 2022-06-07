import { Container, Header } from 'semantic-ui-react'
import { useState } from 'react'
import { UserMenu } from './UserMenu'
import { User } from 'services/users'
import { useAuth } from 'contexts/userContext'

type stateType = {
  activeItem: string
  unreadCount: number
}
export const Dashboard = () => {
  const [state, setState] = useState<stateType>({
    activeItem: 'home',
    unreadCount: 0,
  })
  const { setLoggedIn, setCurrentUser } = useAuth()
  const handleMenuChange = (name: string) => {
    setState((prevState) => ({ ...prevState, activeItem: name }))
  }
  const logout = async () => {
    const response = await User.logout()

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
        <Header as="h1">Semantic UI React Fixed Template</Header>
        <p>This is a basic fixed menu template using fixed size containers.</p>
        <p>
          A text container is used for the main container, which is useful for
          single column layouts.
        </p>
      </Container>
    </div>
  )
}
