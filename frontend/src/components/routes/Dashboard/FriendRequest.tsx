import { Avatar, Box, Button, ButtonGroup, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useDashboardStore } from 'contexts/dashboardContext'
import { Relationships } from 'services'

type FriendRequestProps = {
  username: string
  gravatar: string
}

export const FriendRequest = ({ username, gravatar }: FriendRequestProps) => {
  const [loading, setLoading] = useState({
    accept: false,
    decline: false,
  })
  const { setDashboardStore } = useDashboardStore()

  const handleClick = async (button: string) => {
    const cleanUp = () => {
      setLoading({ ...loading, [button]: false })
    }
    setLoading({ ...loading, [button]: true })

    try {
      let response

      if (button === 'accept') {
        response = await Relationships.addUser(username)
      } else if (button === 'decline') {
        response = await Relationships.deleteUser(username)
      } else {
        console.error('unrecognised button')
        cleanUp()
        setDashboardStore((prevState) => ({
          ...prevState,
          modalError: 'Something went wrong. Please try again',
          openErrorModal: true,
        }))
        return
      }

      if (response && response.status === 200) {
        const refetchResponse = await Relationships.getFriends()
        const data = await refetchResponse.json()
        cleanUp()
        setDashboardStore((prevState) => ({
          ...prevState,
          friendRequests: data.friendRequests,
          friends: data.friends,
        }))
      } else {
        const data = await response.json()
        setDashboardStore((prevState) => ({
          ...prevState,
          modalError: data.message,
          openErrorModal: true,
        }))
      }
    } catch (error) {
      console.error(error)
      cleanUp()
      setDashboardStore((prevState) => ({
        ...prevState,
        modalError: 'Something went wrong. Please try again',
        openErrorModal: true,
      }))
    }
  }

  return (
    <Box w={'full'} p={2} textAlign={'center'}>
      <Avatar src={gravatar} pos={'relative'} mb={2} />
      <Text mb={2}>{username}</Text>
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
