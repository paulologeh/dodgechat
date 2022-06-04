import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RequireAuth, RequireNoAuth } from 'navigation/RequireAuth'

import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  Dashboard,
  NotFound,
  ConfirmForm,
  DeleteAccountForm,
  ChangePasswordForm,
  ChangeEmail,
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
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="delete"
          element={
            <RequireAuth redirectTo="/login">
              <DeleteAccountForm />
            </RequireAuth>
          }
        />
        <Route
          path="changeemail"
          element={
            <RequireAuth redirectTo="/login">
              <ChangeEmail />
            </RequireAuth>
          }
        />
        <Route
          path="confirm"
          element={
            <RequireAuth redirectTo="/login">
              <ConfirmForm />
            </RequireAuth>
          }
        />
        <Route
          path="change-password"
          element={
            <RequireAuth redirectTo="/login">
              <ChangePasswordForm />
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
          path="passwordresetrequest"
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
