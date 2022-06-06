import { Input, Image, Icon, Container, Label, Menu } from 'semantic-ui-react'
import logo from 'assets/logo.png'

type propTypes = {
  activeItem: string
  handleMenuChange: (name: string) => void
  unreadCount: number
}

export const UserMenu = ({
  activeItem,
  handleMenuChange,
  unreadCount,
}: propTypes) => {
  return (
    <Menu fixed="top" inverted borderless>
      <Container>
        <Menu.Item as="a" header>
          <Image
            size="mini"
            src={logo}
            alt="dodgechat"
            style={{ marginRight: '1.5em' }}
          />
          Dodgechat
        </Menu.Item>
        <Menu.Item
          active={activeItem === 'home'}
          onClick={() => handleMenuChange('home')}
        >
          <Icon name="home" />
          Home
        </Menu.Item>
        <Menu.Item
          active={activeItem === 'messages'}
          onClick={() => handleMenuChange('messages')}
        >
          <Icon name="mail" />
          Messages
          {unreadCount > 0 && <Label size="tiny">{unreadCount}</Label>}
        </Menu.Item>
        <Menu.Item
          active={activeItem === 'friends'}
          onClick={() => handleMenuChange('friends')}
        >
          <Icon name="users" />
          Friends
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item onClick={() => handleMenuChange('search')}>
            <Input icon="search" placeholder="Search..." />
          </Menu.Item>
          <Menu.Item
            icon="user outline"
            active={activeItem === 'profile'}
            content={''}
            onClick={() => handleMenuChange('profile')}
          />
          <Menu.Item
            active={activeItem === 'logout'}
            content={'Logout'}
            onClick={() => handleMenuChange('logout')}
          />
        </Menu.Menu>
      </Container>
    </Menu>
  )
}
