import { useDashboardStore } from 'contexts/dashboardContext'
import { useEffect, useRef, useState } from 'react'
import { Conversation } from 'types/api'
import { Avatar, Box, Text } from '@chakra-ui/react'
import './Messages.css'

export const Messages = () => {
  const { dashboardStore } = useDashboardStore()
  const { conversations, friends } = dashboardStore
  const [allConversations, setAllConversations] = useState<Conversation[]>([])
  const [active, setActive] = useState(-1)
  const eventRef = useRef<'mouse' | null>(null)

  useEffect(() => {
    setAllConversations(conversations)
  }, [conversations])

  return (
    <Box
      sx={{
        px: 4,
      }}
    >
      <Box as="ul" role="listbox" pt={2} pb={4}>
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
              </Box>
            </span>
          )
        })}
      </Box>
    </Box>
  )
}
