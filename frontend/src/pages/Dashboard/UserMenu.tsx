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
import { debounce } from 'lodash'
import { Search as SearchService } from 'services/search'
import { searchResultsType, updateStateValues } from './index'
import { friendMinimalType } from './Friends/types'
import { SyntheticEvent, useMemo, useEffect } from 'react'

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
  searchResults: searchResultsType | Array<never>
  searchError: string
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
  searchError,
}: propTypes) => {
  const handleResultSelect = async (
    _e: SyntheticEvent,
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

  const search = async (term: string) => {
    try {
      const response = await SearchService.searchAll(term)
      const result = await response.json()
      if (response.status !== 200) {
        updateState('searchResults', [])
        updateState('searchError', result.message)
        updateState('isSearching', false)
      } else {
        const userResults = result.users.results
        if (userResults.length === 0) {
          updateState('searchResults', [])
        } else {
          result.users.results = userResults.map((item: friendMinimalType) => ({
            title: item.username,
            description: item.name,
            image: item.gravatar,
          }))
          updateState('searchResults', result)
        }
        updateState('isSearching', false)
      }
    } catch (error) {
      console.error(error)
      updateState('searchResults', [])
      updateState('searchError', 'Server error. Please try again')
      updateState('isSearching', false)
    }
  }

  const handleSearchChange = async (
    _e: SyntheticEvent,
    { value }: { value?: string | undefined }
  ) => {
    value = value || ''
    updateState('searchValue', value)
    if (value === '') return updateState('isSearching', false)
    debouncedSearch(value)
    updateState('isSearching', true)
  }

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const debouncedSearch = useMemo(() => {
    return debounce(
      (term) => {
        search(term)
      },
      1000,
      { trailing: true }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
              onSearchChange={handleSearchChange}
              results={searchResults}
              value={searchValue}
              showNoResults={!isSearching}
              noResultsMessage={searchError || 'No results found'}
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
