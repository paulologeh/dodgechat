import {
  Container,
  Dropdown,
  Icon,
  Image,
  Label,
  Menu,
  Search,
} from 'semantic-ui-react'
import logo from 'assets/logo.png'
import { debounce } from 'lodash'
import { Search as SearchService } from 'services/search'
import { SyntheticEvent, useCallback, useEffect } from 'react'
import { useDashboardStore } from 'contexts/dashboardContext'

type propTypes = {
  logout: () => void
}

export const UserMenu = ({ logout }: propTypes) => {
  const { dashboardStore, setDashboardStore } = useDashboardStore()

  const handleResultSelect = async (
    _e: SyntheticEvent,
    data: { result: { title: string } }
  ) => {
    setDashboardStore((prevState) => ({
      ...prevState,
      loading: true,
      loadingMessage: 'Fetching user',
    }))

    try {
      const response = await SearchService.searchUser(data.result.title)
      const responseData = await response.json()
      if (response.status === 200) {
        setDashboardStore((prevState) => ({
          ...prevState,
          openUserProfileModal: true,
          selectedUserProfile: responseData,
          loading: false,
          loadingMessage: '',
        }))
      } else {
        setDashboardStore((prevState) => ({
          ...prevState,
          modalError: responseData.message,
          openErrorModal: true,
          loading: false,
          loadingMessage: '',
        }))
      }
    } catch (error) {
      console.error(error)
      setDashboardStore((prevState) => ({
        ...prevState,
        modalError: 'Something went wrong. Please try again',
        openErrorModal: true,
        loading: false,
        loadingMessage: '',
      }))
    }
  }

  const search = async (term: string) => {
    try {
      const response = await SearchService.searchAll(term)
      const data = await response.json()
      if (response.status === 200) {
        const userResults = data.users.results
        data.users.results = userResults.map((item: FriendMinimal) => ({
          title: item.username,
          description: item.name,
          image: item.gravatar,
        }))

        setDashboardStore((prevState) => ({
          ...prevState,
          searchResults: data,
          isSearching: false,
        }))
      } else {
        setDashboardStore((prevState) => ({
          ...prevState,
          searchResults: [],
          searchError: data.message,
          isSearching: false,
        }))
      }
    } catch (error) {
      console.error(error)
      setDashboardStore((prevState) => ({
        ...prevState,
        searchResults: [],
        searchError: 'Something went wrong. Please try again',
        isSearching: false,
      }))
    }
  }

  const handleSearchChange = async (
    _e: SyntheticEvent,
    { value }: { value?: string | undefined }
  ) => {
    if (value === undefined) {
      setDashboardStore((prevState) => ({
        ...prevState,
        searchValue: '',
        isSearching: false,
      }))
      debouncedSearch.cancel()
    } else {
      setDashboardStore((prevState) => ({
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value) => {
      search(value)
    }, 500),
    []
  )

  const {
    activeItem,
    unreadCount,
    friendRequestsCount,
    isSearching,
    searchResults,
    searchError,
    searchValue,
  } = dashboardStore

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
            setDashboardStore((prevState) => ({
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
            setDashboardStore((prevState) => ({
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
            setDashboardStore((prevState) => ({
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
