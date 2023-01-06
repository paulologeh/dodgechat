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
import { useUser } from 'contexts/userContext'
import { Conversation } from 'types/api'
import { useApplication } from 'contexts/applictionContext'
import { isEmpty } from 'lodash'

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
  return `Joined ${months[month]} ${year}`
}

export const UserProfileModal = () => {
  const [loading, setLoading] = useState<UserProfileButtonGroup>({
    add: false,
    delete: false,
    block: false,
    unblock: false,
  })
  const { currentUser } = useUser()
  const {
    requestSilent,
    displayedProfile,
    setDisplayedProfile,
    userFriends,
    userConversations,
    addNewConversation,
    setActiveConversation,
    requestOrAppError,
    syncData,
  } = useApplication()
  const open = !isEmpty(displayedProfile)
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
  } = displayedProfile ?? {}

  const refetch = async (username: string) => {
    const request = async () => SearchService.searchUser(username)
    const response = await requestSilent(request)
    if (response) {
      setDisplayedProfile(response)
    }
    await syncData(true)
  }

  const handleClick = async (button: string) => {
    if (!username || !currentUser.id) return

    const friend = userFriends.find((friend) => friend.username === username)

    if (button === 'message') {
      if (!friend || !friend.id) return
      const conversation = userConversations.find(
        (conv: Conversation) =>
          conv.senderId === friend.id || conv.recipientId === friend.id
      ) ?? {
        id: null,
        senderId: currentUser.id,
        recipientId: friend.id,
        messages: [],
      }

      if (!conversation.id) {
        addNewConversation(conversation)
      }
      setActiveConversation(conversation.id)
      setDisplayedProfile(null)
      return
    }

    setLoading({ ...loading, [button]: true })

    const request = async () => {
      if (button === 'add') return Relationships.addUser(username)
      else if (button === 'delete') return Relationships.deleteUser(username)
      else if (button === 'block') return Relationships.blockUser(username)
      else if (button === 'unblock') return Relationships.unBlockUser(username)
      else return new Response(null)
    }

    await requestOrAppError('TOAST', null, request)
    await refetch(username)
    setLoading({ ...loading, [button]: false })
  }

  const isOnline = lastSeen && getLastSeen(lastSeen) === 'Now'
  const onlineStyle = {
    content: '""',
    w: 4,
    h: 4,
    bg: 'green.300',
    border: '2px solid white',
    rounded: 'full',
    pos: 'absolute',
    bottom: 0,
    right: 3,
  }

  return (
    <Modal isOpen={open} onClose={() => setDisplayedProfile(null)} size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <Center>
            <Box p={6} textAlign={'center'}>
              <Avatar
                size={'xl'}
                src={gravatar}
                mb={4}
                pos={'relative'}
                _after={isOnline ? onlineStyle : undefined}
              />
              <Heading fontSize={'2xl'} fontFamily={'body'}>
                {name}
              </Heading>
              <Text fontWeight={600} color={'gray.500'} mb={4}>
                @{username}
              </Text>
              <Stack
                flex={1}
                flexDirection="column"
                textAlign="left"
                justify="center"
                mt={2}
              >
                <List spacing={3} mb={4}>
                  {aboutMe && (
                    <ListItem>
                      <Text mb={2} fontWeight="light">
                        {aboutMe}
                      </Text>
                    </ListItem>
                  )}
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
                <Stack direction="row" justify="center" spacing={6}>
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
                  {relationshipState !== null &&
                    relationshipState !== 'BLOCKED' && (
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
              </Stack>
            </Box>
          </Center>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
