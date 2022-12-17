import { useDashboardStore } from 'contexts/dashboardContext'
import { useEffect, useRef, useState } from 'react'
import { Conversation, Message } from 'types/api'
import {
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
import { SearchNoResults } from '../Search/SearchModal'
import { isEmpty } from 'lodash'
import { OptionText } from './OptionText'
import { UnreadIcon } from './UnreadIcon'
import { UserConversations } from './UserConversations'
import { useAuth } from 'contexts/userContext'

export const Messages = () => {
  const { dashboardStore, refreshStore } = useDashboardStore()
  const { conversations, friends } = dashboardStore
  const [allConversations, setAllConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<
    Conversation | undefined
  >(undefined)
  const [active, setActive] = useState(-1)
  const [query, setQuery] = useState('')
  const { currentUser } = useAuth()
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
      const friend = friends.filter(
        (friend) => friend.id === senderId || friend.id == recipientId
      )[0]
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
    setAllConversations(conversations)
  }, [conversations])

  useUpdateEffect(() => {
    setActive(0)
    searchConversations(query)
  }, [query])

  const clearSelectedConversation = () => {
    setSelectedConversation(undefined)
  }

  const handleMoreMessages = (msgs: Message[]) => {
    if (!isEmpty(selectedConversation) && !isEmpty(msgs)) {
      const conversationUpdate = { ...selectedConversation }
      conversationUpdate.messages = msgs
      setSelectedConversation(conversationUpdate)
    }
  }

  const handleReadMessages = (messageIds: string[]) => {
    const { messages } = selectedConversation ?? {}

    const msgs = [...(messages ?? [])] ?? []
    let count = 0
    for (let i = 0; i < msgs.length; i++) {
      if (msgs[i].id && messageIds.includes(msgs[i].id)) {
        msgs[i].read = true
        count++
      }
    }

    if (count > 0 && msgs && !isEmpty(selectedConversation)) {
      const conversationUpdate = { ...selectedConversation }
      conversationUpdate.messages = msgs
      setSelectedConversation(conversationUpdate)
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
          {isEmpty(allConversations) && <SearchNoResults />}
          {(allConversations ?? []).map((conv, index) => {
            const { bottomMessage, messages } = conv
            const lastMessage = bottomMessage ?? messages[messages.length - 1]
            const friend = friends.filter(
              (val) => val.id === conv.senderId || val.id === conv.recipientId
            )[0]
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
                  onClick={() => setSelectedConversation(conv)}
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
    if (isEmpty(selectedConversation)) {
      return renderConversations()
    } else {
      const { senderId, recipientId, messages, id } = selectedConversation
      const friend = friends.filter(
        (friend) => friend.id === senderId || friend.id == recipientId
      )[0]

      return (
        <UserConversations
          friend={friend}
          messages={messages}
          handleBackwardsClick={clearSelectedConversation}
          handleReadMessages={handleReadMessages}
          handleMoreMessages={handleMoreMessages}
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
