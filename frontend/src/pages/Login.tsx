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
import { useAuth } from 'contexts/userContext'
import { validateEmail } from 'utils'
import logo from 'assets/logo.png'

type StateType = {
  email: string
  password: string
}

export const LoginForm = () => {
  const [state, setState] = useState<StateType>({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setLoggedIn, setCurrentUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!validateEmail(state.email)) {
      return setError('Email address is not valid')
    }

    setLoading(true)
    setError('')

    try {
      const response = await User.login({
        email: state.email,
        password: state.password,
      })
      if (response.status !== 200) {
        setError('Failed to login')
        setLoading(false)
        return
      }
      const data = await response.json()
      setLoggedIn(true)
      setCurrentUser(data)
      navigate('..', { replace: true })
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
          Log-in to your account
        </Header>
        <Form size="large" onSubmit={handleSubmit}>
          <Segment stacked>
            {loading && (
              <Loader active inline="centered" style={{ marginBottom: 10 }} />
            )}
            {error && (
              <Message negative header="Failed to login" content={error} />
            )}
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
            <Button fluid size="large">
              Login
            </Button>
            <div style={{ marginTop: 10 }}>
              <a
                style={{
                  color: 'black',
                  textDecoration: 'underline',
                }}
                href="forgotpassword"
              >
                Forgot password ?
              </a>
            </div>
          </Segment>
        </Form>
        <Message>
          New to us ?{' '}
          <a
            style={{
              color: 'black',
              textDecoration: 'underline',
            }}
            href="signup"
          >
            Sign up here
          </a>{' '}
          instead.
        </Message>
      </Grid.Column>
    </Grid>
  )
}
