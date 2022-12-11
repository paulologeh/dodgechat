import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { useAuth } from 'contexts/userContext'
import { ProfileEdit } from './ProfileEdit'
import { Settings } from './Settings'
import { Users } from 'api'
import { useDashboardStore } from 'contexts/dashboardContext'
import { LoadingModal } from './LoadingModal'
import { ErrorModal } from './ErrorModal'
import { UserProfileModal } from 'components/common/UserProfile'
import { Notifications } from './Notifications'
import { UserSearch } from './Search'
import { getGravatarUrl } from 'utils'
import { Messages } from './Messages'

export const Dashboard = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const { currentUser, setLoggedIn, setCurrentUser } = useAuth()
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
    loading,
    loadingMessage,
    openUserProfileModal,
    friendRequests = [],
    friends = [],
  } = dashboardStore

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Box>dodgechat</Box>

          <Flex alignItems={'center'} justifyContent="center">
            <Stack direction={'row'} spacing={8}>
              <UserSearch
                key="friends"
                friends={friends}
                isFriendSearch={true}
              />
              <UserSearch key="search" />
              <Notifications friendRequests={friendRequests} />
              <Button onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>

              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                >
                  <Avatar size={'sm'} src={displayGravatar} />
                </MenuButton>
                <MenuList
                  alignItems={'center'}
                  bg={useColorModeValue('white', 'gray.900')}
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
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
                  <Settings />
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
        <LoadingModal open={loading} message={loadingMessage} />
        <ErrorModal open={openErrorModal} message={modalError} />
        <UserProfileModal open={openUserProfileModal} />
      </>
    </>
  )
}
