import {
  Avatar,
  Badge,
  Box,
  Button,
  Heading,
  Icon,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { GrLocationPin } from 'react-icons/gr'
import { FriendMinimal } from 'types/api'
import { useState } from 'react'
import { Search as SearchService } from 'services'
import { useDashboardStore } from 'contexts/dashboardContext'
import { getLastSeen } from 'utils'

type FriendProp = {
  friendData: FriendMinimal
}

type FriendButtonGroup = {
  message: boolean
  view: boolean
}

export const Friend = ({ friendData }: FriendProp) => {
  const [loading, setLoading] = useState<FriendButtonGroup>({
    message: false,
    view: false,
  })
  const { setDashboardStore } = useDashboardStore()
  const toast = useToast()

  const { gravatar, name, username, aboutMe, location, lastSeen } = friendData

  const handleFriendView = async () => {
    setLoading((prevState) => ({ ...prevState, view: true }))
    try {
      const response = await SearchService.searchUser(username)
      const responseData = await response.json()
      if (response.status === 200) {
        setDashboardStore((prevState) => ({
          ...prevState,
          openUserProfileModal: true,
          selectedUserProfile: responseData,
        }))
      } else {
        toast({
          title: 'Unable to view profile',
          description: responseData.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Unable to view profile',
        description:
          "We've cannot view this user's profile right now. Try again later",
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }
    setLoading((prevState) => ({ ...prevState, view: false }))
  }

  const isOnline = Boolean(lastSeen && getLastSeen(lastSeen) === 'Now')
  const onlineStyle = {
    content: '""',
    w: 4,
    h: 4,
    bg: 'green.300',
    border: '2px solid white',
    rounded: 'full',
    pos: 'absolute',
    bottom: 0,
    right: 3,
  }

  return (
    <Box
      maxW={'320px'}
      minW={'240px'}
      w={'full'}
      bg={useColorModeValue('white', 'gray.900')}
      rounded={'lg'}
      p={6}
      textAlign={'center'}
    >
      <Avatar
        size={'xl'}
        src={gravatar}
        mb={4}
        pos={'relative'}
        _after={isOnline ? onlineStyle : undefined}
      />
      <Heading fontSize={'2xl'} fontFamily={'body'}>
        {name}
      </Heading>
      <Text fontWeight={600} color={'gray.500'} mb={4}>
        {'@'}
        {username}
      </Text>
      <Text
        textAlign={'center'}
        color={useColorModeValue('gray.700', 'gray.400')}
        px={3}
      >
        {aboutMe}
      </Text>
      <Stack align={'center'} justify={'center'} direction={'row'} mt={6}>
        <Icon as={GrLocationPin} />
        <Badge
          px={2}
          py={1}
          bg={useColorModeValue('gray.50', 'gray.800')}
          fontWeight={'400'}
        >
          {location}
        </Badge>
      </Stack>

      <Stack mt={8} direction={'row'} spacing={4}>
        <Button
          flex={1}
          fontSize={'sm'}
          rounded={'full'}
          _focus={{
            bg: 'gray.200',
          }}
          isLoading={loading.message}
        >
          Message
        </Button>
        <Button
          flex={1}
          fontSize={'sm'}
          rounded={'full'}
          bg={'blue.400'}
          color={'white'}
          boxShadow={
            '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
          }
          _hover={{
            bg: 'blue.500',
          }}
          _focus={{
            bg: 'blue.500',
          }}
          isLoading={loading.view}
          onClick={handleFriendView}
        >
          View
        </Button>
      </Stack>
    </Box>
  )
}
