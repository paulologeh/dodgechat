import {
  Flex,
  Spinner,
  Stack,
  useColorModeValue,
  Image,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import logo from 'assets/logo.png'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Auth } from 'services'

export const VerifyEmailToken = () => {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const confirmToken = async () => {
    try {
      const response = await Auth.changeEmail(token)

      if (response.status === 200) {
        setSuccess('Your email has been changed. Thanks!')
      } else {
        setError('The link is invalid or has expired')
      }
    } catch (error) {
      setError('Server error, please try again later')
    }
  }

  useEffect(() => {
    setLoading(true)

    if (token) {
      confirmToken()
    } else {
      navigate('..', { replace: true })
    }

    setLoading(false)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        <Stack align="center">
          <Image
            borderRadius="full"
            boxSize="100px"
            src={logo}
            alt="dodgechat-logo"
          />
        </Stack>
        <Stack align="center">
          {loading && (
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          )}
          {success && (
            <Alert status="success">
              <AlertIcon />
              {success}
            </Alert>
          )}
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}
        </Stack>
      </Stack>
    </Flex>
  )
}
