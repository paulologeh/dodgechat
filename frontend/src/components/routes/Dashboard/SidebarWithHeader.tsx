import {
  Box,
  Drawer,
  DrawerContent,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { SidebarContent } from './SidebarContent'
import { MobileNav } from './MobileNav'
import { useDashboardStore } from 'contexts/dashboardContext'
import { useAuth } from 'contexts/userContext'
import { Auth } from 'services'
import { Friends } from './Friends'
import { ErrorModal } from './ErrorModal'
import { LoadingModal } from './LoadingModal'
import { UserProfileModal } from 'components/common/UserProfile'

export const SidebarWithHeader = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
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

  const {
    openErrorModal,
    modalError,
    loading,
    loadingMessage,
    activeItem,
    friends = [],
    friendRequests = [],
    openUserProfileModal,
    selectedUserProfile,
  } = dashboardStore

  const renderActiveMenu = () => {
    switch (activeItem) {
      case 'friends':
        return <Friends friends={friends} />
      default:
        return null
    }
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <MobileNav
        onOpen={onOpen}
        logout={logout}
        friendRequests={friendRequests}
      />
      <Box ml={{ base: 0, md: 60 }} p="4">
        <LoadingModal open={loading} message={loadingMessage} />
        <ErrorModal open={openErrorModal} message={modalError} />
        <UserProfileModal
          open={openUserProfileModal}
          selectedUserProfile={selectedUserProfile}
        />
        {!loading && renderActiveMenu()}
      </Box>
    </Box>
  )
}
