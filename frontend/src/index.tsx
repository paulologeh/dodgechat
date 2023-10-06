// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ColorModeScript } from '@chakra-ui/react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { theme } from './theme'

const container = document.getElementById('root')
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!) // createRoot(container!) if you use TypeScript
root.render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </>
)
