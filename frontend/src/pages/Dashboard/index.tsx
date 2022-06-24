import { Container, Loader, Dimmer } from 'semantic-ui-react'
import { useState } from 'react'
import { UserMenu } from './UserMenu'
import { HomeFeed } from './HomeFeed'
import { Friends } from './Friends'
import { Messages } from './Messages'
import { UserProfileModal, ErrorModal } from './SharedComponents'
import { Auth } from 'services'
import { useAuth } from 'contexts/userContext'
import {
  userProfileType,
  searchResultsType,
  friendMinimalType,
} from 'types/apiTypes'

export type dashboardStateType = {
  activeItem: string
  unreadCount: number
  friendRequestsCount: number
  loading: boolean
  loadingMessage: string
  friendRequests: Array<friendMinimalType>
  friends: Array<friendMinimalType>
  isSearching: boolean
  searchValue: string
  searchError: string
  searchResults: searchResultsType | Array<never>
  openErrorModal: boolean
  modalError: string
  openUserProfileModal: boolean
  selectedUserProfile: userProfileType | null
}

export const Dashboard = () => {
  const [state, setState] = useState<dashboardStateType>({
    activeItem: 'friends',
    unreadCount: 0,
    friendRequestsCount: 0,
    loading: false,
    loadingMessage: '',
    friendRequests: [],
    friends: [],
    isSearching: false,
    searchValue: '',
    searchError: '',
    searchResults: [],
    openErrorModal: false,
    modalError: '',
    openUserProfileModal: false,
    selectedUserProfile: null,
  })

  const { setLoggedIn, setCurrentUser } = useAuth()
  const logout = async () => {
    setState((prevState) => ({
      ...prevState,
      loading: true,
      loadingMessage: 'Logging out',
    }))
    const response = await Auth.logout()

    if (response.status !== 200) {
      alert('Failed to logout')
      const jsonValue = await response.json()
      console.error(jsonValue)
      return
    }
    setLoggedIn(false)
    setCurrentUser({})
    setState((prevState) => ({
      ...prevState,
      loading: false,
      loadingMessage: '',
    }))
  }

  // const _getFriends = async () => {
  //   setState((prevState) => ({ ...prevState, loading: true }))
  //   const response = await Relationships.getFriends()
  //   const data = await response.json()

  //   if (response.status !== 200) {
  //     setState((prevState) => ({
  //       ...prevState,
  //       loading: false,
  //       openErrorModal: true,
  //       modalError: data.message,
  //     }))
  //   } else {
  //     const {
  //       friendRequests,
  //       friends,
  //     }: {
  //       friendRequests: Array<friendMinimalType>
  //       friends: Array<friendMinimalType>
  //     } = data

  //     setState((prevState) => ({
  //       ...prevState,
  //       loading: false,
  //       friendRequests: friendRequests,
  //       friends: friends,
  //     }))
  //   }
  // }

  return (
    <div>
      <Dimmer active={state.loading}>
        <Loader>{state.loadingMessage}</Loader>
      </Dimmer>
      <UserMenu
        activeItem={state.activeItem}
        unreadCount={state.unreadCount}
        setState={setState}
        logout={logout}
        friendRequestsCount={state.friendRequestsCount}
        isSearching={state.isSearching}
        searchValue={state.searchValue}
        searchResults={state.searchResults}
        searchError={state.searchError}
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
      <UserProfileModal
        open={state.openUserProfileModal}
        setState={setState}
        selectedUserProfile={state.selectedUserProfile}
      />
      <ErrorModal
        open={state.openErrorModal}
        setState={setState}
        message={state.modalError}
      />
    </div>
  )
}
