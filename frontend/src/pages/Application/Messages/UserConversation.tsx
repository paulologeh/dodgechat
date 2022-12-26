import { Conversation } from 'types/api'
import {
  Avatar,
  AvatarBadge,
  Box,
  Divider,
  IconButton,
  Input,
  Spinner,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiChevronLeft, FiSend } from 'react-icons/fi'
import { delay, getLastSeen } from 'utils'
import { useUser } from 'contexts/userContext'
import { MessageBubble } from './MessageBubble'
import { KeyboardEvent, SetStateAction, useState } from 'react'
import { Conversations } from 'api'
import { isEmpty } from 'lodash'
import { useApplication } from 'contexts/applictionContext'
import { useKeepScrollPosition, useMessages } from 'hooks'

export const UserConversation = ({
  conversation,
}: {
  conversation: Conversation
}) => {
  const {
    setActiveConversation,
    readLocalMessages,
    getUserById,
    addNewConversation,
    addMessagesToActiveConversation,
    userFriends,
    requestOrAppError,
    removeConversation,
  } = useApplication()
  const { currentUser } = useUser()
  const { senderId, recipientId } = conversation
  const userId = senderId === currentUser.id ? recipientId : senderId
  const user = getUserById(userId)
  const { lastSeen, name, gravatar } = user
  const isOnline = lastSeen && getLastSeen(lastSeen) === 'Now'
  const isUserFriend = userFriends.some((user) => user.id === userId)
  const [isSending, setIsSending] = useState(false)
  const [text, setText] = useState('')
  const [isFailed, setIsFailed] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { messages, setLastMessageRef, isLoadingMessages } = useMessages()
  const { containerRef } = useKeepScrollPosition([messages])

  const handleFailedMessage = async () => {
    setIsSending(false)
    setIsFailed(true)
    await delay(1000)
    setIsFailed(false)
  }

  const handleMessagesRead = async () => {
    if (isEmpty(messages)) return

    const unreadMessageIds =
      messages
        .filter((msg) => msg.senderId === user.id && !msg.read)
        .map((msg) => msg.id) ?? []

    if (isEmpty(unreadMessageIds)) return

    try {
      const response = await Conversations.readMessages(unreadMessageIds)
      if (response.status === 200) {
        readLocalMessages(unreadMessageIds)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleMessageSend = async () => {
    setIsSending(true)

    try {
      let response
      if (conversation.id) {
        response = await Conversations.sendMessage(conversation.id, text)
      } else if (user.id) {
        response = await Conversations.createConversation({
          recipientId: user.id,
          messageBody: text,
        })
      }
      if (response?.status === 200) {
        const data = await response.json()
        if (conversation.id) {
          const msgs = [data]
          console.log('sending new messages', msgs)
          addMessagesToActiveConversation(msgs)
        } else if (conversation.id === null) {
          addNewConversation(data)
          setActiveConversation(data.id)
        }

        setText('')
      } else {
        await handleFailedMessage()
      }
    } catch (error) {
      console.error(error)
      await handleFailedMessage()
    }

    setIsSending(false)
  }

  const handleConversationDelete = async () => {
    if (!conversation.id) return

    const request = async () =>
      Conversations.deleteConversation(conversation.id ?? '')
    setIsDeleting(true)
    const response = requestOrAppError('TOAST', null, request)
    setIsDeleting(false)
    if (response !== null) {
      setActiveConversation(undefined)
      removeConversation(conversation.id)
    }
  }

  return (
    <Box pt={2} pb={4}>
      <Box
        pos="sticky"
        zIndex={2}
        top={0}
        bg={useColorModeValue('white', 'gray.800')}
      >
        <Box
          sx={{
            w: '100%',
            h: '68px',
            fontWeight: 'medium',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconButton
            aria-label="back"
            size="lg"
            variant="link"
            icon={<FiChevronLeft />}
            onClick={() => setActiveConversation(undefined)}
          />
          <Avatar size="lg" src={gravatar}>
            <AvatarBadge
              boxSize={isOnline ? '0.9em' : undefined}
              bg="green.500"
            />
          </Avatar>
          <Box flex="1" ml="4">
            <Box fontWeight="extrabold">{name}</Box>
          </Box>
        </Box>
        <Divider
          sx={{
            mb: 4,
            mt: 4,
          }}
        />
      </Box>
      <div style={{ minHeight: '80vh', overflow: 'auto' }} ref={containerRef}>
        {isLoadingMessages && (
          <Stack align="center" py={2} px={2}>
            <Spinner thickness="4px" emptyColor="gray.200" color="blue.500" />
          </Stack>
        )}
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isSender={currentUser.id === msg.senderId}
            innerRef={(ref: SetStateAction<null>) =>
              index === 0 ? setLastMessageRef(ref) : null
            }
          />
        ))}
      </div>
      <Box
        pos="sticky"
        zIndex={2}
        bottom={0}
        bg={useColorModeValue('white', 'gray.800')}
      >
        <Stack direction="row">
          <Input
            placeholder={
              isUserFriend
                ? 'Type a message'
                : 'You are no longer friends with this user'
            }
            bg={useColorModeValue('gray.100', 'gray.600')}
            border={0}
            flex={1}
            size="lg"
            value={text}
            isDisabled={!isUserFriend}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={async (e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                await handleMessageSend()
              }
            }}
            isInvalid={isFailed}
          />
          <IconButton
            color="teal.500"
            aria-label="send message"
            icon={isSending ? <Spinner color="teal.500" /> : <FiSend />}
            size="lg"
            isDisabled={user.id === 0}
            onClick={handleMessageSend}
          />
        </Stack>
      </Box>
    </Box>
  )
}
