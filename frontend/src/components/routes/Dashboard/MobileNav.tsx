import {
  Avatar,
  Box,
  Flex,
  FlexProps,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { FiBell, FiChevronDown, FiMenu } from 'react-icons/fi'
import { useAuth } from 'contexts/userContext'
import { FriendMinimal } from 'types/api'
import { FriendRequest } from './FriendRequest'
import { UserSearch } from './Search/SearchModal'

interface MobileProps extends FlexProps {
  onOpen: () => void
  logout: () => void
  friendRequests: FriendMinimal[]
}
export const MobileNav = ({
  onOpen,
  logout,
  friendRequests,
  ...rest
}: MobileProps) => {
  const { currentUser } = useAuth()

  const { avatarHash, name, username } = currentUser
  const displayName = name ?? username ?? 'Unknown user'

  const renderFriendRequests = () => (
    <Popover>
      <PopoverTrigger>
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="open menu"
          icon={<FiBell />}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader pt={4} fontWeight="bold">
          Notifications
        </PopoverHeader>
        <PopoverArrow />
        <PopoverBody>
          <div>
            {friendRequests && friendRequests.length > 0 ? (
              friendRequests.map(({ username, gravatar }) => (
                <FriendRequest
                  username={username}
                  gravatar={gravatar}
                  key={username}
                />
              ))
            ) : (
              <Text>Nothing to see here!</Text>
            )}
          </div>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        Dodgechat
      </Text>

      <HStack spacing={{ base: '0', md: '6' }}>
        <UserSearch />
        {renderFriendRequests()}
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: 'none' }}
            >
              <HStack>
                <Avatar
                  size={'sm'}
                  src={`https://secure.gravatar.com/avatar/${avatarHash}?s=100&d=identicon&r=g`}
                />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">{displayName}</Text>
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue('white', 'gray.900')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <MenuItem>Profile</MenuItem>
              <MenuDivider />
              <MenuItem onClick={logout}>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  )
}
