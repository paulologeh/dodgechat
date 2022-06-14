import {
  Input,
  Image,
  Dropdown,
  Icon,
  Container,
  Label,
  Menu,
} from 'semantic-ui-react'
import logo from 'assets/logo.png'

type propTypes = {
  activeItem: string
  handleMenuChange: (name: string) => void
  unreadCount: number
  logout: () => void
  friendRequests: number
}

export const UserMenu = ({
  activeItem,
  handleMenuChange,
  unreadCount,
  logout,
  friendRequests,
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
          {friendRequests > 0 && <Label size="tiny">{friendRequests}</Label>}
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item>
            <Input icon="search" placeholder="Search..." />
          </Menu.Item>
          <Dropdown item icon="user outline">
            <Dropdown.Menu>
              <Dropdown.Item>Profile</Dropdown.Item>
              <Dropdown.Item>Settings</Dropdown.Item>
              <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Menu>
      </Container>
    </Menu>
  )
}
