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
import { Auth } from 'services'
import logo from 'assets/logo.png'

type StateType = {
  oldPassword: string
  password: string
  confirmPassword: string
}

export const ChangePasswordForm = () => {
  const [state, setState] = useState<StateType>({
    oldPassword: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (state.confirmPassword !== state.password) {
      return setError('Passwords do not match')
    }

    setLoading(true)
    setError('')

    try {
      const response = await Auth.changePassword(
        state.oldPassword,
        state.password,
        state.confirmPassword
      )

      if (response.status === 200) {
        setSuccess('Your password has been changed')
      } else {
        setError('Failed to change password')
      }
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
          style={{ width: 70, height: 70 }}
          centered
        />
        <Header as="h2" textAlign="center">
          Change password
        </Header>
        <Form size="large" onSubmit={handleSubmit}>
          <Segment stacked>
            {loading && (
              <Loader active inline="centered" style={{ marginBottom: 10 }} />
            )}
            {error && (
              <Message
                negative
                header="Failed to change password"
                content={error}
              />
            )}
            {success && (
              <Message
                positive
                header="Successfully changed password"
                content={success}
              />
            )}
            <Form.Input
              fluid
              required
              icon="lock"
              iconPosition="left"
              placeholder="Old password"
              type="password"
              value={state.oldPassword}
              onChange={(e) =>
                setState((prevState) => ({
                  ...prevState,
                  oldPassword: e.target.value,
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
            <Button fluid size="large" color="black">
              Submit
            </Button>
          </Segment>
        </Form>
      </Grid.Column>
    </Grid>
  )
}
