import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
  Alert,
  AlertIcon,
  FormErrorMessage,
} from '@chakra-ui/react'
import { useState } from 'react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom'
import { Auth } from 'services'

type StateType = {
  email: string
  password: string
  name: string
  username: string
  confirmPassword: string
}

type ErrorType = {
  password: string
  request: string
}

const emptyError = {
  password: '',
  request: '',
}

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [state, setState] = useState<StateType>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorType>(emptyError)
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!submitted) {
      setSubmitted(true)
    }

    if (state.confirmPassword !== state.password) {
      return setError((prevState) => ({
        ...prevState,
        password: 'Passwords do not match',
      }))
    }

    setLoading(true)
    setError(emptyError)

    try {
      const user = {
        username: state.username,
        email: state.email,
        password: state.password,
        name: state.name,
      }
      const response = await Auth.register(user)

      if (response.status !== 201) {
        setError((prevState) => ({
          ...prevState,
          request: 'Failed to register',
        }))
        setLoading(false)
        return
      }

      setSuccess('You are all signed up! Now please login')
      navigate('../login', { replace: true })
    } catch (error) {
      setError((prevState) => ({
        ...prevState,
        request: 'Server error, please try again later',
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
          <Heading fontSize={'4xl'} textAlign={'center'}>
            Sign up
          </Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            to enjoy all of our cool features ✌️
          </Text>
        </Stack>

        <Box
          rounded="lg"
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow="lg"
          p={8}
        >
          <Stack py={2}>
            {success && (
              <Alert status="success">
                <AlertIcon />
                {success}
              </Alert>
            )}
          </Stack>
          <Stack py={2}>
            {error.request && (
              <Alert status="error">
                <AlertIcon />
                {error.request}
              </Alert>
            )}
          </Stack>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl
                id="name"
                isRequired
                isInvalid={submitted && state.name === ''}
              >
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  value={state.name}
                  onChange={(e) =>
                    setState((prevState) => ({
                      ...prevState,
                      name: e.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormControl
                id="username"
                isRequired
                isInvalid={submitted && state.username === ''}
              >
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  value={state.username}
                  onChange={(e) =>
                    setState((prevState) => ({
                      ...prevState,
                      username: e.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormControl
                id="email"
                isRequired
                isInvalid={submitted && state.email === ''}
              >
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  value={state.email}
                  onChange={(e) =>
                    setState((prevState) => ({
                      ...prevState,
                      email: e.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormControl
                id="password"
                isRequired
                isInvalid={
                  submitted && (state.password === '' || error.password !== '')
                }
              >
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={state.password}
                    onChange={(e) =>
                      setState((prevState) => ({
                        ...prevState,
                        password: e.target.value,
                      }))
                    }
                  />
                  <InputRightElement h="full">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setShowPassword((showPassword) => !showPassword)
                      }
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{error.password}</FormErrorMessage>
              </FormControl>
              <FormControl
                id="confirm-password"
                isRequired
                isInvalid={
                  submitted &&
                  (state.confirmPassword === '' || error.password !== '')
                }
              >
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={state.confirmPassword}
                    onChange={(e) =>
                      setState((prevState) => ({
                        ...prevState,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                  <InputRightElement h="full">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setShowConfirmPassword(
                          (showConfirmPassword) => !showConfirmPassword
                        )
                      }
                    >
                      {showConfirmPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Stack spacing={10} pt={2}>
                <Button
                  type="submit"
                  isLoading={loading}
                  size="lg"
                  bg="blue.400"
                  color="white"
                  _hover={{
                    bg: 'blue.500',
                  }}
                >
                  Sign up
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align="center">
                  Already a user ?{' '}
                  <Link as={ReactRouterLink} color="blue.400" to="/login">
                    Login
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
