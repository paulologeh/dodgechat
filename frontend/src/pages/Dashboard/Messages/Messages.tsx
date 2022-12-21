import { useDashboardStore } from 'contexts/dashboardContext'
import { useEffect, useRef, useState } from 'react'
import { Conversation, FriendMinimal } from 'types/api'
import {
  Alert,
  Avatar,
  Box,
  Center,
  chakra,
  Divider,
  Flex,
  Text,
  useUpdateEffect,
} from '@chakra-ui/react'
import './Messages.css'
import { SearchIcon } from '@chakra-ui/icons'
import { isEmpty, orderBy } from 'lodash'
import { OptionText } from './OptionText'
import { UnreadIcon } from './UnreadIcon'
import { UserConversations } from './UserConversations'
import { useUser } from 'contexts/userContext'
import { unknownProfile } from 'utils'

const getFriend = (
  friends: FriendMinimal[],
  others: FriendMinimal[],
  senderId: number,
  recipientId: number
) => {
  const maybeFriend = friends.find(
    ({ id }) => id === senderId || id === recipientId
  )

  const maybeOther = others.find(
    ({ id }) => id === senderId || id === recipientId
  )

  return maybeFriend ?? maybeOther ?? unknownProfile
}

export const Messages = () => {
  const { dashboardStore, setDashboardStore, refreshStore } =
    useDashboardStore()
  const { conversations, friends, activeConversationId, others } =
    dashboardStore
  const [allConversations, setAllConversations] = useState<Conversation[]>([])
  const [active, setActive] = useState(-1)
  const [query, setQuery] = useState('')
  const { currentUser } = useUser()
  const eventRef = useRef<'mouse' | 'keyboard' | null>(null)

  const searchConversations = (term: string) => {
    if (term === '') {
      setAllConversations(conversations)
      return
    }
    const results = []

    const searchTerm = term.toLowerCase()
    for (let i = 0; i < conversations.length; i++) {
      const messages = conversations[i].messages.filter((message) =>
        message.body.toLowerCase().includes(searchTerm)
      )
      const { senderId, recipientId } = conversations[i]
      const maybeFriend = friends.find(
        ({ id }) => id === senderId || id === recipientId
      )
      const maybeOther = others.find(
        ({ id }) => id === senderId || id === recipientId
      )

      const friend = maybeFriend ?? maybeOther ?? unknownProfile

      if (messages.length > 0) {
        results.push({
          ...conversations[i],
          bottomMessage: messages[messages.length - 1],
        })
      } else if (
        friend.name.toLowerCase().includes(searchTerm) ||
        friend.username.toLowerCase().includes(searchTerm)
      ) {
        results.push({ ...conversations[i] })
      }
    }

    setAllConversations(results)
  }

  useEffect(() => {
    const sortedConversations = orderBy(
      conversations,
      (conv) => new Date(conv.messages[conv.messages.length - 1]?.createdAt),
      ['desc']
    )
    setAllConversations(sortedConversations)
  }, [conversations])

  useUpdateEffect(() => {
    setActive(0)
    searchConversations(query)
  }, [query])

  const clearSelectedConversation = () => {
    setDashboardStore((prevState) => ({
      ...prevState,
      activeConversationId: undefined,
    }))
  }
  const handleReadMessages = (messageIds: string[]) => {
    const messages = (
      conversations.filter((conv) => conv.id === activeConversationId)[0] ?? {}
    ).messages
    const msgs = [...(messages ?? [])] ?? []
    let count = 0
    for (let i = 0; i < msgs.length; i++) {
      if (msgs[i].id && messageIds.includes(msgs[i].id)) {
        msgs[i].read = true
        count++
      }
    }

    const activeConversation =
      conversations.filter((conv) => conv.id === activeConversationId)[0] ?? {}
    if (count > 0 && msgs && !isEmpty(activeConversation)) {
      activeConversation.messages = msgs
      const conversationUpdate = conversations.filter(
        (conv) => conv.id !== activeConversationId
      )
      setDashboardStore((prevState) => ({
        ...prevState,
        conversations: [...conversationUpdate, activeConversation],
      }))
      refreshStore().catch(console.error)
    }
  }

  const renderConversations = () => {
    return (
      <Box as="ul" role="listbox" pt={2} pb={4}>
        <Flex pos="relative" align="stretch">
          <chakra.input
            aria-autocomplete="list"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            rounded="lg"
            maxLength={64}
            sx={{
              w: '100%',
              h: '68px',
              pl: '68px',
              fontWeight: 'medium',
              outline: 0,
              bg: 'gray.100',
              '.chakra-ui-dark &': { bg: 'gray.700' },
            }}
            placeholder="Search messages"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Center pos="absolute" left={7} h="68px">
            <SearchIcon color="teal.500" boxSize="20px" />
          </Center>
        </Flex>
        <Divider
          sx={{
            mb: 4,
            mt: 4,
          }}
        />
        <div>
          {isEmpty(allConversations) && (
            <Alert status="warning">No messages</Alert>
          )}
          {(allConversations ?? []).map((conv, index) => {
            const { bottomMessage, messages, senderId, recipientId } = conv
            const lastMessage = bottomMessage ?? messages[messages.length - 1]

            const friend = getFriend(friends, others, senderId, recipientId)

            const unreadCount =
              messages.filter(
                (msg) => msg.senderId !== currentUser.id && !msg.read
              ).length ?? 0
            const selected = index === active
            const content = `${
              lastMessage.senderId === friend.id ? '' : 'You: '
            }${lastMessage.body}`

            return (
              <span key={conv.id} className="fake-link">
                <Box
                  as="li"
                  role="option"
                  key={conv.id}
                  aria-selected={selected ? true : undefined}
                  onMouseEnter={() => {
                    setActive(index)
                    eventRef.current = 'mouse'
                  }}
                  onClick={() =>
                    setDashboardStore((prevState) => ({
                      ...prevState,
                      activeConversationId: conv.id,
                    }))
                  }
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minH: 16,
                    mt: 2,
                    px: 4,
                    py: 2,
                    rounded: 'lg',
                    bg: 'gray.100',
                    '.chakra-ui-dark &': { bg: 'gray.600' },
                    _selected: {
                      bg: 'teal.500',
                      color: 'white',
                      mark: {
                        color: 'white',
                        textDecoration: 'underline',
                      },
                    },
                  }}
                >
                  <Avatar size="sm" src={friend.gravatar} />
                  <Box flex="1" ml="4">
                    <Box fontWeight="semibold">{friend.name}</Box>
                    <Text noOfLines={1}>
                      <OptionText
                        searchWords={[query]}
                        textToHighlight={content}
                      />
                    </Text>
                  </Box>
                  <UnreadIcon count={unreadCount} />
                </Box>
              </span>
            )
          })}
        </div>
      </Box>
    )
  }

  const renderMessages = () => {
    if (activeConversationId === undefined) {
      return renderConversations()
    } else {
      const activeConversation = conversations.filter(
        (conv) => conv.id === activeConversationId
      )[0]
      const { senderId, recipientId, messages, id } = activeConversation

      const maybeFriend = friends.find(
        ({ id }) => id === senderId || id === recipientId
      )
      const maybeOther = others.find(
        ({ id }) => id === senderId || id === recipientId
      )

      const friend = maybeFriend ?? maybeOther ?? unknownProfile

      return (
        <UserConversations
          friend={friend}
          messages={messages}
          handleBackwardsClick={clearSelectedConversation}
          handleReadMessages={handleReadMessages}
          conversationId={id}
        />
      )
    }
  }

  return (
    <>
      <Box
        width="100vh"
        sx={{
          px: 4,
          mt: 2,
        }}
      >
        {renderMessages()}
      </Box>
    </>
  )
}
