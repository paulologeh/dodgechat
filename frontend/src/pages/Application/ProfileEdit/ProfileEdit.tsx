import {
  Alert,
  AlertIcon,
  Avatar,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  Stack,
  Textarea,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useState } from 'react'
import type { CurrentUser } from 'contexts/userContext'
import { useUser } from 'contexts/userContext'
import { UserUpdate } from 'types/api'
import { Users } from 'api'
import { isEmpty } from 'lodash'
import { getGravatarUrl } from 'utils'

export const ProfileEdit = ({ currentUser }: { currentUser: CurrentUser }) => {
  const [formData, setFormData] = useState<CurrentUser>({ ...currentUser })
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { setCurrentUser } = useUser()
  const modal = useDisclosure()

  const handleSubmit = async () => {
    const userUpdate: UserUpdate = {
      ...(formData.name !== currentUser.name && { name: formData.name }),
      ...(formData.username !== currentUser.username && {
        username: formData.username,
      }),
      ...(formData.aboutMe !== currentUser.aboutMe && {
        aboutMe: formData.aboutMe,
      }),
      ...(formData.location !== currentUser.location && {
        location: formData.location,
      }),
    }
    setSuccess(false)
    setError('')

    if (isEmpty(userUpdate)) {
      setError('No changes were made')
      return
    }

    setSubmitting(true)
    try {
      const response = await Users.update(userUpdate)
      const data = await response.json()
      if (response.status === 200) {
        setCurrentUser(data)
        setSuccess(true)
      } else {
        setError(data.message ?? 'Something went wrong. Please try again later')
        setFormData({ ...currentUser })
      }
    } catch (error) {
      console.error(error)
      setError('Something went wrong. Please try again later')
    }
    setSubmitting(false)
  }

  const handleClose = () => {
    setError('')
    setSuccess(false)
    modal.onClose()
  }
  const displayGravatar =
    formData.avatarHash && formData.email
      ? getGravatarUrl(formData.avatarHash, formData.email, 100)
      : undefined

  return (
    <>
      <MenuItem onClick={modal.onOpen}>Profile</MenuItem>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.isOpen}
        onClose={handleClose}
        blockScrollOnMount={false}
      >
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Flex align={'center'} justify={'center'}>
              <Stack
                spacing={4}
                w={'full'}
                maxW={'md'}
                bg={useColorModeValue('white', 'gray.700')}
                py={6}
              >
                <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
                  User Profile Edit
                </Heading>
                <FormControl id="userIcon">
                  <Stack direction={['column', 'row']} spacing={6}>
                    <Center>
                      <Avatar size="xl" src={displayGravatar}></Avatar>
                    </Center>
                    <Center w="full">
                      <Button
                        w="full"
                        onClick={() =>
                          window.location.replace('https://gravatar.com')
                        }
                      >
                        Change gravatar
                      </Button>
                    </Center>
                  </Stack>
                </FormControl>
                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert status="success">
                    <AlertIcon />
                    {'Successfully updated'}
                  </Alert>
                )}
                <FormControl id="userName">
                  <FormLabel>Username</FormLabel>
                  <Input
                    placeholder="UserName"
                    _placeholder={{ color: 'gray.500' }}
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl id="name">
                  <FormLabel>Name</FormLabel>
                  <Input
                    placeholder="Jane Doe"
                    _placeholder={{ color: 'gray.500' }}
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl id="location">
                  <FormLabel>Location</FormLabel>
                  <Input
                    placeholder="London, United Kingdom"
                    _placeholder={{ color: 'gray.500' }}
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl id="aboutMe">
                  <FormLabel>About me</FormLabel>
                  <Textarea
                    value={formData.aboutMe}
                    onChange={(e) =>
                      setFormData({ ...formData, aboutMe: e.target.value })
                    }
                  />
                </FormControl>
                <Stack spacing={6} direction={['column', 'row']}>
                  <Button
                    bg={'red.400'}
                    color={'white'}
                    w="full"
                    _hover={{
                      bg: 'red.500',
                    }}
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    bg={'blue.400'}
                    color={'white'}
                    w="full"
                    _hover={{
                      bg: 'blue.500',
                    }}
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </Stack>
              </Stack>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
