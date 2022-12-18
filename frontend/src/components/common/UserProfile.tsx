import {
  Avatar,
  Box,
  Center,
  Heading,
  IconButton,
  List,
  ListIcon,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { useDashboardStore } from 'contexts/dashboardContext'
import { getLastSeen, months } from 'utils/index'
import { useState } from 'react'
import { Relationships, Search as SearchService } from 'api'
import {
  FiCalendar,
  FiClock,
  FiMessageSquare,
  FiNavigation2,
  FiSlash,
  FiUserMinus,
  FiUserPlus,
  FiUsers,
  FiUserX,
} from 'react-icons/fi'
import { useAuth } from 'contexts/userContext'

type UserProfileModalProps = {
  open: boolean
}

type UserProfileButtonGroup = {
  add: boolean
  delete: boolean
  block: boolean
  unblock: boolean
}

const getJoined = (date: Date) => {
  const d = new Date(date)
  const year = d.getFullYear() // 2019
  const month = d.getMonth() // 12
  if (month > 12 || month < 1) return ''
  return `Joined ${months[month - 1]} ${year}`
}

export const UserProfileModal = ({ open }: UserProfileModalProps) => {
  const [loading, setLoading] = useState<UserProfileButtonGroup>({
    add: false,
    delete: false,
    block: false,
    unblock: false,
  })
  const { dashboardStore, setDashboardStore } = useDashboardStore()
  const { currentUser } = useAuth()
  const { selectedUser, conversations, friends } = dashboardStore
  const {
    name,
    username,
    aboutMe,
    gravatar,
    lastSeen,
    location,
    relationshipState,
    memberSince,
    numberOfFriends,
  } = selectedUser ?? {}

  const refetch = async (username: string) => {
    setDashboardStore((prevState) => ({
      ...prevState,
      loading: true,
      loadingMessage: 'Refetching User',
    }))
    const response = await SearchService.searchUser(username)
    const friendsResponse = await Relationships.getFriends()

    if (response.status === 200 && friendsResponse.status === 200) {
      const user = await response.json()
      const friends = await friendsResponse.json()
      setDashboardStore((prevState) => ({
        ...prevState,
        selectedUser: user,
        friendRequests: friends.friendRequests,
        friends: friends.friends,
        loading: false,
        loadingMessage: '',
      }))
    } else {
      setDashboardStore((prevState) => ({
        ...prevState,
        modalError: 'Something went wrong. Please try again later',
        openErrorModal: true,
        loading: false,
        loadingMessage: '',
      }))
    }
  }

  const handleClick = async (button: string) => {
    if (!username) return

    if (button === 'message') {
      const friend = friends.filter((friend) => friend.username === username)[0]
      const conversation = conversations.filter(
        (conv) => conv.senderId === friend.id || conv.recipientId === friend.id
      )[0] ?? {
        id: null,
        senderId: currentUser.id,
        recipientId: friend.id,
        messages: [],
      }

      setDashboardStore((prevState) => ({
        ...prevState,
        currentConversation: conversation,
        selectedUser: null,
        openUserProfileModal: false,
      }))
      return
    }

    setLoading({ ...loading, [button]: true })

    try {
      let response

      if (button === 'add') response = await Relationships.addUser(username)
      else if (button === 'delete')
        response = await Relationships.deleteUser(username)
      else if (button === 'block')
        response = await Relationships.blockUser(username)
      else if (button === 'unblock')
        response = await Relationships.unBlockUser(username)

      if (!response) {
        console.error('undefined response')
        setDashboardStore((prevState) => ({
          ...prevState,
          modalError: 'Something went wrong. Please try again',
          openErrorModal: true,
        }))
      } else if (response.status !== 200) {
        const data = await response.json()
        setLoading({ ...loading, [button]: false })
        setDashboardStore((prevState) => ({
          ...prevState,
          modalError: data.message,
          openErrorModal: true,
        }))
      }
    } catch (error) {
      console.error(error)
      setDashboardStore((prevState) => ({
        ...prevState,
        modalError: 'Something went wrong. Please try again',
        openErrorModal: true,
      }))
    } finally {
      setLoading({ ...loading, [button]: false })
      await refetch(username)
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        setDashboardStore((prevState) => ({
          ...prevState,
          openUserProfileModal: false,
        }))
      }}
      size="sm"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <Center>
            <Box p={6} textAlign={'center'}>
              <Avatar size={'xl'} src={gravatar} mb={4} pos={'relative'} />
              <Heading fontSize={'2xl'} fontFamily={'body'}>
                {name}
              </Heading>
              <Text fontWeight={600} color={'gray.500'} mb={4}>
                @{username}
              </Text>
              <Stack flex={1} flexDirection="column" mt={6}>
                {aboutMe && <Text textAlign={'center'}>{aboutMe}</Text>}
                <List spacing={3}>
                  {numberOfFriends && (
                    <ListItem>
                      <ListIcon as={FiUsers} color="green.500" />
                      {`${numberOfFriends} friend${
                        numberOfFriends > 1 ? 's' : ''
                      }`}
                    </ListItem>
                  )}
                  {lastSeen && (
                    <ListItem>
                      <ListIcon as={FiClock} color="green.500" />
                      Last seen {getLastSeen(lastSeen)}
                    </ListItem>
                  )}
                  {memberSince && (
                    <ListItem>
                      <ListIcon as={FiCalendar} color="green.500" />
                      {getJoined(memberSince)}
                    </ListItem>
                  )}
                  {location && (
                    <ListItem>
                      <ListIcon as={FiNavigation2} color="green.500" />
                      {location}
                    </ListItem>
                  )}
                </List>
              </Stack>
              <Stack mt={8} direction={'row'} spacing={4}>
                {relationshipState === 'ACCEPTED' && (
                  <Tooltip label="Send message">
                    <IconButton
                      aria-label="message user"
                      variant="outline"
                      colorScheme="teal"
                      size="lg"
                      icon={<FiMessageSquare />}
                      onClick={() => handleClick('message')}
                    />
                  </Tooltip>
                )}
                {(relationshipState === null ||
                  relationshipState === 'REQUESTEE') && (
                  <Tooltip
                    label={
                      relationshipState === null ? 'Add user' : 'Accept user'
                    }
                  >
                    <IconButton
                      aria-label="add or accept user"
                      variant="outline"
                      colorScheme="green"
                      size="lg"
                      icon={<FiUserPlus />}
                      isLoading={loading.add}
                      onClick={() => handleClick('add')}
                    />
                  </Tooltip>
                )}
                {relationshipState !== null && relationshipState !== 'BLOCKED' && (
                  <Tooltip
                    label={
                      relationshipState === 'ACCEPTED'
                        ? 'Remove user'
                        : relationshipState === 'REQUESTEE'
                        ? 'Reject user'
                        : 'Cancel request'
                    }
                  >
                    <IconButton
                      aria-label="reject or remove user or cancel request"
                      variant="outline"
                      colorScheme="red"
                      size="lg"
                      icon={
                        relationshipState === 'ACCEPTED' ? (
                          <FiUserMinus />
                        ) : (
                          <FiUserX />
                        )
                      }
                      isLoading={loading.delete}
                      onClick={() => handleClick('delete')}
                    />
                  </Tooltip>
                )}
                <Tooltip
                  label={
                    relationshipState === 'BLOCKED'
                      ? 'Unblock user'
                      : 'Block user'
                  }
                >
                  <IconButton
                    aria-label="block or unblock user"
                    colorScheme="red"
                    size="lg"
                    icon={<FiSlash />}
                    isLoading={loading.block || loading.unblock}
                    onClick={() =>
                      handleClick(
                        relationshipState === 'BLOCKED' ? 'unblock' : 'block'
                      )
                    }
                  />
                </Tooltip>
              </Stack>
            </Box>
          </Center>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
