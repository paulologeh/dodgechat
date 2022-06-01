import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from 'contexts/userContext'

type Props = {
  children: React.ReactNode
  redirectTo: string
}

export const RequireAuth: React.FC<Props> = ({ children, redirectTo }) => {
  const { loggedIn } = useAuth()
  const location = useLocation()
  return loggedIn ? (
    <>{children}</>
  ) : (
    <Navigate to={redirectTo} state={{ from: location }} />
  )
}

export const RequireNoAuth: React.FC<Props> = ({ children, redirectTo }) => {
  const { loggedIn } = useAuth()
  const location = useLocation()
  return !loggedIn ? (
    <>{children}</>
  ) : (
    <Navigate to={redirectTo} state={{ from: location }} />
  )
}
