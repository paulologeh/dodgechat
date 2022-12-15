import { FriendMinimal, Message } from 'types/api'
import { Avatar, AvatarBadge, Box, Divider, IconButton } from '@chakra-ui/react'
import { FiChevronLeft } from 'react-icons/fi'
import { getLastSeen } from 'utils'
import { useAuth } from 'contexts/userContext'
import { MessageBubble } from './MessageBubble'

type UserConversationsProp = {
  friend: FriendMinimal
  messages: Message[]
  handleBackwardsClick: () => void
}

export const UserConversations = ({
  friend,
  messages,
  handleBackwardsClick,
}: UserConversationsProp) => {
  const { lastSeen } = friend
  const isOnline = lastSeen && getLastSeen(lastSeen) === 'Now'
  const { currentUser } = useAuth()

  return (
    <Box pt={2} pb={4}>
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
      <Box>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            body={msg.body}
            isSender={currentUser.id === msg.senderId}
          />
        ))}
      </Box>
    </Box>
  )
}
