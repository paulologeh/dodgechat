import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Stack,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { useUser } from 'contexts/userContext'
import { ProfileEdit } from './ProfileEdit'
import { Account } from './Account'
import { Users } from 'api'
import { useDashboardStore } from 'contexts/dashboardContext'
import { LoadingModal } from './LoadingModal'
import { ErrorModal } from './ErrorModal'
import { UserProfileModal } from 'components/common/UserProfile'
import { getGravatarUrl } from 'utils'
import { Messages } from './Messages'
import { FiMoon, FiSun } from 'react-icons/fi'
import { UserSearch } from './Search'
import { Notifications } from './Notifications'

export const Application = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const { currentUser, setLoggedIn, setCurrentUser } = useUser()
  const { dashboardStore, setDashboardStore } = useDashboardStore()
  const { avatarHash, name, username, email } = currentUser
  const displayName = name ?? username ?? 'Unknown user'
  const displayGravatar =
    avatarHash && email ? getGravatarUrl(avatarHash, email, 100) : undefined

  const logout = async () => {
    setDashboardStore((prevState) => ({
      ...prevState,
      loading: true,
      loadingMessage: 'Logging out',
    }))
    try {
      const response = await Users.logout()
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
    openUserProfileModal,
    friendRequests = [],
    friends = [],
  } = dashboardStore

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'end'}>
          <Flex alignItems={'center'} justifyContent="center">
            <Stack direction={'row'} spacing={7}>
              <UserSearch key="search" />
              <UserSearch
                key="friends"
                friends={friends}
                isFriendSearch={true}
              />
              <Notifications friendRequests={friendRequests} />
              <Tooltip
                label={colorMode === 'light' ? 'dark mode' : 'light mode'}
              >
                <IconButton
                  size="lg"
                  variant="ghost"
                  aria-label="toggle-dark-mode"
                  icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                  onClick={toggleColorMode}
                />
              </Tooltip>

              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                >
                  <Avatar size="sm" src={displayGravatar} />
                </MenuButton>
                <MenuList
                  alignItems={'center'}
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={useColorModeValue('gray.200', 'gray.900')}
                >
                  <br />
                  <Center>
                    <Avatar size={'2xl'} src={displayGravatar} />
                  </Center>
                  <br />
                  <Center>
                    <Text fontSize="md">{displayName}</Text>
                  </Center>
                  <br />
                  <MenuDivider />
                  <ProfileEdit currentUser={currentUser} />
                  <Account />
                  <MenuItem onClick={logout}>Sign out</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
      <Center>
        <Messages />
      </Center>
      <>
        <LoadingModal />
        <ErrorModal open={openErrorModal} message={modalError} />
        <UserProfileModal open={openUserProfileModal} />
      </>
    </>
  )
}
