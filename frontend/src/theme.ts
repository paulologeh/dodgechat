import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  config: {
    cssVarPrefix: 'ck',
    useSystemColorMode: true,
  },
})
