import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RequireAuth, RequireNoAuth } from 'navigation/RequireAuth'
import { DashboardStoreProvider } from 'contexts/dashboardContext'
import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  Dashboard,
  NotFound,
  ConfirmAccountToken,
  VerifyEmailToken,
} from 'pages'

const RouterConfig = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route
          path="/"
          element={
            <RequireAuth redirectTo="/login">
              <DashboardStoreProvider>
                <Dashboard />
              </DashboardStoreProvider>
            </RequireAuth>
          }
        />
        <Route
          path="verifyemail"
          element={
            <RequireAuth redirectTo="/login">
              <VerifyEmailToken />
            </RequireAuth>
          }
        />
        <Route
          path="confirm"
          element={
            <RequireAuth redirectTo="/login">
              <ConfirmAccountToken />
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
          path="register"
          element={
            <RequireNoAuth redirectTo="/">
              <RegisterForm />
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
        <Route
          path="passwordreset"
          element={
            <RequireNoAuth redirectTo="/">
              <ResetPasswordForm />
            </RequireNoAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default RouterConfig
