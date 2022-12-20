import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Users } from 'api'
import { useNavigate, useSearchParams } from 'react-router-dom'

type ResetPasswordFormState = {
  password: string
  confirmPassword: string
}

export const ResetPasswordForm = () => {
  const [state, setState] = useState<ResetPasswordFormState>({
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!token) return setError('Invalid or expired link')
    if (state.confirmPassword !== state.password) {
      return setError('Passwords do not match')
    }

    setLoading(true)
    setError('')

    try {
      const response = await Users.passwordReset(state.password, token)

      if (response.status === 200) {
        setSuccess(
          'Your password has been reset. You can now login with your new password'
        )
      } else {
        setError('Failed to reset password')
      }
    } catch (error) {
      console.error(error)
      setError('Server error, please try again later')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!token) {
      navigate('../login', { replace: true })
    }
  }, [navigate, token])

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack
        spacing={4}
        w={'full'}
        maxW={'md'}
        bg={useColorModeValue('white', 'gray.700')}
        rounded={'xl'}
        boxShadow={'lg'}
        p={6}
        my={12}
      >
        <Heading lineHeight={1.1} fontSize={{ base: '2xl', md: '3xl' }}>
          Enter new password
        </Heading>
        <form onSubmit={handleSubmit}>
          <Stack spacing={6}>
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
            <FormControl id="password" isRequired>
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
            </FormControl>
            <FormControl id="confirm-password" isRequired>
              <FormLabel>Confirm password</FormLabel>
              <Input
                type="password"
                value={state.confirmPassword}
                onChange={(e) =>
                  setState((prevState) => ({
                    ...prevState,
                    confirmPassword: e.target.value,
                  }))
                }
              />
            </FormControl>
            <Stack spacing={6}>
              <Button
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                type="submit"
                isLoading={loading}
              >
                Submit
              </Button>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Flex>
  )
}
