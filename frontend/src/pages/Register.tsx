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
import { useNavigate } from 'react-router-dom'
import { Auth } from 'services'
import { validateEmail } from 'utils'
import logo from 'assets/logo.png'

type StateType = {
  email: string
  password: string
  name: string
  username: string
  confirmPassword: string
}

export const RegisterForm = () => {
  const [state, setState] = useState<StateType>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: '',
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
      const user = {
        username: state.username,
        email: state.email,
        password: state.password,
        name: state.name,
      }
      const response = await Auth.register(user)

      if (response.status !== 201) {
        setError('Failed to register')
        setLoading(false)
        return
      }

      setSuccess('You are all signed up! Now please login')
      navigate('../login', { replace: true })
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
          Register as a new user
        </Header>
        <Form size="large" onSubmit={handleSubmit}>
          <Segment stacked>
            {error && <Message negative content={error} />}
            {success && <Message success content={success} />}
            <Form.Input
              fluid
              required
              icon="user"
              iconPosition="left"
              placeholder="Name"
              value={state.name}
              onChange={(e) =>
                setState((prevState) => ({
                  ...prevState,
                  name: e.target.value,
                }))
              }
            />
            <Form.Input
              fluid
              required
              icon="user"
              iconPosition="left"
              placeholder="Username"
              value={state.username}
              onChange={(e) =>
                setState((prevState) => ({
                  ...prevState,
                  username: e.target.value,
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
            <Button fluid size="large" color="black" loading={loading}>
              Submit
            </Button>
          </Segment>
        </Form>

        <Message>
          <a href="login">Login</a>
        </Message>
      </Grid.Column>
    </Grid>
  )
}
