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
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { DodgeAlerter } from './DodgeAlerter'
import { useAuth } from 'contexts/userContext'
import { ProfileEdit } from './ProfileEdit'
import { Settings } from './Settings'
import { Users } from 'services'
import { useDashboardStore } from 'contexts/dashboardContext'

export const Dashboard = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const { currentUser, setLoggedIn, setCurrentUser } = useAuth()
  const { setDashboardStore } = useDashboardStore()
  const { avatarHash, name, username } = currentUser
  const displayName = name ?? username ?? 'Unknown user'
  const displayGravatar = `https://secure.gravatar.com/avatar/${avatarHash}?s=100&d=identicon&r=g`

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

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Box>
            <DodgeAlerter />
          </Box>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
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
                <MenuList alignItems={'center'}>
                  <br />
                  <Center>
                    <Avatar size={'2xl'} src={displayGravatar} />
                  </Center>
                  <br />
                  <Center>
                    <p>{displayName}</p>
                  </Center>
                  <br />
                  <MenuDivider />
                  <ProfileEdit currentUser={currentUser} />
                  <Settings currentUser={currentUser} />
                  <MenuItem onClick={logout}>Sign out</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  )
}
