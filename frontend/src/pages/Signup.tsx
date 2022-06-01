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
import { useNavigate } from 'react-router-dom'
import { User } from 'services'
import { validateEmail } from 'utils'
import logo from 'assets/logo.png'

type StateType = {
  email: string
  password: string
  firstName: string
  lastName: string
  confirmPassword: string
}

export const SignUpForm = () => {
  const [state, setState] = useState<StateType>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!validateEmail(state.email)) {
      return setError('Invalid email address')
    }

    if (state.confirmPassword !== state.password) {
      return setError('Passwords do not match')
    }

    setLoading(true)
    setError('')

    try {
      const responseSignUp = await User.signup(
        state.email,
        state.password,
        state.firstName,
        state.lastName
      )

      if (responseSignUp.status !== 201) {
        setError('Failed to sign up')
        setLoading(false)
        return
      }

      setSuccess('You are all signed up! Now please login')
      navigate('../login', { replace: true })
    } catch (error) {
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
          Register as a new user
        </Header>
        <Form size="large" onSubmit={handleSubmit}>
          <Segment stacked>
            {loading && (
              <Loader active inline="centered" style={{ marginBottom: 10 }} />
            )}
            {error && (
              <Message negative header="Failed to sign up" content={error} />
            )}
            {success && (
              <Message
                success
                header="Successfully signed up"
                content={success}
              />
            )}
            <Form.Input
              fluid
              required
              icon="user"
              iconPosition="left"
              placeholder="First name"
              value={state.firstName}
              onChange={(e) =>
                setState((prevState) => ({
                  ...prevState,
                  firstName: e.target.value,
                }))
              }
            />
            <Form.Input
              fluid
              required
              icon="user"
              iconPosition="left"
              placeholder="Last name"
              value={state.lastName}
              onChange={(e) =>
                setState((prevState) => ({
                  ...prevState,
                  lastName: e.target.value,
                }))
              }
            />
            <Form.Input
              fluid
              required
              icon="mail"
              iconPosition="left"
              placeholder="E-mail address"
              value={state.email}
              onChange={(e) =>
                setState((prevState) => ({
                  ...prevState,
                  email: e.target.value,
                }))
              }
            />
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
              Sign Up
            </Button>
          </Segment>
        </Form>

        <Message>
          Already have an account?{' '}
          <a
            href="login"
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
