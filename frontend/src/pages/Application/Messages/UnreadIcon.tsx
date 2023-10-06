import { Box, Circle } from '@chakra-ui/react'

export const UnreadIcon = ({ count }: { count: number }) => {
  if (count === 0) {
    return null
  } else {
    return (
      <Circle size="24px" bg="tomato" color="white">
        <Box as="span" fontWeight="bold" fontSize="md">
          {count}
        </Box>
      </Circle>
    )
  }
}
