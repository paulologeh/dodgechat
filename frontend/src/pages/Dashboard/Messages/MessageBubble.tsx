import { Card, CardBody, Flex, Text } from '@chakra-ui/react'
import { Message } from 'types/api'

const senderStyle = {
  bg: 'teal.500',
  color: 'white',
  mark: {
    color: 'white',
    textDecoration: 'underline',
  },
}

const receiverStyle = {
  bg: 'gray.100',
  '.chakra-ui-dark &': { bg: 'gray.600' },
}
type MessageProps = {
  message: Message
  isSender: boolean
}

export const MessageBubble = ({ message, isSender }: MessageProps) => {
  return (
    <Flex justify={isSender ? 'end' : 'start'}>
      <Card mb={4} sx={isSender ? senderStyle : receiverStyle}>
        <CardBody>
          <Text color={isSender ? 'white' : undefined}>{message.body}</Text>
        </CardBody>
      </Card>
    </Flex>
  )
}
