import { ChakraProvider } from '@chakra-ui/react'
import { theme } from './theme'
import RouterConfig from 'navigation/RouterConfig'
import { UserProvider } from 'contexts/userContext'

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <UserProvider>
        <RouterConfig />
      </UserProvider>
    </ChakraProvider>
  )
}

export default App
