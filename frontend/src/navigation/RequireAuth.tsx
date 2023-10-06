import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from 'contexts/userContext'

type AuthProps = {
  children: React.ReactNode
  redirectTo: string
}

export const RequireAuth: React.FC<AuthProps> = ({ children, redirectTo }) => {
  const { loggedIn } = useUser()
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
  const { loggedIn } = useUser()
  const location = useLocation()
  return !loggedIn ? (
    <>{children}</>
  ) : (
    <Navigate to={redirectTo} state={{ from: location }} />
  )
}
