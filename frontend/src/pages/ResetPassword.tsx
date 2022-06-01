import {
  Button,
  Form,
  Grid,
  Header,
  Image,
  Message,
  Loader,
  Segment,
} from 'semantic-ui-react'
import { useState } from 'react'
import { User } from 'services'
import { useParams, useSearchParams } from 'react-router-dom'
import logo from 'assets/logo.png'

type StateType = {
  password: string
  confirmPassword: string
}

export const ResetPasswordForm = () => {
  const [state, setState] = useState<StateType>({
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { uuid } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!uuid || !token) return setError('Invalid or expired link')
    if (state.confirmPassword !== state.password) {
      return setError('Passwords do not match')
    }

    setLoading(true)
    setError('')

    try {
      const response = await User.resetPassword(state.password, token, uuid)

      if (response.status === 200) {
        setSuccess(
          'Your password has been reset. You can now login with your new password'
        )
      } else {
        setError('Failed to reset password')
      }
    } catch (error) {
      console.error(error)
      setError('Server error, please try again later')
    }
    setLoading(false)
  }

  return (
    <Grid textAlign="center" style={{ height: '100vh' }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Image
          src={logo}
          alt="dodgechat"
          style={{ width: 100, height: 100 }}
          centered
        />
        <Header as="h2" textAlign="center">
          Reset Password
        </Header>
        <Form size="large" onSubmit={handleSubmit}>
          <Segment stacked>
            {loading && (
              <Loader active inline="centered" style={{ marginBottom: 10 }} />
            )}
            {error && (
              <Message negative header="Failed to reset" content={error} />
            )}
            {success && (
              <Message positive header="Successfully reset" content={success} />
            )}
            <Form.Input
              fluid
              required
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              type="password"
              value={state.password}
              onChange={(e) =>
                setState((prevState) => ({
                  ...prevState,
                  password: e.target.value,
                }))
              }
            />
            <Form.Input
              fluid
              required
              icon="lock"
              iconPosition="left"
              placeholder="Confirm password"
              type="password"
              value={state.confirmPassword}
              onChange={(e) =>
                setState((prevState) => ({
                  ...prevState,
                  confirmPassword: e.target.value,
                }))
              }
            />
            <Button fluid size="large">
              Submit
            </Button>
          </Segment>
        </Form>

        <Message>
          Reset successful ?{' '}
          <a
            href="/"
            style={{
              color: 'black',
              textDecoration: 'underline',
            }}
          >
            Login
          </a>
        </Message>
      </Grid.Column>
    </Grid>
  )
}
