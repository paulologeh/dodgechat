import { Card, CardBody, Flex, Text } from '@chakra-ui/react'

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
  body: string
  isSender: boolean
}

export const MessageBubble = ({ body, isSender }: MessageProps) => {
  return (
    <Flex justify={isSender ? 'end' : 'start'}>
      <Card mb={4} sx={isSender ? senderStyle : receiverStyle}>
        <CardBody>
          <Text color={isSender ? 'white' : undefined}>{body}</Text>
        </CardBody>
      </Card>
    </Flex>
  )
}
