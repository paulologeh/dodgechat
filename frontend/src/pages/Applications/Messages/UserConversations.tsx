import { FriendMinimal, Message } from 'types/api'
import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Divider,
  IconButton,
  Input,
  Spinner,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiChevronLeft, FiRefreshCcw, FiSend, FiTrash2 } from 'react-icons/fi'
import { delay, getLastSeen } from 'utils'
import { useUser } from 'contexts/userContext'
import { MessageBubble } from './MessageBubble'
import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import { Conversations } from 'api'
import { isEmpty } from 'lodash'
import { useIsInViewport } from 'hooks'
import { useDashboardStore } from 'contexts/dashboardContext'

type UserConversationsProp = {
  friend: FriendMinimal
  messages: Message[]
  handleBackwardsClick: () => void
  conversationId: string | null
  handleReadMessages: (ids: string[]) => void
}

export const UserConversations = ({
  friend,
  messages,
  handleBackwardsClick,
  conversationId,
  handleReadMessages,
}: UserConversationsProp) => {
  const { lastSeen, name, gravatar } = friend
  const isOnline = lastSeen && getLastSeen(lastSeen) === 'Now'
  const { currentUser } = useUser()
  const { dashboardStore, setDashboardStore } = useDashboardStore()
  const { olderMessages } = dashboardStore
  const [isSending, setIsSending] = useState(false)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const isBottomRefInViewport = useIsInViewport(bottomRef)
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [isFailed, setIsFailed] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadMoreDisabled, setIsLoadMoreDisabled] = useState(false)

  useEffect(() => {
    if (isEmpty(olderMessages) && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  })

  useEffect(() => {
    if (isBottomRefInViewport) {
      handleMessagesRead().catch(console.error)
    }
  }, [isBottomRefInViewport])

  const fetchMoreMessages = async () => {
    if (!conversationId) return

    const timestamp =
      ((olderMessages ?? [])[0] ?? {}).createdAt ?? messages[0].createdAt
    setIsLoadingMore(true)
    try {
      const response = await Conversations.getConversation(
        conversationId,
        10,
        timestamp
      )
      if (response.status === 200) {
        const msgs: Message[] = await response.json()
        if (isEmpty(msgs)) {
          console.log('messages are empty')
          setIsLoadMoreDisabled(true)
        } else {
          setDashboardStore((prevState) => ({
            ...prevState,
            olderMessages: msgs.concat([...(olderMessages ?? [])]),
          }))
        }
      }
    } catch (error) {
      console.error(error)
    }
    setIsLoadingMore(false)
  }

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
      let response
      if (conversationId) {
        response = await Conversations.sendMessage(conversationId, text)
      } else if (friend.id) {
        response = await Conversations.createConversation({
          recipientId: friend.id,
          messageBody: text,
        })
      }
      if (response?.status === 200) {
        const data = await response.json()
        if (conversationId) {
          setLocalMessages([...localMessages, data])
        } else if (conversationId === null) {
          const conversationsUpdate = [...dashboardStore.conversations].filter(
            (conv) => conv.id !== null
          )
          setDashboardStore((prevState) => ({
            ...prevState,
            conversations: [...conversationsUpdate, data],
            activeConversationId: data.id,
          }))
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
          <Avatar size="lg" src={gravatar}>
            <AvatarBadge
              boxSize={isOnline ? '0.9em' : undefined}
              bg="green.500"
            />
          </Avatar>
          <Box flex="1" ml="4">
            <Box fontWeight="extrabold">{name}</Box>
          </Box>
          <Stack direction="row" spacing={3}>
            <Button
              rightIcon={<FiRefreshCcw />}
              onClick={() => {
                fetchMoreMessages().catch(console.error)
                setLocalMessages([])
              }}
              isLoading={isLoadingMore}
              isDisabled={isLoadMoreDisabled}
            >
              Load more
            </Button>
            <Button rightIcon={<FiTrash2 />} colorScheme="red">
              Delete
            </Button>
          </Stack>
        </Box>
        <Divider
          sx={{
            mb: 4,
            mt: 4,
          }}
        />
      </Box>
      <Box minHeight={'80vh'}>
        {(olderMessages ?? []).map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isSender={currentUser.id === msg.senderId}
          />
        ))}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isSender={currentUser.id === msg.senderId}
          />
        ))}
        {localMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
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
            isDisabled={friend.id === 0}
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
            isDisabled={friend.id === 0}
            onClick={handleMessageSend}
          />
        </Stack>
      </Box>
    </Box>
  )
}
