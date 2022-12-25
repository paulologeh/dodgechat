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
import { useApplication } from 'contexts/applictionContext'
import { isEmpty } from 'lodash'

export const Notifications = () => {
  const { userRequests } = useApplication()
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="notifications"
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
            {!isEmpty(userRequests) ? (
              userRequests.map(({ username, gravatar }) => (
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
}
