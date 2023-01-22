import {
  Alert,
  AlertIcon,
  Button,
  Checkbox,
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
  Select,
  Stack,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { SetStateAction, useState } from 'react'
import { useUser } from 'contexts/userContext'
import { Users } from 'api'
import { isEmpty } from 'lodash'
import { delay } from 'utils'
import { useApplication } from 'contexts/applictionContext'

export const Account = () => {
  const { currentUser, setLoggedIn, setCurrentUser } = useUser()
  const { showAppLoadingWithMessage, clearAppLoading } = useApplication()
  const [isSubmitting, setSubmitting] = useState(false)
  const [selected, setSelected] = useState('change-email')
  const [email, setEmail] = useState(currentUser.email ?? '')
  const [consented, setConsented] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSucess] = useState('')

  const modal = useDisclosure()

  const handleSubmit = async () => {
    let response
    setSubmitting(true)
    setError('')
    setSucess('')
    try {
      if (selected === 'change-email') {
        if (currentUser.email && email === currentUser.email) {
          setError('Email not changed')
          setSubmitting(false)
          return
        } else {
          response = await Users.changeEmailRequest(email, password)
        }
      } else if (selected === 'change-password') {
        if (
          isEmpty(oldPassword) ||
          isEmpty(password) ||
          isEmpty(confirmPassword)
        ) {
          setError('Password is not valid')
          setSubmitting(false)
          return
        } else if (password !== confirmPassword) {
          setError('Passwords do not match')
          setSubmitting(false)
          return
        } else if (
          oldPassword === password ||
          oldPassword === confirmPassword
        ) {
          setError('Old and new password cannot be the same')
          setSubmitting(false)
          return
        } else {
          response = await Users.changePassword(
            oldPassword,
            password,
            confirmPassword
          )
        }
      } else if (selected === 'resend-email-verification') {
        response = await Users.resendConfirmation()
      } else if (selected === 'delete-account') {
        if (isEmpty(password)) {
          setError('Password is not valid')
          setSubmitting(false)
          return
        } else if (!consented) {
          setError('You must acknowledge this action')
          setSubmitting(false)
          return
        } else {
          response = await Users.delete(password)
        }
      }

      setSubmitting(false)

      if (response?.status === 200) {
        switch (selected) {
          case 'delete-account':
            setSucess('Account deleted. You will be redirected in a moment')
            await delay(5000)
            showAppLoadingWithMessage('Redirecting')
            await delay(5000)
            clearAppLoading()
            setLoggedIn(false)
            setCurrentUser({})
            break
          case 'resend-email-verification':
            setSucess('Sent verification email')
            break
          case 'change-password':
            setSucess('Changed password')
            break
          case 'change-email':
            setSucess('Sent email to confirm email change')
            break
          default:
            break
        }
      } else {
        const data = await response?.json()
        const errorMessage = data.messages ? data.messages[0] : data.message
        setError(errorMessage ?? 'Something went wrong')
      }
    } catch (e) {
      console.error(e)
      setError('Something went wrong')
      setSubmitting(false)
    }
  }

  const handleSelectChange = (e: {
    target: { value: SetStateAction<string> }
  }) => {
    reset()
    setSelected(e.target.value)
  }

  const reset = () => {
    setError('')
    setSucess('')
    setEmail(currentUser.email ?? '')
  }

  const handleClose = () => {
    reset()
    modal.onClose()
  }

  return (
    <>
      <MenuItem onClick={modal.onOpen}>Account</MenuItem>
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
                  Account management
                </Heading>
                <Select
                  value={selected}
                  onChange={handleSelectChange}
                  disabled={isSubmitting}
                >
                  <option value="change-email">Change email</option>
                  <option value="change-password">Change password</option>
                  <option value="resend-email-verification">
                    Resend email verfication
                  </option>
                  <option value="delete-account">Delete account</option>
                </Select>
                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert status="success">
                    <AlertIcon />
                    {success}
                  </Alert>
                )}
                {selected === 'change-email' && (
                  <>
                    <FormControl id="email">
                      <FormLabel>Email</FormLabel>
                      <Input
                        placeholder="Email"
                        _placeholder={{ color: 'gray.500' }}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </FormControl>
                    <FormControl id="password">
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </FormControl>
                  </>
                )}
                {selected === 'change-password' && (
                  <>
                    <FormControl id="Oldpassword">
                      <FormLabel>Old Password</FormLabel>
                      <Input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                    </FormControl>
                    <FormControl id="Newpassword">
                      <FormLabel>New Password</FormLabel>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </FormControl>
                    <FormControl id="Confirmpassword">
                      <FormLabel>Confirm Password</FormLabel>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </FormControl>
                  </>
                )}
                {selected === 'delete-account' && (
                  <>
                    <FormControl id="">
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </FormControl>
                    <FormControl id="Deleteaccount">
                      <Checkbox
                        isChecked={consented}
                        onChange={(e) => setConsented(e.target.checked)}
                        isRequired
                      >
                        I acknowledge this action is permanent
                      </Checkbox>
                    </FormControl>
                  </>
                )}
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
                    {selected === 'resend-email-verification'
                      ? 'Send'
                      : 'Submit'}
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
