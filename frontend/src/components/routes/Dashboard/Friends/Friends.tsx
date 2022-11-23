import { Friend } from './Friend'
import { SimpleGrid, Text } from '@chakra-ui/react'
import { FriendMinimal } from 'types/api'

type FriendsProps = {
  friends: FriendMinimal[]
}

export const Friends = ({ friends }: FriendsProps) => {
  return (
    <>
      {friends && (
        <SimpleGrid minChildWidth={320} spacing={10}>
          {friends.length === 0 ? (
            <Text>{"You don't have any friends"}</Text>
          ) : (
            friends.map((friendData, index) => (
              <Friend key={index} friendData={friendData} />
            ))
          )}
        </SimpleGrid>
      )}
    </>
  )
}
