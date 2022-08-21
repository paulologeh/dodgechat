import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

export const theme: ThemeConfig = extendTheme({
  config: {
    cssVarPrefix: 'ck',
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
})
