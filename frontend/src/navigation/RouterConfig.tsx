import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RequireAuth, RequireNoAuth } from 'navigation/RequireAuth'

import {
  LoginForm,
  SignUpForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  Dashboard,
  NotFound,
  Confirmed,
} from 'pages'

const RouterConfig = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="confirmed" element={<Confirmed />} />
        <Route
          path="/"
          element={
            <RequireAuth redirectTo="/login">
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="login"
          element={
            <RequireNoAuth redirectTo="/">
              <LoginForm />
            </RequireNoAuth>
          }
        />
        <Route
          path="signup"
          element={
            <RequireNoAuth redirectTo="/">
              <SignUpForm />
            </RequireNoAuth>
          }
        />
        <Route
          path="forgotpassword"
          element={
            <RequireNoAuth redirectTo="/">
              <ForgotPasswordForm />
            </RequireNoAuth>
          }
        />
        <Route path="resetpassword">
          <Route index element={<NotFound />} />
          <Route
            path=":uuid"
            element={
              <RequireNoAuth redirectTo="/">
                <ResetPasswordForm />
              </RequireNoAuth>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default RouterConfig
