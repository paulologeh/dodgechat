import {
  Badge,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useDashboardStore } from 'contexts/dashboardContext'
import { getLastSeen, months } from 'utils/index'
import { useState } from 'react'
import { Relationships, Search as SearchService } from 'services'

type UserProfileModalProps = {
  open: boolean
}

type UserProfileButtonGroup = {
  add: boolean
  delete: boolean
  block: boolean
  unblock: boolean
}

const getJoined = (date: Date) => {
  const d = new Date(date)
  const year = d.getFullYear() // 2019
  const month = d.getMonth() // 12
  if (month > 12 || month < 1) return ''
  return `Joined ${months[month - 1]} ${year}`
}

export const UserProfileModal = ({ open }: UserProfileModalProps) => {
  const [loading, setLoading] = useState<UserProfileButtonGroup>({
    add: false,
    delete: false,
    block: false,
    unblock: false,
  })
  const { dashboardStore, setDashboardStore } = useDashboardStore()
  const { selectedUser } = dashboardStore

  const refetch = async (username: string) => {
    setDashboardStore((prevState) => ({
      ...prevState,
      loading: true,
      loadingMessage: 'Refetching User',
    }))
    const response = await SearchService.searchUser(username)
    const friendsResponse = await Relationships.getFriends()

    if (response.status === 200 && friendsResponse.status === 200) {
      const user = await response.json()
      const friends = await friendsResponse.json()
      setDashboardStore((prevState) => ({
        ...prevState,
        selectedUser: user,
        friendRequests: friends.friendRequests,
        friends: friends.friends,
        loading: false,
        loadingMessage: '',
      }))
    } else {
      setDashboardStore((prevState) => ({
        ...prevState,
        modalError: 'Something went wrong. Please try again later',
        openErrorModal: true,
        loading: false,
        loadingMessage: '',
      }))
    }
  }

  const handleClick = async (button: string) => {
    if (!selectedUser?.username) return

    setLoading({ ...loading, [button]: true })

    try {
      let response

      if (button === 'add')
        response = await Relationships.addUser(selectedUser.username)
      else if (button === 'delete')
        response = await Relationships.deleteUser(selectedUser.username)
      else if (button === 'block')
        response = await Relationships.blockUser(selectedUser.username)
      else if (button === 'unblock')
        response = await Relationships.unBlockUser(selectedUser.username)

      if (!response) {
        console.error('undefined response')
        setDashboardStore((prevState) => ({
          ...prevState,
          modalError: 'Something went wrong. Please try again',
          openErrorModal: true,
        }))
      } else if (response.status !== 200) {
        const data = await response.json()
        setLoading({ ...loading, [button]: false })
        setDashboardStore((prevState) => ({
          ...prevState,
          modalError: data.message,
          openErrorModal: true,
        }))
      }
    } catch (error) {
      console.error(error)
      setDashboardStore((prevState) => ({
        ...prevState,
        modalError: 'Something went wrong. Please try again',
        openErrorModal: true,
      }))
    } finally {
      setLoading({ ...loading, [button]: false })
      await refetch(selectedUser.username)
    }
  }

  const isBlocked = selectedUser?.relationshipState === 'BLOCKED'
  return (
    <Modal
      isOpen={open}
      onClose={() => {
        setDashboardStore((prevState) => ({
          ...prevState,
          openUserProfileModal: false,
        }))
      }}
      size={'3xl'}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <Center py={6}>
            <Stack
              w={{ sm: '100%', md: '540px' }}
              height={{ sm: '476px', md: '20rem' }}
              direction={{ base: 'column', md: 'row' }}
              padding={4}
            >
              <Flex flex={1} bg="blue.200">
                <Image
                  objectFit="cover"
                  boxSize="100%"
                  src={selectedUser?.gravatar}
                />
              </Flex>
              <Stack
                flex={1}
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                p={1}
                pt={2}
              >
                <Heading fontSize={'2xl'} fontFamily={'body'}>
                  {selectedUser?.name}
                </Heading>
                <Text fontWeight={600} color={'gray.500'} size="sm" mb={4}>
                  {'@'}
                  {selectedUser?.username}
                </Text>
                {selectedUser?.aboutMe && (
                  <Text textAlign={'center'} px={3}>
                    <i>{selectedUser.aboutMe}</i>
                  </Text>
                )}
                <Stack
                  align={'center'}
                  justify={'center'}
                  direction={'column'}
                  mt={6}
                >
                  {selectedUser?.numberOfFriends && (
                    <Badge px={2} py={1} fontWeight={'400'}>
                      {selectedUser.numberOfFriends}
                      {selectedUser.numberOfFriends === 1
                        ? ' friend'
                        : ' friends'}
                    </Badge>
                  )}
                  {selectedUser?.lastSeen && (
                    <Badge px={2} py={1} fontWeight={'400'}>
                      {'Last seen: '}
                      {getLastSeen(selectedUser.lastSeen)}
                    </Badge>
                  )}
                  {selectedUser?.memberSince && (
                    <Badge px={2} py={1} fontWeight={'400'}>
                      {getJoined(selectedUser.memberSince)}
                    </Badge>
                  )}
                  {selectedUser?.location && (
                    <Badge px={2} py={1} fontWeight={'400'}>
                      {'Location: '}
                      {selectedUser.location}
                    </Badge>
                  )}
                </Stack>
                <Stack
                  width={'100%'}
                  mt={'2rem'}
                  direction={'row'}
                  padding={2}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                >
                  {selectedUser?.relationshipState === null && (
                    <Button
                      flex={1}
                      fontSize={'sm'}
                      rounded={'full'}
                      colorScheme={'blue'}
                      isLoading={loading.add}
                      onClick={() => handleClick('add')}
                    >
                      Add
                    </Button>
                  )}
                  {selectedUser?.relationshipState === 'ACCEPTED' && (
                    <Button
                      flex={1}
                      fontSize={'sm'}
                      rounded={'full'}
                      colorScheme={'red'}
                      isLoading={loading.delete}
                      onClick={() => handleClick('delete')}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    flex={1}
                    fontSize={'sm'}
                    rounded={'full'}
                    colorScheme={'gray'}
                    isLoading={loading.block || loading.unblock}
                    onClick={() => handleClick(isBlocked ? 'unblock' : 'block')}
                  >
                    {isBlocked ? 'Unblock' : 'Block'}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Center>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
