import { Container, Dimmer, Loader } from 'semantic-ui-react'
import { useEffect } from 'react'
import { UserMenu } from './UserMenu'
import { HomeFeed } from './HomeFeed'
import { Friends } from './Friends'
import { Messages } from './Messages'
import { ErrorModal, UserProfileModal } from './SharedComponents'
import { Auth, Relationships } from 'services'
import { useDashboardStore } from 'contexts/dashboardContext'
import { useAuth } from 'contexts/userContext'
import { FriendMinimal } from '../../types/api'

export const Dashboard = () => {
  const { dashboardStore, setDashboardStore } = useDashboardStore()

  const { setLoggedIn, setCurrentUser } = useAuth()
  const logout = async () => {
    setDashboardStore((prevState) => ({
      ...prevState,
      loading: true,
      loadingMessage: 'Logging out',
    }))
    try {
      const response = await Auth.logout()
      const data = await response.json()

      if (response.status === 200) {
        setLoggedIn(false)
        setCurrentUser({})
        setDashboardStore((prevState) => ({
          ...prevState,
          loading: false,
          loadingMessage: '',
        }))
      } else {
        setDashboardStore((prevState) => ({
          ...prevState,
          modalError: data.message,
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

  const getFriends = async () => {
    setDashboardStore((prevState) => ({
      ...prevState,
      loading: true,
    }))

    try {
      const response = await Relationships.getFriends()
      const data = await response.json()
      if (response.status === 200) {
        const {
          friendRequests,
          friends,
        }: {
          friendRequests: FriendMinimal[]
          friends: FriendMinimal[]
        } = data

        setDashboardStore((prevState) => ({
          ...prevState,
          loading: false,
          friendRequests: friendRequests,
          friends: friends,
        }))
      } else {
        setDashboardStore((prevState) => ({
          ...prevState,
          loading: false,
          openErrorModal: true,
          modalError: data.message,
        }))
      }
    } catch (error) {
      console.error(error)
      setDashboardStore((prevState) => ({
        ...prevState,
        loading: false,
        openErrorModal: true,
        modalError: 'Something went wrong. Please try again',
      }))
    }
  }

  useEffect(() => {
    getFriends()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    loading,
    activeItem,
    friendRequests,
    loadingMessage,
    friends,
    openUserProfileModal,
    selectedUserProfile,
    openErrorModal,
    modalError,
  } = dashboardStore

  return (
    <div>
      <Dimmer active={loading}>
        <Loader>{loadingMessage}</Loader>
      </Dimmer>
      <UserMenu logout={logout} />
      <Container text style={{ marginTop: '7em' }}>
        {activeItem === 'home' && <HomeFeed />}
        {activeItem === 'friends' && (
          <Friends friendRequests={friendRequests} friends={friends} />
        )}
        {activeItem === 'messages' && <Messages />}
      </Container>
      <UserProfileModal
        open={openUserProfileModal}
        selectedUserProfile={selectedUserProfile}
      />
      <ErrorModal open={openErrorModal} message={modalError} />
    </div>
  )
}
