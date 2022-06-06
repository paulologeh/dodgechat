import { Container, Header } from 'semantic-ui-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { UserMenu } from './UserMenu'
import { User } from 'services/users'

type stateType = {
  activeItem: string
  unreadCount: number
}
export const Dashboard = () => {
  const [state, setState] = useState<stateType>({
    activeItem: 'home',
    unreadCount: 0,
  })
  const navigate = useNavigate()
  const handleMenuChange = (name: string) => {
    setState((prevState) => ({ ...prevState, activeItem: name }))
    switch (name) {
      case 'logout':
        logout()
        break
      default:
        break
    }
  }
  const logout = async () => {
    const response = await User.logout()

    if (response.status !== 200) {
      alert('Failed to logout')
      const jsonValue = await response.json()
      console.error(jsonValue)
      return
    }

    console.log('navigating out')
    navigate('../login', { replace: true })
  }

  return (
    <div>
      <UserMenu
        activeItem={state.activeItem}
        unreadCount={state.unreadCount}
        handleMenuChange={handleMenuChange}
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
