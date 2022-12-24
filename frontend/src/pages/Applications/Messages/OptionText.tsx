import { findAll } from 'highlight-words-core'
import { Box } from '@chakra-ui/react'

interface OptionTextProps {
  searchWords: string[]
  textToHighlight: string
}

export const OptionText = ({
  searchWords,
  textToHighlight,
}: OptionTextProps) => {
  const chunks = findAll({
    searchWords,
    textToHighlight,
    autoEscape: true,
  })

  return chunks.map(
    (chunk: { end: number; highlight: number; start: number }) => {
      const { end, highlight, start } = chunk
      const text = textToHighlight.substring(start, end)
      if (highlight) {
        return (
          <Box as="mark" bg="transparent" color="teal.500" key={text}>
            {text}
          </Box>
        )
      } else {
        return text
      }
    }
  )
}
