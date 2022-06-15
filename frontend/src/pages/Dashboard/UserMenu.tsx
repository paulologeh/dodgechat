import {
  Image,
  Dropdown,
  Icon,
  Container,
  Label,
  Menu,
  Search,
} from 'semantic-ui-react'
import logo from 'assets/logo.png'
import _ from 'lodash'
import { Search as SearchService } from 'services/search'
import { searchResultsType, updateStateValues } from './index'
import { friendMinimalType } from './Friends/types'

export type searchResultShape = {
  title: string
  image: string
  description: string
}

type propTypes = {
  activeItem: string
  updateState: (key: string, value: updateStateValues) => void
  unreadCount: number
  logout: () => void
  friendRequestsCount: number
  isSearching: boolean
  searchValue: string
  searchResults: searchResultsType
}

export const UserMenu = ({
  activeItem,
  updateState,
  unreadCount,
  logout,
  friendRequestsCount,
  isSearching,
  searchValue,
  searchResults,
}: propTypes) => {
  const handleResultSelect = async (
    _e: unknown,
    data: { result: { description: string } }
  ) => {
    try {
      updateState('loading', true)
      const result = await SearchService.searchUser(data.result.description)
      const response = await result.json()
      if (result.status === 200) {
        updateState('openUserProfileModal', true)
        updateState('selectedUserProfile', response)
      } else {
        updateState('modalError', response.message)
        updateState('openErrorModal', true)
      }
      updateState('loading', false)
    } catch (error) {
      console.error(error)
      updateState('modalError', 'Server error. please try again ')
      updateState('openErrorModal', true)
      updateState('loading', false)
    }
  }

  const handleSearchChange = async (
    _e: unknown,
    { value }: { value: string }
  ) => {
    updateState('searchValue', value)
    const response = await SearchService.searchAll(value)
    if (response.status === 200) {
      const result = await response.json()
      const toTransform = result.users.results
      result.users.results = toTransform.map((item: friendMinimalType) => ({
        title: item.name,
        description: item.username,
        image: item.gravatar,
      }))
      updateState('searchResults', result)
    } else {
      updateState('searchResults', {
        users: {
          name: 'users',
          results: [],
        },
      })
    }
  }

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
          onClick={() => updateState('activeItem', 'home')}
        >
          <Icon name="home" />
          Home
        </Menu.Item>
        <Menu.Item
          active={activeItem === 'messages'}
          onClick={() => updateState('activeItem', 'messages')}
        >
          <Icon name="mail" />
          Messages
          {unreadCount > 0 && <Label size="tiny">{unreadCount}</Label>}
        </Menu.Item>
        <Menu.Item
          active={activeItem === 'friends'}
          onClick={() => updateState('activeItem', 'friends')}
        >
          <Icon name="users" />
          Friends
          {friendRequestsCount > 0 && (
            <Label size="tiny">{friendRequestsCount}</Label>
          )}
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item>
            <Search
              category
              loading={isSearching}
              onResultSelect={handleResultSelect}
              onSearchChange={_.debounce(handleSearchChange, 500, {
                leading: true,
              })}
              results={searchResults}
              value={searchValue}
            />
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
