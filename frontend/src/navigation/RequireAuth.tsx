import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from 'contexts/userContext'

type AuthProps = {
  children: React.ReactNode
  redirectTo: string
}

export const RequireAuth: React.FC<AuthProps> = ({ children, redirectTo }) => {
  const { loggedIn } = useAuth()
  const location = useLocation()
  return loggedIn ? (
    <>{children}</>
  ) : (
    <Navigate to={redirectTo} state={{ from: location }} />
  )
}

export const RequireNoAuth: React.FC<AuthProps> = ({
  children,
  redirectTo,
}) => {
  const { loggedIn } = useAuth()
  const location = useLocation()
  return !loggedIn ? (
    <>{children}</>
  ) : (
    <Navigate to={redirectTo} state={{ from: location }} />
  )
}
