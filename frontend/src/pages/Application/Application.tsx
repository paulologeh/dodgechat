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
  useToast,
} from '@chakra-ui/react'
import { useUser } from 'contexts/userContext'
import { ProfileEdit } from './ProfileEdit'
import { Account } from './Account'
import { Users } from 'api'
import { LoadingModal } from './LoadingModal'
import { ErrorModal } from './ErrorModal'
import { UserProfileModal } from 'components/common/UserProfile'
import { getGravatarUrl } from 'utils'
import { Messages } from './Messages'
import { FiMoon, FiSun } from 'react-icons/fi'
import { UserSearch } from './Search'
import { Notifications } from './Notifications'
import { useApplication } from 'contexts/applictionContext'
import { useEffect } from 'react'
import { useWebsockets } from 'hooks'

export const Application = () => {
  const {
    userFriends,
    requestOrAppError,
    errorMessage,
    errorKind,
    userConversations,
  } = useApplication()
  const { colorMode, toggleColorMode } = useColorMode()
  const { currentUser, setLoggedIn, setCurrentUser } = useUser()
  const { avatarHash, name, username, email } = currentUser
  const displayName = name ?? username ?? 'Unknown user'
  const toast = useToast()
  const displayGravatar =
    avatarHash && email ? getGravatarUrl(avatarHash, email, 100) : undefined
  const { disconnect } = useWebsockets()

  const setDocumentTitle = () => {
    const unread = userConversations.map(
      (conversation) =>
        conversation.messages.filter(
          (message) => message.senderId !== currentUser.id && !message.read
        ).length
    )
    const unreadCount = unread.reduce((partialSum, a) => partialSum + a, 0)
    if (unreadCount) {
      document.title = `Dodgechat | ${unreadCount} New Messages`
    } else {
      document.title = 'Dodgechat'
    }
  }

  useEffect(() => {
    setDocumentTitle()
  })

  useEffect(() => {
    if (errorKind === 'TOAST' && errorMessage) {
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }
  }, [errorKind])

  const logout = async () => {
    const request = async () => {
      await disconnect() // disconnect from websocket first
      return Users.logout()
    }
    const response = await requestOrAppError('MODAL', 'Logging out', request)
    if (response !== null) {
      setLoggedIn(false)
      setCurrentUser({})
    }
  }

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'end'}>
          <Flex alignItems={'center'} justifyContent="center">
            <Stack direction={'row'} spacing={7}>
              <UserSearch key="search" />
              <UserSearch
                key="friends"
                friends={userFriends}
                isFriendSearch={true}
              />
              <Notifications />
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
              <Box>
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
              </Box>
            </Stack>
          </Flex>
        </Flex>
      </Box>
      <Center>
        <Messages />
      </Center>
      <>
        <LoadingModal />
        <ErrorModal />
        <UserProfileModal />
      </>
    </>
  )
}
