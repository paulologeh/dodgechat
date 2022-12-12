import { useDashboardStore } from 'contexts/dashboardContext'
import { useEffect, useRef, useState } from 'react'
import { Conversation } from 'types/api'
import {
  Avatar,
  Box,
  Center,
  chakra,
  Divider,
  Flex,
  Text,
} from '@chakra-ui/react'
import './Messages.css'
import { EnterIcon } from './EnterIcon'
import { SearchIcon } from '@chakra-ui/icons'

export const Messages = () => {
  const { dashboardStore } = useDashboardStore()
  const { conversations, friends } = dashboardStore
  const [allConversations, setAllConversations] = useState<Conversation[]>([])
  const [active, setActive] = useState(-1)
  const eventRef = useRef<'mouse' | null>(null)
  const [query] = useState('')

  useEffect(() => {
    setAllConversations(conversations)
  }, [conversations])

  return (
    <>
      <Box
        sx={{
          px: 4,
          mt: 2,
        }}
      >
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
              onChange={() => null}
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
          {(allConversations ?? []).map((conv, index) => {
            const lastMessage = conv.messages[0]
            const friend = friends.filter(
              (val) => val.id === conv.senderId || val.id === conv.recipientId
            )[0]
            const selected = index === active
            const isFriendLastMessage = lastMessage.senderId === friend.id

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
                      {isFriendLastMessage ? null : 'You: '}
                      {lastMessage.body}
                    </Text>
                  </Box>
                  <EnterIcon opacity={0.5} />
                </Box>
              </span>
            )
          })}
        </Box>
      </Box>
    </>
  )
}
