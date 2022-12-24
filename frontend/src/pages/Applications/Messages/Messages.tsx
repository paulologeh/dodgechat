import { useEffect, useRef, useState } from 'react'
import { Conversation } from 'types/api'
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
import { UserConversation } from './UserConversation'
import { useUser } from 'contexts/userContext'
import { useApplication } from 'contexts/applictionContext'

export const Messages = () => {
  const {
    userConversations,
    getUserById,
    setActiveConversation,
    activeConversation,
  } = useApplication()
  const [results, setResults] = useState<Conversation[]>()
  const [active, setActive] = useState(-1)
  const [query, setQuery] = useState('')
  const { currentUser } = useUser()
  const eventRef = useRef<'mouse' | 'keyboard' | null>(null)

  const setSortedResults = (results: Conversation[]) => {
    const sortedResults = orderBy(
      results,
      (conv) => new Date(conv.messages[conv.messages.length - 1]?.createdAt),
      ['desc']
    )
    setResults(sortedResults)
  }

  const searchConversations = (term: string) => {
    if (term === '') {
      setSortedResults(userConversations)
      return
    }
    const searchResults = []

    const searchTerm = term.toLowerCase()
    for (let i = 0; i < userConversations.length; i++) {
      const messages = userConversations[i].messages.filter((message) =>
        message.body.toLowerCase().includes(searchTerm)
      )
      const { senderId, recipientId } = userConversations[i]
      const userId = senderId === currentUser.id ? recipientId : senderId
      const user = getUserById(userId)

      if (messages.length > 0) {
        searchResults.push({
          ...userConversations[i],
          bottomMessage: messages[messages.length - 1],
        })
      } else if (
        user.name.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm)
      ) {
        searchResults.push({ ...userConversations[i] })
      }
    }

    setSortedResults(searchResults)
  }

  useEffect(() => {
    setSortedResults(userConversations)
  }, [userConversations])

  useUpdateEffect(() => {
    setActive(0)
    searchConversations(query)
  }, [query])

  const showAllConversations = () => {
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
          {isEmpty(results) && <Alert status="warning">No messages</Alert>}
          {(results ?? []).map((conv, index) => {
            const { bottomMessage, messages, senderId, recipientId } = conv
            const lastMessage = bottomMessage ?? messages[messages.length - 1]
            const userId = senderId === currentUser.id ? recipientId : senderId
            const user = getUserById(userId)

            const unreadCount =
              messages.filter(
                (msg) => msg.senderId !== currentUser.id && !msg.read
              ).length ?? 0
            const selected = index === active
            const content = `${
              lastMessage.senderId === user.id ? '' : 'You: '
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
                  onClick={() => setActiveConversation(conv.id)}
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
                  <Avatar size="sm" src={user.gravatar} />
                  <Box flex="1" ml="4">
                    <Box fontWeight="semibold">{user.name}</Box>
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

  return (
    <>
      <Box
        width="100vh"
        sx={{
          px: 4,
          mt: 2,
        }}
      >
        {activeConversation === undefined ? (
          showAllConversations()
        ) : (
          <UserConversation conversation={activeConversation} />
        )}
      </Box>
    </>
  )
}
