import { Avatar, Box, Button, ButtonGroup, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Relationships } from 'api'
import { useApplication } from 'contexts/applictionContext'

type FriendRequestProps = {
  username: string
  gravatar: string
}

export const FriendRequest = ({ username, gravatar }: FriendRequestProps) => {
  const [loading, setLoading] = useState({
    accept: false,
    decline: false,
  })
  const { syncData, requestOrAppError } = useApplication()

  const handleClick = async (button: string) => {
    setLoading({ ...loading, [button]: true })

    const request = async () => {
      if (button === 'accept') {
        return Relationships.addUser(username)
      } else if (button === 'decline') {
        return Relationships.deleteUser(username)
      } else {
        return new Response()
      }
    }

    await requestOrAppError('TOAST', null, request)
    await syncData(true)
    setLoading({ ...loading, [button]: false })
  }

  return (
    <Box w={'full'} p={2} textAlign={'center'}>
      <Avatar src={gravatar} pos={'relative'} mb={2} />
      <Text mb={2}>{username} added you as a friend</Text>
      <ButtonGroup gap="2" size={'sm'}>
        <Button
          colorScheme="green"
          isLoading={loading.accept}
          onClick={() => handleClick('accept')}
        >
          Accept
        </Button>
        <Button
          colorScheme="red"
          isLoading={loading.decline}
          onClick={() => handleClick('decline')}
        >
          Decline
        </Button>
      </ButtonGroup>
    </Box>
  )
}
