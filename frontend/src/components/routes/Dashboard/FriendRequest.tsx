import { Avatar, Box, Button, ButtonGroup, Text } from '@chakra-ui/react'

type FriendRequestProps = {
  username: string
  gravatar: string
}

export const FriendRequest = ({ username, gravatar }: FriendRequestProps) => {
  return (
    <Box w={'full'} p={2} textAlign={'center'}>
      <Avatar src={gravatar} pos={'relative'} mb={2} />
      <Text mb={2}>{username}</Text>
      <ButtonGroup gap="2" size={'sm'}>
        <Button colorScheme="green">Accept</Button>
        <Button colorScheme="red">Decline</Button>
      </ButtonGroup>
    </Box>
  )
}
