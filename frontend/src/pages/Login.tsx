import {
  Button,
  Form,
  Grid,
  Header,
  Image,
  Message,
  Segment,
} from 'semantic-ui-react'
import { useState } from 'react'
import { Auth } from 'services'
import { useAuth } from 'contexts/userContext'
import logo from 'assets/logo.png'

type StateType = {
  emailOrUsername: string
  password: string
}

export const LoginForm = () => {
  const [state, setState] = useState<StateType>({
    emailOrUsername: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setLoggedIn, setCurrentUser } = useAuth()

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      const response = await Auth.login(state.emailOrUsername, state.password)
      if (response.status !== 200) {
        setError('Failed to login')
        setLoading(false)
        return
      }
      const data = await response.json()
      setLoggedIn(true)
      setCurrentUser(data)
    } catch (error) {
      setError('Server error, please try again later')
      setLoading(false)
    }
  }

  return (
    <Grid textAlign="center" style={{ height: '100vh' }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Image
          src={logo}
          alt="dodgechat"
          style={{ width: 70, height: 70 }}
          centered
        />
        <Header as="h2" textAlign="center">
          Log-in to your account
        </Header>
        <Form size="large" onSubmit={handleSubmit}>
          <Segment stacked>
            {error && <Message negative content={error} />}
            <Form.Input
              fluid
              required
              icon="mail"
              iconPosition="left"
              placeholder="E-mail or username"
              value={state.emailOrUsername}
              onChange={(e) =>
                setState((prevState) => ({
                  ...prevState,
                  emailOrUsername: e.target.value,
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
            <Button fluid size="large" color="black" loading={loading}>
              Login
            </Button>
            <div style={{ marginTop: 10 }}>
              <a href="passwordresetrequest">Forgot password</a>
            </div>
          </Segment>
        </Form>
        <Message>
          <a href="register">Register</a>
        </Message>
      </Grid.Column>
    </Grid>
  )
}
