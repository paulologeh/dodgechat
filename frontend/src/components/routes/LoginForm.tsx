import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { Users } from 'services'
import { useAuth } from 'contexts/userContext'
import { validateEmail } from '../../utils'

type LoginFormState = {
  emailOrUsername: string
  password: string
}

type LoginFormError = {
  emailOrUsername: string
  password: string
  request: string
}

const emptyError = {
  emailOrUsername: '',
  password: '',
  request: '',
}

export const LoginForm = () => {
  const [state, setState] = useState<LoginFormState>({
    emailOrUsername: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<LoginFormError>(emptyError)
  const { setLoggedIn, setCurrentUser } = useAuth()

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!submitted) {
      setSubmitted(true)
    }

    setError(emptyError)

    if (
      state.emailOrUsername.includes('@') &&
      !validateEmail(state.emailOrUsername)
    ) {
      setError((prevState) => ({
        ...prevState,
        emailOrUsername: 'Email is invalid',
      }))
      return
    }

    if (state.password.length < 5) {
      setError((prevState) => ({
        ...prevState,
        password: 'Password must be at least 5 characters',
      }))
      return
    }

    setLoading(true)

    try {
      const response = await Users.login(state.emailOrUsername, state.password)
      if (response.status === 200) {
        const data = await response.json()
        setLoggedIn(true)
        setCurrentUser(data)
      } else {
        const data = await response.json()
        const errorMessage = data['messages'][0] ?? data['message']
        setError((prevState) => ({ ...prevState, request: errorMessage }))
        setLoading(false)
      }
    } catch (error) {
      setError((prevState) => ({
        ...prevState,
        result: 'Server error, please try again later',
      }))
      setLoading(false)
    }
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx="auto" maxW="lg" minW="md" py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Sign in to your account</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            to start chatting and dodging ✌️
          </Text>
        </Stack>
        <Box
          rounded="lg"
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow="lg"
          p={8}
        >
          <Stack py={2}>
            {error.request && (
              <Alert status="error">
                <AlertIcon />
                {error.request}
              </Alert>
            )}
          </Stack>
          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              <FormControl
                id="email-username"
                isRequired
                isInvalid={
                  submitted &&
                  (state.emailOrUsername === '' || error.emailOrUsername !== '')
                }
              >
                <FormLabel>Email or Username</FormLabel>
                <Input
                  type="text"
                  value={state.emailOrUsername}
                  onChange={(e) =>
                    setState((prevState) => ({
                      ...prevState,
                      emailOrUsername: e.target.value,
                    }))
                  }
                />
                <FormErrorMessage>{error.emailOrUsername}</FormErrorMessage>
              </FormControl>
              <FormControl
                id="password"
                isRequired
                isInvalid={
                  submitted && (state.password === '' || error.password !== '')
                }
              >
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={state.password}
                  onChange={(e) =>
                    setState((prevState) => ({
                      ...prevState,
                      password: e.target.value,
                    }))
                  }
                />
                <FormErrorMessage>{error.password}</FormErrorMessage>
              </FormControl>
              <Stack spacing={10}>
                <Stack
                  direction={{ base: 'column', sm: 'row' }}
                  align="start"
                  justify="space-between"
                >
                  <Checkbox>Remember me</Checkbox>
                  <Link
                    as={ReactRouterLink}
                    color="blue.400"
                    to="/forgotpassword"
                  >
                    Forgot password?
                  </Link>
                </Stack>
                <Button
                  bg="blue.400"
                  color="white"
                  _hover={{
                    bg: 'blue.500',
                  }}
                  type="submit"
                  isLoading={loading}
                >
                  Sign in
                </Button>
              </Stack>

              <Stack pt={6}>
                <Text align="center">
                  New to us ?{' '}
                  <Link as={ReactRouterLink} color="blue.400" to="/register">
                    Register
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  )
}
