import { Friend } from './Friend'
import { Text, Wrap, WrapItem } from '@chakra-ui/react'
import { FriendMinimal } from 'types/api'

type FriendsProps = {
  friends: FriendMinimal[]
}

export const Friends = ({ friends }: FriendsProps) => {
  return (
    <>
      {friends && (
        <Wrap spacing="30px">
          {friends.length === 0 ? (
            <Text>{"You don't have any friends"}</Text>
          ) : (
            friends.map((friendData, index) => (
              <WrapItem key={index}>
                <Friend friendData={friendData} />
              </WrapItem>
            ))
          )}
        </Wrap>
      )}
    </>
  )
}
