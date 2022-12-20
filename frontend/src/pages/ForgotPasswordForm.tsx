import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Users } from 'api'
import { validateEmail } from 'utils'

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    if (!validateEmail(email)) {
      setError('Email address is not valid')
      setLoading(false)
      return
    }

    try {
      const response = await Users.forgotpassword(email)

      if (response.status === 200) {
        setSuccess('Request sent')
      } else {
        setError('Failed to send reset request')
      }
    } catch {
      setError('Server error, please try again later')
    }
    setLoading(false)
  }

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
          Forgot your password?
        </Heading>
        <Text
          fontSize={{ base: 'sm', sm: 'md' }}
          color={useColorModeValue('gray.800', 'gray.400')}
        >
          You&apos;ll get an email with a reset link
        </Text>
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
            <FormControl id="email">
              <Input
                placeholder="your-email@example.com"
                _placeholder={{ color: 'gray.500' }}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Request Reset
              </Button>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Flex>
  )
}
