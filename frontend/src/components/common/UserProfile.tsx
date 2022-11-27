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
import { UserProfile } from 'types/api'
import { useDashboardStore } from 'contexts/dashboardContext'
import { getLastSeen, months } from 'utils/index'
import { useState } from 'react'
import { Relationships } from 'services'

type UserProfileModalProps = {
  open: boolean
  selectedUserProfile: UserProfile | null
}

type UserProfileButtonGroup = {
  add: boolean
  delete: boolean
  block: boolean
}

export const UserProfileModal = ({
  open,
  selectedUserProfile,
}: UserProfileModalProps) => {
  const [loading, setLoading] = useState<UserProfileButtonGroup>({
    add: false,
    delete: false,
    block: false,
  })
  const [disabled, setDisabled] = useState<UserProfileButtonGroup>({
    add: false,
    delete: false,
    block: false,
  })
  const { setDashboardStore } = useDashboardStore()

  const getJoined = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear() // 2019
    const month = d.getMonth() // 12
    if (month > 12 || month < 1) return ''
    return `Joined ${months[month - 1]} ${year}`
  }

  const handleClick = async (button: string) => {
    if (!selectedUserProfile?.username) return

    setLoading({ ...loading, [button]: true })
    try {
      let response

      if (button === 'add')
        response = await Relationships.addUser(selectedUserProfile.username)
      if (button === 'delete')
        response = await Relationships.deleteUser(selectedUserProfile.username)
      if (button === 'block')
        response = await Relationships.blockUser(selectedUserProfile.username)

      if (!response) {
        console.error('undefined response')
        setDashboardStore((prevState) => ({
          ...prevState,
          modalError: 'Something went wrong. Please try again',
          openErrorModal: true,
        }))
      } else if (response.status === 200) {
        const refetchResponse = await Relationships.getFriends()
        if (refetchResponse.status === 200) {
          const data = await refetchResponse.json()
          setDashboardStore((prevState) => ({
            ...prevState,
            friendRequests: data.friendRequests,
            friends: data.friends,
          }))
        }
        setLoading({ ...loading, [button]: false })
        setDisabled({ ...disabled, [button]: true })
      } else {
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
    }
  }

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
                  src={selectedUserProfile?.gravatar}
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
                  {selectedUserProfile?.name}
                </Heading>
                <Text fontWeight={600} color={'gray.500'} size="sm" mb={4}>
                  {'@'}
                  {selectedUserProfile?.username}
                </Text>
                {selectedUserProfile?.aboutMe && (
                  <Text textAlign={'center'} px={3}>
                    <i>{selectedUserProfile.aboutMe}</i>
                  </Text>
                )}
                <Stack
                  align={'center'}
                  justify={'center'}
                  direction={'column'}
                  mt={6}
                >
                  {selectedUserProfile?.numberOfFriends && (
                    <Badge px={2} py={1} fontWeight={'400'}>
                      {selectedUserProfile.numberOfFriends}
                      {' friends'}
                    </Badge>
                  )}
                  {selectedUserProfile?.lastSeen && (
                    <Badge px={2} py={1} fontWeight={'400'}>
                      {'Last seen: '}
                      {getLastSeen(selectedUserProfile.lastSeen)}
                    </Badge>
                  )}
                  {selectedUserProfile?.memberSince && (
                    <Badge px={2} py={1} fontWeight={'400'}>
                      {getJoined(selectedUserProfile.memberSince)}
                    </Badge>
                  )}
                  {selectedUserProfile?.location && (
                    <Badge px={2} py={1} fontWeight={'400'}>
                      {'Location: '}
                      {selectedUserProfile.location}
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
                  {selectedUserProfile?.relationshipState === null && (
                    <Button
                      flex={1}
                      fontSize={'sm'}
                      rounded={'full'}
                      colorScheme={'blue'}
                      isLoading={loading.add}
                      isDisabled={disabled.add}
                      onClick={() => handleClick('add')}
                    >
                      Add
                    </Button>
                  )}
                  {selectedUserProfile?.relationshipState === 'ACCEPTED' && (
                    <Button
                      flex={1}
                      fontSize={'sm'}
                      rounded={'full'}
                      colorScheme={'red'}
                      isLoading={loading.delete}
                      isDisabled={disabled.delete}
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
                    isLoading={loading.block}
                    isDisabled={
                      (disabled.block ||
                        selectedUserProfile?.relationshipState === 'BLOCKED') ??
                      false
                    }
                    onClick={() => handleClick('block')}
                  >
                    {selectedUserProfile?.relationshipState === 'BLOCKED'
                      ? 'Blocked'
                      : 'Block'}
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
