import RouterConfig from './navigation/RouterConfig'
import { UserProvider } from 'contexts/userContext'

const App = () => {
  return (
    <UserProvider>
      <RouterConfig />
    </UserProvider>
  )
}

export default App
