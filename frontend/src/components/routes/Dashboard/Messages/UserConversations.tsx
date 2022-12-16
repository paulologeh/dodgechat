import { FriendMinimal, Message } from 'types/api'
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
import { useAuth } from 'contexts/userContext'
import { MessageBubble } from './MessageBubble'
import { useEffect, useRef, useState } from 'react'
import { Conversations } from 'api'
import { isEmpty } from 'lodash'

type UserConversationsProp = {
  friend: FriendMinimal
  messages: Message[]
  handleBackwardsClick: () => void
  conversationId: string
  handleReadMessages: (ids: string[]) => void
}

export const UserConversations = ({
  friend,
  messages,
  handleBackwardsClick,
  conversationId,
  handleReadMessages,
}: UserConversationsProp) => {
  const { lastSeen } = friend
  const isOnline = lastSeen && getLastSeen(lastSeen) === 'Now'
  const { currentUser } = useAuth()
  const [isSending, setIsSending] = useState(false)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [isFailed, setIsFailed] = useState(false)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
      handleMessagesRead().catch(console.error)
    }
  })

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
        .filter((msg) => msg.senderId === friend.id && !msg.read)
        .map((msg) => msg.id) ?? []

    if (isEmpty(unreadMessageIds)) return

    try {
      const response = await Conversations.readMessages(unreadMessageIds)
      if (response.status === 200) {
        handleReadMessages(unreadMessageIds)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleMessageSend = async () => {
    setIsSending(true)

    try {
      const response = await Conversations.sendMessage(conversationId, text)
      if (response.status === 200) {
        const data = await response.json()
        setLocalMessages([...localMessages, data])
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
            onClick={handleBackwardsClick}
          />
          <Avatar size="lg" src={friend.gravatar}>
            <AvatarBadge
              boxSize={isOnline ? '0.9em' : undefined}
              bg="green.500"
            />
          </Avatar>
          <Box flex="1" ml="4">
            <Box fontWeight="extrabold">{friend.name}</Box>
          </Box>
        </Box>
        <Divider
          sx={{
            mb: 4,
            mt: 4,
          }}
        />
      </Box>
      <Box>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            body={msg.body}
            isSender={currentUser.id === msg.senderId}
          />
        ))}
        {localMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            body={msg.body}
            isSender={currentUser.id === msg.senderId}
          />
        ))}
        <div ref={bottomRef} />
      </Box>
      <Box
        pos="sticky"
        zIndex={2}
        bottom={0}
        bg={useColorModeValue('white', 'gray.800')}
      >
        <Stack direction="row">
          <Input
            placeholder="Type a message"
            bg={useColorModeValue('gray.100', 'gray.600')}
            border={0}
            flex={1}
            size="lg"
            value={text}
            onChange={(e) => setText(e.target.value)}
            isInvalid={isFailed}
          />
          <IconButton
            color="teal.500"
            aria-label="send message"
            icon={isSending ? <Spinner color="teal.500" /> : <FiSend />}
            size="lg"
            onClick={handleMessageSend}
          />
        </Stack>
      </Box>
    </Box>
  )
}
