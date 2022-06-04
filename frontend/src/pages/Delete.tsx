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
import logo from 'assets/logo.png'

type StateType = {
  password: string
}

export const DeleteAccountForm = () => {
  const [state, setState] = useState<StateType>({
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      const response = await User.delete(state.password)

      if (response.status === 200) {
        setSuccess('Your account has been deleted')
      } else {
        setError('Failed to delete account')
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
          Delete account
        </Header>
        <Form size="large" onSubmit={handleSubmit}>
          <Segment stacked>
            {loading && (
              <Loader active inline="centered" style={{ marginBottom: 10 }} />
            )}
            {error && (
              <Message negative header="Failed to delete" content={error} />
            )}
            {success && (
              <Message
                positive
                header="Successfully deleted"
                content={success}
              />
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
            <Button fluid size="large" color="black">
              Submit
            </Button>
          </Segment>
        </Form>
      </Grid.Column>
    </Grid>
  )
}
