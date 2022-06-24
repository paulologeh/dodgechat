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
import { dashboardStateType } from 'pages/Dashboard/index'
import { friendMinimalType, searchResultsType } from 'types/apiTypes'
import {
  SyntheticEvent,
  useMemo,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react'

type propTypes = {
  activeItem: string
  unreadCount: number
  setState: Dispatch<SetStateAction<dashboardStateType>>
  logout: () => void
  friendRequestsCount: number
  isSearching: boolean
  searchValue: string
  searchResults: searchResultsType | Array<never>
  searchError: string
}

export const UserMenu = ({
  activeItem,
  setState,
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
    data: { result: { title: string } }
  ) => {
    try {
      setState((prevState) => ({
        ...prevState,
        loading: true,
        loadingMessage: 'Fetching user',
      }))
      const result = await SearchService.searchUser(data.result.title)
      const response = await result.json()
      if (result.status === 200) {
        setState((prevState) => ({
          ...prevState,
          openUserProfileModal: true,
          selectedUserProfile: response,
          loading: false,
        }))
      } else {
        setState((prevState) => ({
          ...prevState,
          modalError: response.message,
          openErrorModal: true,
          loading: false,
        }))
      }
    } catch (error) {
      console.error(error)
      setState((prevState) => ({
        ...prevState,
        modalError: 'Server error. please try again',
        openErrorModal: true,
        loading: false,
        loadingMessage: '',
      }))
    }
  }

  const search = async (term: string) => {
    try {
      const response = await SearchService.searchAll(term)
      const result = await response.json()
      if (response.status !== 200) {
        setState((prevState) => ({
          ...prevState,
          searchResults: [],
          searchError: result.message,
          isSearching: false,
        }))
      } else {
        const userResults = result.users.results
        if (userResults.length === 0) {
          setState((prevState) => ({
            ...prevState,
            searchResults: [],
            isSearching: false,
          }))
        } else {
          result.users.results = userResults.map((item: friendMinimalType) => ({
            title: item.username,
            description: item.name,
            image: item.gravatar,
          }))
          setState((prevState) => ({
            ...prevState,
            searchResults: result,
            isSearching: false,
          }))
        }
      }
    } catch (error) {
      console.error(error)
      setState((prevState) => ({
        ...prevState,
        searchResults: [],
        isSearching: false,
        searchError: 'Server error. Please try again',
      }))
    }
  }

  const handleSearchChange = async (
    _e: SyntheticEvent,
    { value }: { value?: string | undefined }
  ) => {
    if (value === undefined) {
      setState((prevState) => ({
        ...prevState,
        searchValue: '',
        isSearching: false,
      }))
    } else {
      setState((prevState) => ({
        ...prevState,
        searchValue: value,
        isSearching: true,
      }))
      debouncedSearch(value)
    }
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
          onClick={() =>
            setState((prevState) => ({
              ...prevState,
              activeItem: 'home',
            }))
          }
        >
          <Icon name="home" />
          Home
        </Menu.Item>
        <Menu.Item
          active={activeItem === 'messages'}
          onClick={() =>
            setState((prevState) => ({
              ...prevState,
              activeItem: 'messages',
            }))
          }
        >
          <Icon name="mail" />
          Messages
          {unreadCount > 0 && <Label size="tiny">{unreadCount}</Label>}
        </Menu.Item>
        <Menu.Item
          active={activeItem === 'friends'}
          onClick={() =>
            setState((prevState) => ({
              ...prevState,
              activeItem: 'friends',
            }))
          }
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
