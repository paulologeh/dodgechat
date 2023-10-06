import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'

type SuccessResultProps = {
  title: string
  message: string
}

export const SuccessResult = ({ title, message }: SuccessResultProps) => {
  return (
    <Box
      textAlign="center"
      py={10}
      px={6}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <CheckCircleIcon boxSize={'50px'} color={'green.500'} />
      <Heading as="h2" size="xl" mt={6} mb={2}>
        {title}
      </Heading>
      <Text color={'gray.500'}>{message}</Text>
    </Box>
  )
}
