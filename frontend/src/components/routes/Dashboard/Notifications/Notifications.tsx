import {
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react'
import { FiBell } from 'react-icons/fi'
import { FriendRequest } from './FriendRequest'
import { FriendMinimal } from 'types/api'

export const Notifications = ({
  friendRequests,
}: {
  friendRequests: FriendMinimal[]
}) => (
  <Popover>
    <PopoverTrigger>
      <IconButton
        size="lg"
        variant="ghost"
        aria-label="open menu"
        icon={<FiBell />}
      />
    </PopoverTrigger>
    <PopoverContent>
      <PopoverHeader pt={4} fontWeight="bold">
        Notifications
      </PopoverHeader>
      <PopoverArrow />
      <PopoverBody>
        <div>
          {friendRequests && friendRequests.length > 0 ? (
            friendRequests.map(({ username, gravatar }) => (
              <FriendRequest
                username={username}
                gravatar={gravatar}
                key={username}
              />
            ))
          ) : (
            <Text>Nothing to see here!</Text>
          )}
        </div>
      </PopoverBody>
    </PopoverContent>
  </Popover>
)
